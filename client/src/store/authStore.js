import { create } from "zustand";
import axios from "axios";
import { io } from "socket.io-client";

const API_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:5000/api/auth"
        : "https://chat-messenger-tu2j.onrender.com/api/auth";

const SOCKET_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:5000"
        : "https://chat-messenger-tu2j.onrender.com";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    message: null,
    socket: null,
    onlineUsers: [],

    connectSocket: () => {
        const { user, socket } = get();
        if (!user || (socket && socket.connected)) return;

        const newSocket = io(SOCKET_URL, {
            query: {
                userId: user._id,
            },
        });
        newSocket.connect();
        set({ socket: newSocket });

        newSocket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket && socket.connected) {
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    },

    signup: async (email, password, fullName) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/signup`, {
                email,
                password,
                fullName,
            });
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
            });
            get().connectSocket(); // Connect socket on signup success
        } catch (error) {
            set({
                error: error.response.data.message || "Error signing up",
                isLoading: false,
            });
            throw error;
        }
    },
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password,
            });
            set({
                isAuthenticated: true,
                user: response.data.user,
                error: null,
                isLoading: false,
            });
            get().connectSocket(); // Connect socket on login success
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error logging in",
                isLoading: false,
            });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`${API_URL}/logout`);
            get().disconnectSocket(); // Disconnect socket on logout
            set({
                user: null,
                isAuthenticated: false,
                error: null,
                isLoading: false,
            });
        } catch (error) {
            set({ error: "Error logging out", isLoading: false });
            throw error;
        }
    },
    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/verify-email`, { code });
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
            });
            return response.data;
        } catch (error) {
            set({
                error: error.response.data.message || "Error verifying email",
                isLoading: false,
            });
            throw error;
        }
    },
    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/check-auth`);
            set({
                user: response.data.user,
                isAuthenticated: true,
                isCheckingAuth: false,
            });
            get().connectSocket(); // Connect socket if auth check passes
        } catch (error) {
            console.log("Error in checkAuth:", error);
            // If 401, it just means not logged in (guest). Don't show error state.
            if (error.response?.status === 401) {
                set({ user: null, isAuthenticated: false, isCheckingAuth: false, error: null });
            } else {
                set({ error: null, isCheckingAuth: false, isAuthenticated: false });
            }
        }
    },
    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, {
                email,
            });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error:
                    error.response.data.message || "Error sending reset password email",
            });
            throw error;
        }
    },
    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/reset-password/${token}`, {
                password,
            });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response.data.message || "Error resetting password",
            });
            throw error;
        }
    },
}));
