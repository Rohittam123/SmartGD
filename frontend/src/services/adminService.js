import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch
} from "firebase/firestore";
import { db, timestamp } from "../config/firebase.js";

const ADMIN_LIST_LIMIT = 100;

function mapDocuments(snapshot) {
  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));
}

function logAdminAction(batch, actorId, action, targetType, targetId, details = {}) {
  const logRef = doc(collection(db, "admin_logs"));
  batch.set(logRef, {
    actorId,
    action,
    targetType,
    targetId,
    details,
    createdAt: timestamp()
  });
}

export function listenToAdminData({ onUsers, onRooms, onReports, onError }) {
  const unsubscribeUsers = onSnapshot(
    query(collection(db, "users"), orderBy("createdAt", "desc"), limit(ADMIN_LIST_LIMIT)),
    (snapshot) => onUsers(mapDocuments(snapshot)),
    onError
  );
  const unsubscribeRooms = onSnapshot(
    query(collection(db, "gd_rooms"), orderBy("createdAt", "desc"), limit(ADMIN_LIST_LIMIT)),
    (snapshot) => onRooms(mapDocuments(snapshot)),
    onError
  );
  const unsubscribeReports = onSnapshot(
    query(collection(db, "ai_reports"), orderBy("createdAt", "desc"), limit(ADMIN_LIST_LIMIT)),
    (snapshot) => onReports(mapDocuments(snapshot)),
    onError
  );

  return () => {
    unsubscribeUsers();
    unsubscribeRooms();
    unsubscribeReports();
  };
}

export async function getAdminMetrics() {
  const [users, rooms, activeRooms, reports] = await Promise.all([
    getCountFromServer(collection(db, "users")),
    getCountFromServer(collection(db, "gd_rooms")),
    getCountFromServer(query(collection(db, "gd_rooms"), where("status", "==", "live"))),
    getCountFromServer(collection(db, "ai_reports"))
  ]);

  return {
    users: users.data().count,
    rooms: rooms.data().count,
    activeRooms: activeRooms.data().count,
    reports: reports.data().count
  };
}

export async function updateAdminUser(actorId, userId, { name, role }) {
  const batch = writeBatch(db);
  batch.update(doc(db, "users", userId), {
    name: name.trim(),
    role,
    updatedAt: timestamp()
  });
  logAdminAction(batch, actorId, "update", "user", userId, { name: name.trim(), role });
  await batch.commit();
}

export async function deleteAdminUser(actorId, user) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "users", user.id));

  if (user.username) {
    batch.delete(doc(db, "usernames", user.username));
  }

  logAdminAction(batch, actorId, "delete", "user_profile", user.id, {
    username: user.username || null
  });
  await batch.commit();
}

export async function updateAdminRoom(actorId, roomId, { topic, status }) {
  const batch = writeBatch(db);
  batch.update(doc(db, "gd_rooms", roomId), {
    topic: topic.trim(),
    status,
    updatedAt: timestamp()
  });
  logAdminAction(batch, actorId, "update", "room", roomId, { topic: topic.trim(), status });
  await batch.commit();
}

export async function deleteAdminRoom(actorId, roomId) {
  const subcollections = ["messages", "signals", "transcripts"];
  const snapshots = await Promise.all(
    subcollections.map((name) => getDocs(collection(db, "gd_rooms", roomId, name)))
  );
  const childDocuments = snapshots.flatMap((snapshot) => snapshot.docs);

  for (let offset = 0; offset < childDocuments.length; offset += 450) {
    const batch = writeBatch(db);
    childDocuments.slice(offset, offset + 450).forEach((document) => batch.delete(document.ref));

    if (offset + 450 >= childDocuments.length) {
      batch.delete(doc(db, "gd_rooms", roomId));
      logAdminAction(batch, actorId, "delete", "room", roomId, {
        deletedChildRecords: childDocuments.length
      });
    }

    await batch.commit();
  }

  if (childDocuments.length === 0) {
    const batch = writeBatch(db);
    batch.delete(doc(db, "gd_rooms", roomId));
    logAdminAction(batch, actorId, "delete", "room", roomId, { deletedChildRecords: 0 });
    await batch.commit();
  }
}

export async function deleteAdminReport(actorId, reportId) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "ai_reports", reportId));
  logAdminAction(batch, actorId, "delete", "ai_report", reportId);
  await batch.commit();
}
