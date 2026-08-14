import axiosClient from "./axiosClient";

export const getAssetsApi = (params) => axiosClient.get("/assets", { params }).then((res) => res.data);
export const getMyAssetsApi = () => axiosClient.get("/assets/mine").then((res) => res.data);
export const createAssetApi = (payload) => axiosClient.post("/assets", payload).then((res) => res.data);
export const updateAssetApi = (id, payload) => axiosClient.put(`/assets/${id}`, payload).then((res) => res.data);
export const assignAssetApi = (payload) => axiosClient.post("/assets/assign", payload).then((res) => res.data);
export const returnAssetApi = (payload) => axiosClient.post("/assets/return", payload).then((res) => res.data);
export const getAssetHistoryApi = (userId) =>
  axiosClient.get(`/assets/history/${userId}`).then((res) => res.data);
