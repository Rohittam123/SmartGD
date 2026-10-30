import { createContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { listenToUserNotifications } from "../services/notificationService.js";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { firebaseUser, isEmailVerified } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!firebaseUser || !isEmailVerified) {
      setNotifications([]);
      return undefined;
    }

    const unsubscribe = listenToUserNotifications(firebaseUser.uid, setNotifications);

    return () => unsubscribe();
  }, [firebaseUser, isEmailVerified]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const value = useMemo(
    () => ({
      notifications,
      unreadCount
    }),
    [notifications, unreadCount]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
