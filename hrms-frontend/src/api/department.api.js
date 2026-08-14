import axiosClient from "./axiosClient";

export const getDepartmentsApi = () => axiosClient.get("/departments").then((res) => res.data);
export const createDepartmentApi = (payload) => axiosClient.post("/departments", payload).then((res) => res.data);
export const updateDepartmentApi = (id, payload) =>
  axiosClient.put(`/departments/${id}`, payload).then((res) => res.data);
export const deleteDepartmentApi = (id) => axiosClient.delete(`/departments/${id}`).then((res) => res.data);
