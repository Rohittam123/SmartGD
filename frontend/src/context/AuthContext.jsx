import { createContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../config/firebase.js";
import { USER_ROLES } from "../utils/constants.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
      setFirebaseUser(user);

      if (!user) {
        setProfile(null);
        setAuthLoading(false);

        return;
      }

      setProfile(null);
      const userRef = doc(db, "users", user.uid);
      unsubscribeProfile = onSnapshot(
        userRef,
        (snap) => {
          setProfile(
            snap.exists()
              ? {
                  id: snap.id,
                  ...snap.data()
                }
              : null
          );
          setAuthLoading(false);
        },
        (error) => {
          console.error("Unable to load the signed-in user's profile:", error);
          setProfile(null);
          setAuthLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      profile,
      authLoading,
      isAuthenticated: Boolean(firebaseUser),
      isAdmin: profile?.role === USER_ROLES.ADMIN
    }),
    [firebaseUser, profile, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
