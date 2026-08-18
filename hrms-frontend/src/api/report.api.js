import axiosClient from "./axiosClient";

export const getAttendanceReportApi = (params) =>
  axiosClient.get("/reports/attendance", { params }).then((res) => res.data);
export const getLeaveReportApi = (params) => axiosClient.get("/reports/leave", { params }).then((res) => res.data);
export const getAssetReportApi = () => axiosClient.get("/reports/assets").then((res) => res.data);
