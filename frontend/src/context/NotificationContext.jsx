import { createContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { listenToUserNotifications } from "../services/notificationService.js";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!firebaseUser) {
      setNotifications([]);
      return undefined;
    }

    const unsubscribe = listenToUserNotifications(firebaseUser.uid, setNotifications);

    return () => unsubscribe();
  }, [firebaseUser]);

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
