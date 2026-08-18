import axiosClient from "./axiosClient";

export const punchInApi = (location) => axiosClient.post("/attendance/punch-in", location).then((res) => res.data);
export const punchOutApi = (location) => axiosClient.post("/attendance/punch-out", location).then((res) => res.data);
export const getTodayStatusApi = () => axiosClient.get("/attendance/today").then((res) => res.data);
export const getMyHistoryApi = (params) =>
  axiosClient.get("/attendance/history", { params }).then((res) => res.data);
export const getTeamAttendanceApi = (params) =>
  axiosClient.get("/attendance/team", { params }).then((res) => res.data);
export const getUserAttendanceSummaryApi = (userId, params) =>
  axiosClient.get(`/attendance/summary/${userId}`, { params }).then((res) => res.data);
