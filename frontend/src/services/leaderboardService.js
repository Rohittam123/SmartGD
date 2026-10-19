import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where
} from "firebase/firestore";
import { db } from "../config/firebase.js";

export function listenToLeaderboard(callback, period = "weekly") {
  const q = query(
    collection(db, "leaderboard"),
    where("period", "==", period),
    orderBy("score", "desc"),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((document, index) => ({
        id: document.id,
        rank: index + 1,
        ...document.data()
      }))
    );
  });
}
