import axiosClient from "./axiosClient";

export const getMyBalanceApi = () => axiosClient.get("/leaves/my-balance").then((res) => res.data);
export const getMyLeavesApi = () => axiosClient.get("/leaves/mine").then((res) => res.data);
export const applyLeaveApi = (payload) => axiosClient.post("/leaves", payload).then((res) => res.data);
export const cancelLeaveApi = (id) => axiosClient.delete(`/leaves/${id}`).then((res) => res.data);
export const getPendingApprovalsApi = () => axiosClient.get("/leaves/pending").then((res) => res.data);
export const decideLeaveApi = (id, decision) =>
  axiosClient.put(`/leaves/${id}/decide`, { decision }).then((res) => res.data);
export const getUserBalanceApi = (userId) => axiosClient.get(`/leaves/balance/${userId}`).then((res) => res.data);
export const getUserLeavesApi = (userId) => axiosClient.get(`/leaves/user/${userId}`).then((res) => res.data);
