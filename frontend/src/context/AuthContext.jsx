import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../config/firebase.js";
import { USER_ROLES } from "../utils/constants.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
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
      setEmailVerified(Boolean(user?.emailVerified));

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

  const refreshEmailVerification = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      return false;
    }

    await user.reload();
    await user.getIdToken(true);
    const refreshedUser = auth.currentUser;
    const verified = Boolean(refreshedUser?.emailVerified);
    setEmailVerified(verified);
    return verified;
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      profile,
      authLoading,
      isAuthenticated: Boolean(firebaseUser),
      isEmailVerified: Boolean(firebaseUser && emailVerified),
      refreshEmailVerification,
      isAdmin: profile?.role === USER_ROLES.ADMIN
    }),
    [firebaseUser, profile, authLoading, emailVerified, refreshEmailVerification]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
