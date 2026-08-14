import axiosClient from "./axiosClient";

export const getNotificationsApi = () => axiosClient.get("/notifications").then((res) => res.data);

export const markNotificationReadApi = (id) =>
  axiosClient.put(`/notifications/${id}/read`).then((res) => res.data);

export const markAllNotificationsReadApi = () =>
  axiosClient.put("/notifications/read-all").then((res) => res.data);
