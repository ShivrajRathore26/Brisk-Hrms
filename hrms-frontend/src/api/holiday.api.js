import axiosClient from "./axiosClient";

export const getHolidaysApi = (params) => axiosClient.get("/holidays", { params }).then((res) => res.data);
export const getUpcomingHolidaysApi = () => axiosClient.get("/holidays/upcoming").then((res) => res.data);
export const createHolidayApi = (payload) => axiosClient.post("/holidays", payload).then((res) => res.data);
export const updateHolidayApi = (id, payload) =>
  axiosClient.put(`/holidays/${id}`, payload).then((res) => res.data);
export const deleteHolidayApi = (id) => axiosClient.delete(`/holidays/${id}`).then((res) => res.data);
