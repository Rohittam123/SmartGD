import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  updateDoc,
  where
} from "firebase/firestore";
import { db, timestamp } from "../config/firebase.js";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function normalizeUsername(username) {
  return username.trim().replace(/^@/, "").toLowerCase();
}

export function isValidUsername(username) {
  return /^[a-z0-9_]{3,20}$/.test(normalizeUsername(username));
}

export function listenToUserProfile(userId, callback) {
  return onSnapshot(doc(db, "users", userId), (snapshot) => {
    callback({
      id: snapshot.id,
      ...snapshot.data()
    });
  });
}

export async function claimUsername(userId, username, profile = {}) {
  const normalizedUsername = normalizeUsername(username);

  if (!isValidUsername(normalizedUsername)) {
    throw new Error("Username must be 3-20 characters using letters, numbers, or underscores.");
  }

  const usernameRef = doc(db, "usernames", normalizedUsername);
  const userRef = doc(db, "users", userId);

  await runTransaction(db, async (transaction) => {
    const usernameSnapshot = await transaction.get(usernameRef);

    if (usernameSnapshot.exists() && usernameSnapshot.data().uid !== userId) {
      throw new Error("That username is already taken. Please choose another.");
    }

    if (!usernameSnapshot.exists()) {
      transaction.set(usernameRef, {
        uid: userId,
        createdAt: timestamp()
      });
    }

    transaction.set(
      userRef,
      {
        ...profile,
        username: normalizedUsername,
        uid: userId,
        updatedAt: timestamp()
      },
      { merge: true }
    );
  });
}

export async function searchUsersByUsername(searchTerm, max = 20) {
  const username = normalizeUsername(searchTerm);
  if (username.length < 2) {
    return [];
  }

  const usersQuery = query(
    collection(db, "users"),
    orderBy("username"),
    where("username", ">=", username),
    where("username", "<=", `${username}\uf8ff`),
    limit(max)
  );
  const snapshot = await getDocs(usersQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));
}

export async function getUserByUsername(username) {
  const normalizedUsername = normalizeUsername(username);
  const usernameSnapshot = await getDoc(doc(db, "usernames", normalizedUsername));

  if (!usernameSnapshot.exists()) {
    return null;
  }

  const userSnapshot = await getDoc(doc(db, "users", usernameSnapshot.data().uid));
  if (!userSnapshot.exists() || userSnapshot.data().username !== normalizedUsername) {
    return null;
  }

  return {
    id: userSnapshot.id,
    ...userSnapshot.data()
  };
}

export async function updateUserProfile(userId, payload) {
  return updateDoc(doc(db, "users", userId), {
    ...payload,
    updatedAt: timestamp()
  });
}

export async function uploadUserAvatar(userId, file, onProgress) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Profile photo uploads are not configured. Set the Cloudinary cloud name and upload preset.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file for your profile photo.");
  }

  if (file.size >= MAX_AVATAR_SIZE) {
    throw new Error("Profile photos must be smaller than 2 MB.");
  }

  const uploadResponse = await new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/image/upload`
    );
    request.timeout = 30000;
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    });
    request.addEventListener("load", () => {
      let response;
      try {
        response = JSON.parse(request.responseText);
      } catch {
        reject(new Error("Cloudinary returned an invalid upload response."));
        return;
      }

      if (request.status < 200 || request.status >= 300) {
        reject(new Error(response.error?.message || "Cloudinary could not upload this photo."));
        return;
      }

      if (!response.secure_url) {
        reject(new Error("Cloudinary did not return a secure profile photo URL."));
        return;
      }

      resolve(response);
    });
    request.addEventListener("error", () => {
      reject(new Error("Could not connect to Cloudinary. Check your internet connection and try again."));
    });
    request.addEventListener("timeout", () => {
      reject(new Error("Profile photo upload timed out. Please try again."));
    });
    request.addEventListener("abort", () => {
      reject(new Error("Profile photo upload was cancelled."));
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    request.send(formData);
  });

  const photoURL = uploadResponse.secure_url;
  await updateUserProfile(userId, { photoURL });

  return photoURL;
}

export async function getUsers(max = 100) {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(max));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));
}
