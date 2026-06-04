import { create } from "zustand";
import api from "../lib/api";

const TOKEN_KEY = "ea_auth_token";
const USER_KEY = "ea_auth_user";

const getStoredUser = () => {
    if (typeof window === "undefined") return null;

    try {
        const stored = localStorage.getItem(USER_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const useAuth = create((set) => ({
    token:
        typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
    user: getStoredUser(),
    loading: false,
    error: null,

    setToken: (token) => {
        if (token) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            delete api.defaults.headers.common["Authorization"];
            localStorage.removeItem(TOKEN_KEY);
        }
        set({ token });
    },

    setUser: (user) => {
        if (typeof window !== "undefined") {
            if (user) {
                localStorage.setItem(USER_KEY, JSON.stringify(user));
            } else {
                localStorage.removeItem(USER_KEY);
            }
        }

        set({ user });
    },

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post("/auth/login", { email, password });
            if (res.data?.success) {
                const { token, user } = res.data.data;
                set({ user });
                api.defaults.headers.common["Authorization"] =
                    `Bearer ${token}`;
                localStorage.setItem(TOKEN_KEY, token);
                localStorage.setItem(USER_KEY, JSON.stringify(user));
                set({ token, loading: false });
                return { success: true };
            }
            set({ error: res.data?.message || "Login failed", loading: false });
            return { success: false, message: res.data?.message };
        } catch (err) {
            set({ error: err.message, loading: false });
            return { success: false, message: err.message };
        }
    },

    register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post("/auth/register", {
                name,
                email,
                password,
            });
            set({ loading: false });
            return res.data;
        } catch (err) {
            set({ error: err.message, loading: false });
            return { success: false, message: err.message };
        }
    },

    logout: () => {
        api.defaults.headers.common["Authorization"] = undefined;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        set({ token: null, user: null });
    },
}));

export default useAuth;
