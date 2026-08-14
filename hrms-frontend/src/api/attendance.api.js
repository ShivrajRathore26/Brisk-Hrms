import axiosClient from "./axiosClient";

export const punchInApi = () => axiosClient.post("/attendance/punch-in").then((res) => res.data);
export const punchOutApi = () => axiosClient.post("/attendance/punch-out").then((res) => res.data);
export const getTodayStatusApi = () => axiosClient.get("/attendance/today").then((res) => res.data);
export const getMyHistoryApi = (params) =>
  axiosClient.get("/attendance/history", { params }).then((res) => res.data);
export const getTeamAttendanceApi = (params) =>
  axiosClient.get("/attendance/team", { params }).then((res) => res.data);
