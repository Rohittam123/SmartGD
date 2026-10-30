import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider, timestamp } from "../config/firebase.js";
import { DEFAULT_AVATAR, USER_ROLES } from "../utils/constants.js";
import { claimUsername } from "./userService.js";

export async function registerWithEmail({ name, username, email, password, college = "" }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  try {
    await updateProfile(credential.user, { displayName: name });
    await claimUsername(credential.user.uid, username, {
      name,
      email,
      college,
      photoURL: credential.user.photoURL || DEFAULT_AVATAR,
      role: USER_ROLES.USER,
      bio: "",
      totalSessions: 0,
      averageScore: 0,
      rank: 0,
      createdAt: timestamp()
    });
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch (cleanupError) {
      console.error("Unable to remove incomplete account after registration failed:", cleanupError);
    }

    if (error.code === "permission-denied" || error.code === "firestore/permission-denied") {
      throw new Error(
        "Firebase blocked the profile/username save. Deploy the latest Firestore rules with `firebase deploy --only firestore:rules --project smart-gd-02`, then try registering again."
      );
    }

    throw error;
  }

  try {
    await sendEmailVerification(credential.user, {
      url: `${window.location.origin}/verify-email`,
      handleCodeInApp: false
    });
  } catch (error) {
    console.error("Account created, but the verification email could not be sent:", error);
    throw new Error(
      "Your account was created, but the verification email could not be sent. Sign in and use the resend option to try again."
    );
  }

  return credential.user;
}

export async function loginWithEmail({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function resendVerificationEmail(user) {
  if (!user) {
    throw new Error("Sign in before requesting a verification email.");
  }

  await sendEmailVerification(user, {
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: false
  });
}

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
  return signOut(auth);
}
