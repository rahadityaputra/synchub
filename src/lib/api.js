import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = "ea_auth_token";
let isRedirectingToLogin = false;

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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const requestUrl = error?.config?.url || "";

        if (
            typeof window !== "undefined" &&
            status === 401 &&
            !requestUrl.includes("/auth/login") &&
            !requestUrl.includes("/auth/register") &&
            window.location.pathname !== "/login" &&
            window.location.pathname !== "/register" &&
            !isRedirectingToLogin
        ) {
            isRedirectingToLogin = true;
            localStorage.removeItem(TOKEN_KEY);
            delete api.defaults.headers.common["Authorization"];
            window.location.replace("/login");
        }

        return Promise.reject(error);
    },
);

export default api;
