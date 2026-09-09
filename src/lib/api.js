import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("velora_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (r) => r,
  (e) =>
    Promise.reject(
      new Error(
        e.response?.data?.message || "We could not complete that request.",
      ),
    ),
);
export default api;
