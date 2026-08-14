import axiosClient from "./axiosClient";

export const loginApi = (email, password) =>
  axiosClient.post("/auth/login", { email, password }).then((res) => res.data);

export const getMeApi = () => axiosClient.get("/auth/me").then((res) => res.data);

export const forgotPasswordApi = (email) =>
  axiosClient.post("/auth/forgot-password", { email }).then((res) => res.data);

export const resetPasswordApi = (token, password) =>
  axiosClient.post(`/auth/reset-password/${token}`, { password }).then((res) => res.data);

export const changePasswordApi = (currentPassword, newPassword) =>
  axiosClient.put("/auth/change-password", { currentPassword, newPassword }).then((res) => res.data);
