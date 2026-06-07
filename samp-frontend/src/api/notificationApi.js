import axiosInstance from "./axios";

export const getNotificationsApi = () => axiosInstance.get("/notifications");

export const getUnreadNotificationsApi = () =>
  axiosInstance.get("/notifications/unread");

export const getUnreadCountApi = () =>
  axiosInstance.get("/notifications/unread/count");

export const markAsReadApi = (id) =>
  axiosInstance.patch(`/notifications/${id}/read`);

export const markAllAsReadApi = () =>
  axiosInstance.patch("/notifications/read-all");
