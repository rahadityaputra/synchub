import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = "ea_auth_token";

if (!baseURL) {
    throw new Error(
        "VITE_API_BASE_URL is not defined. Please set it in your Vite environment file.",
    );
}

const api = axios.create({
    baseURL,
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem(TOKEN_KEY);

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

export default api;
