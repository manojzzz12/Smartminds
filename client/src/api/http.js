import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const http = axios.create({
  baseURL: API_BASE_URL
});

http.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("sourcemind-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
