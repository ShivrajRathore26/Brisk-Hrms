import axiosClient from "./axiosClient";

export const getSettingsApi = () => axiosClient.get("/settings").then((res) => res.data);
export const updateSettingsApi = (payload) => axiosClient.put("/settings", payload).then((res) => res.data);
