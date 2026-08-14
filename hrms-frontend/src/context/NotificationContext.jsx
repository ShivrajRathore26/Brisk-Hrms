import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from "../api/notification.api";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const refresh = useCallback(() => {
    if (!user) return;
    getNotificationsApi()
      .then((data) => setNotifications(data.notifications))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    refresh();
    if (!user) return;
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [user, refresh]);

  const markRead = async (id) => {
    await markNotificationReadApi(id);
    refresh();
  };

  const markAllRead = async () => {
    await markAllNotificationsReadApi();
    refresh();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, refresh, markRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
