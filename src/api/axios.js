import axios from "axios";

const api = axios.create({
    baseURL : import.meta.env.VITE_API_URL || "https://management-backend-a3je.onrender.com/api/v1",
    withCredentials : true
});


export default api;