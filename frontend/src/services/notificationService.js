import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  getDocs,
  where
} from "firebase/firestore";
import { db, timestamp } from "../config/firebase.js";

export function listenToUserNotifications(userId, callback) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(30)
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

export async function notifyAllUsersAboutRoom({
  roomId,
  roomCode,
  topic,
  creatorName
}) {

  const usersSnapshot = await getDocs(collection(db, "users"));

  const notifications = usersSnapshot.docs.map((userDocument) => {

    const user = userDocument.data();

    return addDoc(collection(db, "notifications"), {

      userId: userDocument.id,

      title: "New Discussion Room Opened",

      body: `${creatorName} created a new room on "${topic}"`,

      roomId,

      roomCode,

      type: "room_created",

      read: false,

      createdAt: timestamp()
    });
  });

  return Promise.all(notifications);
}

export async function createNotification(payload) {
  return addDoc(collection(db, "notifications"), {
    ...payload,
    read: false,
    createdAt: timestamp()
  });
}

export async function markNotificationRead(notificationId) {
  return updateDoc(doc(db, "notifications", notificationId), {
    read: true,
    updatedAt: timestamp()
  });
}
