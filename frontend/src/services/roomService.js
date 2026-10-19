import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { db, timestamp } from "../config/firebase.js";
import { ROOM_STATUS, ROOM_VISIBILITY } from "../utils/constants.js";
import { createRoomCode, sanitizeText } from "../utils/helpers.js";
export async function createRoom({
  topic,
  timerMinutes,
  participantLimit,
  visibility,
  createdBy,
  creatorName
}) {
  const roomCode = createRoomCode();

  const roomRef = await addDoc(collection(db, "gd_rooms"), {

    topic: sanitizeText(topic),

    code: roomCode,

    timerMinutes: Number(timerMinutes),

    participantLimit: Number(participantLimit),

    visibility: visibility || ROOM_VISIBILITY.PUBLIC,

    status: ROOM_STATUS.WAITING,

    createdBy,

    creatorName,

    participants: [createdBy],

    raisedHands: [],

    mutedUsers: [],

    activeSpeaker: null,

    startedAt: null,

    endedAt: null,

    createdAt: timestamp(),

    updatedAt: timestamp()
  });

  return {
    id: roomRef.id,
    code: roomCode
  };
}

export function listenToPublicRooms(callback) {
  const q = query(
    collection(db, "gd_rooms"),
    where("visibility", "==", ROOM_VISIBILITY.PUBLIC),
    where("status", "in", [ROOM_STATUS.WAITING, ROOM_STATUS.LIVE]),
    orderBy("createdAt", "desc"),
    limit(40)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data()
        }))
      );
    },
    (error) => {
      console.error("listenToPublicRooms snapshot error:", error);
      callback([]);
    }
  );
}

export async function sendMessage(roomId, message) {

  return addDoc(
    collection(db, "gd_rooms", roomId, "messages"),
    {
      senderId: message.senderId,
      senderName: message.senderName,
      text: sanitizeText(message.text),
      createdAt: timestamp()
    }
  );
}

export function listenToMessages(roomId, callback) {
  const q = query(
    collection(db, "gd_rooms", roomId, "messages"),
    orderBy("createdAt", "asc"),
    limit(200)
  );

  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      callback(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    },
    (error) => {
      console.error("listenToMessages snapshot error:", error);
      callback([]);
    }
  );
}

export async function sendSignal(roomId, signal) {
  return addDoc(collection(db, "gd_rooms", roomId, "signals"), {
    ...signal,
    createdAt: timestamp()
  });
}

export function listenToSignals(roomId, userId, callback) {
  const q = query(
    collection(db, "gd_rooms", roomId, "signals"),
    where("to", "in", [userId, "all"]),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docChanges()
        .filter((change) => change.type === "added")
        .map((change) => ({
          id: change.doc.id,
          ...change.doc.data()
        }))
    );
  });
}

export function listenToRoom(roomId, callback) {
  return onSnapshot(
    doc(db, "gd_rooms", roomId),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback({
        id: snapshot.id,
        ...snapshot.data()
      });
    },
    (error) => {
      console.error("listenToRoom snapshot error:", error);
      callback(null);
    }
  );
}

export async function getRoom(roomId) {
  const snapshot = await getDoc(doc(db, "gd_rooms", roomId));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}

export async function joinRoom(roomId, userId) {
  const room = await getRoom(roomId);

  if (!room) {
    throw new Error("Room not found.");
  }

  if (room.participants?.length >= room.participantLimit && !room.participants.includes(userId)) {
    throw new Error("Room is full.");
  }

  return updateDoc(doc(db, "gd_rooms", roomId), {
    participants: arrayUnion(userId),
    updatedAt: timestamp()
  });
}

export async function leaveRoom(roomId, userId) {
  return updateDoc(doc(db, "gd_rooms", roomId), {
    participants: arrayRemove(userId),
    raisedHands: arrayRemove(userId),
    updatedAt: timestamp()
  });
}

export async function startRoom(roomId) {
  return updateDoc(doc(db, "gd_rooms", roomId), {
    status: ROOM_STATUS.LIVE,
    startedAt: timestamp(),
    updatedAt: timestamp()
  });
}

export async function endRoom(roomId) {
  return updateDoc(doc(db, "gd_rooms", roomId), {
    status: ROOM_STATUS.ENDED,
    endedAt: timestamp(),
    updatedAt: timestamp()
  });
}

export async function raiseHand(roomId, userId) {
  return updateDoc(doc(db, "gd_rooms", roomId), {
    raisedHands: arrayUnion(userId),
    updatedAt: timestamp()
  });
}

export async function lowerHand(roomId, userId) {
  return updateDoc(doc(db, "gd_rooms", roomId), {
    raisedHands: arrayRemove(userId),
    updatedAt: timestamp()
  });
}

export async function setActiveSpeaker(roomId, userId) {
  return updateDoc(doc(db, "gd_rooms", roomId), {
    activeSpeaker: userId,
    updatedAt: timestamp()
  });
}

export async function deleteRoom(roomId) {
  return deleteDoc(doc(db, "gd_rooms", roomId));
}
