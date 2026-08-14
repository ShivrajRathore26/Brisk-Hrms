import axiosClient from "./axiosClient";

export const getMyPayslipsApi = () => axiosClient.get("/payroll/my-payslips").then((res) => res.data);
export const getAllPayslipsApi = (params) =>
  axiosClient.get("/payroll/payslips", { params }).then((res) => res.data);
export const runPayrollApi = (payload) => axiosClient.post("/payroll/run", payload).then((res) => res.data);
export const getSalaryStructureApi = (userId) =>
  axiosClient.get(`/payroll/salary-structure/${userId}`).then((res) => res.data);
export const upsertSalaryStructureApi = (userId, payload) =>
  axiosClient.put(`/payroll/salary-structure/${userId}`, payload).then((res) => res.data);
