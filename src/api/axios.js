import axios from "axios";

const api = axios.create({
  baseURL: "https://management-backend-a3je.onrender.com/api/v1",
  withCredentials: true
});

export default api;