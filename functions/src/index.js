import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import {
  evaluateDiscussion,
  generateSummary,
  generateTopic,
  mentorReply
} from "./gemini.js";
import {
  evaluateSchema,
  summarySchema,
  topicSchema,
  mentorSchema
} from "./validators.js";

admin.initializeApp();

const db = admin.firestore();

const app = express();

app.use(
  cors({
    origin: process.env.APP_ORIGIN ? process.env.APP_ORIGIN.split(",") : true,
    credentials: true
  })
);

app.use(helmet());
app.use(express.json({ limit: "2mb" }));

async function verifyAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing authorization token." });
    }

    const token = header.replace("Bearer ", "");
    const decoded = await admin.auth().verifyIdToken(token);

    if (!decoded.email_verified) {
      return res.status(403).json({ message: "Verify your email before accessing this service." });
    }

    const profileSnapshot = await db.collection("users").doc(decoded.uid).get();
    const username = profileSnapshot.data()?.username;
    if (!username) {
      return res.status(403).json({ message: "Choose a username before accessing this service." });
    }
    const usernameSnapshot = await db.collection("usernames").doc(username).get();
    if (!usernameSnapshot.exists || usernameSnapshot.data()?.uid !== decoded.uid) {
      return res.status(403).json({ message: "Choose a valid unique username before accessing this service." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error(error);
    return res.status(401).json({ message: "Invalid authorization token." });
  }
}

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "smart-gd-functions"
  });
});

app.post("/evaluate", verifyAuth, async (req, res) => {
  try {
    const payload = evaluateSchema.parse(req.body);

    if (payload.userId !== req.user.uid) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const report = await evaluateDiscussion(payload);

    const docRef = await db.collection("ai_reports").add({
      ...report,
      userId: req.user.uid,
      roomId: payload.roomId,
      topic: payload.topic,
      transcript: payload.transcript.slice(0, 20000),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.collection("notifications").add({
      userId: req.user.uid,
      type: "AI_REPORT_READY",
      title: "AI report is ready",
      message: `Your performance report for "${payload.topic}" is ready.`,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      id: docRef.id,
      ...report
    });
  } catch (error) {
    logger.error(error);
    res.status(400).json({
      message: error.message || "Evaluation failed."
    });
  }
});

app.post("/summary", verifyAuth, async (req, res) => {
  try {
    const payload = summarySchema.parse(req.body);
    const summary = await generateSummary(payload);

    res.json(summary);
  } catch (error) {
    logger.error(error);
    res.status(400).json({
      message: error.message || "Summary generation failed."
    });
  }
});

app.post("/topic", verifyAuth, async (req, res) => {
  try {
    const payload = topicSchema.parse(req.body);
    const topic = await generateTopic(payload);

    res.json(topic);
  } catch (error) {
    logger.error(error);
    res.status(400).json({
      message: error.message || "Topic generation failed."
    });
  }
});

app.post("/mentor", verifyAuth, async (req, res) => {
  try {
    const payload = mentorSchema.parse(req.body);
    const reply = await mentorReply(payload);

    res.json(reply);
  } catch (error) {
    logger.error(error);
    res.status(400).json({
      message: error.message || "Mentor response failed."
    });
  }
});

export const api = onRequest(
  {
    region: "us-central1",
    secrets: ["GEMINI_API_KEY"]
  },
  app
);

export const notifyUsersOnRoomCreate = onDocumentCreated("gd_rooms/{roomId}", async (event) => {
  try {
    const room = event.data?.data();
    const roomId = event.data?.ref?.id;

    if (!room || !roomId) {
      return;
    }

    const creatorName = room.creatorName || "Someone";
    const roomCode = room.code || "unknown";
    const topic = room.topic || "a new room";
    const creatorUid = room.createdBy;

    const usersSnapshot = await db.collection("users").get();

    let batch = db.batch();
    let batchCount = 0;

    usersSnapshot.forEach((userDoc) => {
      if (!userDoc.exists || userDoc.id === creatorUid) {
        return;
      }

      const notificationRef = db.collection("notifications").doc();
      batch.set(notificationRef, {
        userId: userDoc.id,
        type: "ROOM_CREATED",
        title: `New room created by ${creatorName}`,
        message: `${creatorName} opened a room (${roomCode}) about ${topic}. Join the discussion!`,
        roomId,
        roomCode,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      batchCount += 1;

      if (batchCount >= 450) {
        batch.commit().catch((error) => logger.error("Room notification batch commit failed:", error));
        batch = db.batch();
        batchCount = 0;
      }
    });

    if (batchCount > 0) {
      await batch.commit();
    }
  } catch (error) {
    logger.error("notifyUsersOnRoomCreate failed:", error);
  }
});
