// http-common.js
import axios from "axios";
const API_BASE_URL = "https://safecar-backend-production-fe3b.up.railway.app/api/v1";

const http = axios.create({ baseURL: API_BASE_URL });

http.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
    }
    return config;
});

export default http;
