import axiosClient from "./axiosClient";

export const getUsersApi = (params) => axiosClient.get("/users", { params }).then((res) => res.data);
export const getTeamApi = () => axiosClient.get("/users/team").then((res) => res.data);
export const getUserApi = (id) => axiosClient.get(`/users/${id}`).then((res) => res.data);
export const createUserApi = (payload) => axiosClient.post("/users", payload).then((res) => res.data);
export const updateUserApi = (id, payload) => axiosClient.put(`/users/${id}`, payload).then((res) => res.data);
export const updateMyProfileApi = (formData) =>
  axiosClient
    .put("/users/me", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((res) => res.data);
