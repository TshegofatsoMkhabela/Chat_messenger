import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import { io } from "socket.io-client"


const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    // Check if user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check-auth");
            if (data.success) {
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            console.log("Error in checkAuth:", error);
            setAuthUser(null);
        }
    }

    // Login function to handle user authentication and socket connection

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token)
                toast.success(data.message)
                return true; // Return true on success
            } else {
                toast.error(data.message)
                return false;
            }
        } catch (error) {
            toast.error(error.message)
            return false;
        }
    }

    // Logout function to handle user logout and socket disconnection

    const logout = async () => {
        try {
            await axios.post("/api/auth/logout");
            localStorage.removeItem("token");
            setToken(null);
            setAuthUser(null);
            setOnlineUsers([]);
            axios.defaults.headers.common["token"] = null;
            toast.success("Logged out successfully");
            socket.disconnect();
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Update profile function to handle user profile updates

    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/users/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Verify email function
    const verifyEmail = async (code) => {
        try {
            const { data } = await axios.post("/api/auth/verify-email", { code });
            if (data.success) {
                setAuthUser(data.user);
                localStorage.setItem("token", data.token); // Store token if returned on verify
                if (data.token) {
                    setToken(data.token);
                    axios.defaults.headers.common["token"] = data.token;
                }
                toast.success("Email verified successfully");
                return true;
            }
            return false;
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
            return false;
        }
    }

    // Connect socket function to handle socket connection and online users updates
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        })
    }

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();
    }, [])

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        verifyEmail
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}