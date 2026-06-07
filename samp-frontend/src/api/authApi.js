import axiosInstance from "./axios";

export const loginApi = (credentials) =>
  axiosInstance.post("/auth/login", credentials);

export const registerApi = (userData) =>
  axiosInstance.post("/auth/register", userData);
