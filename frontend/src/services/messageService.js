import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";
import { db, timestamp } from "../config/firebase.js";
import { sanitizeText } from "../utils/helpers.js";

export function listenToRoomMessages(roomId, callback) {
  const q = query(
    collection(db, "gd_rooms", roomId, "messages"),
    orderBy("createdAt", "asc"),
    limit(200)
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
      }))
    );
  });
}

export async function sendRoomMessage(roomId, payload) {
  return addDoc(collection(db, "gd_rooms", roomId, "messages"), {
    roomId,
    senderId: payload.senderId,
    senderName: payload.senderName,
    senderPhoto: payload.senderPhoto || "",
    text: sanitizeText(payload.text),
    type: payload.type || "text",
    createdAt: timestamp()
  });
}

export async function saveTranscript(roomId, payload) {
  return addDoc(collection(db, "gd_rooms", roomId, "transcripts"), {
    roomId,
    userId: payload.userId,
    userName: payload.userName,
    text: sanitizeText(payload.text),
    createdAt: timestamp()
  });
}

export function listenToTranscripts(roomId, callback) {
  const q = query(
    collection(db, "gd_rooms", roomId, "transcripts"),
    orderBy("createdAt", "asc"),
    limit(300)
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
      }))
    );
  });
}
