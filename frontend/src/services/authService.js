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
import { auth, googleProvider } from "../config/firebase.js";

export async function registerWithEmail({ name, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  try {
    await updateProfile(credential.user, { displayName: name });
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch (cleanupError) {
      console.error("Unable to remove the incomplete account after registration failed:", cleanupError);
    }

    console.error("Unable to prepare the new account for email verification:", error);
    throw new Error("We couldn't complete registration. Please try again.");
  }

  try {
    await sendEmailVerification(credential.user, {
      url: `${window.location.origin}/verify-email`,
      handleCodeInApp: false
    });
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch (cleanupError) {
      console.error("Unable to remove the unverified account after registration failed:", cleanupError);
    }

    console.error("Unable to send email verification for the new account:", error);
    throw new Error("We couldn't send your verification email. Please try registering again.");
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
