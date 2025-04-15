import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Use the current window location's port for socket connection
const BASE_URL = import.meta.env.MODE === "development" 
  ? `http://localhost:5000` 
  : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      
      // If authentication is successful, update user data
      set({ authUser: res.data });
      get().connectSocket();
      
      // Redirect to /home if user is on root path
      if (window.location.pathname === "/") {
        window.location.href = "/home";
      }
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
      
      // Redirect to home page
      window.location.href = "/home";
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
      
      // Redirect to home page
      window.location.href = "/home";
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
      
      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    console.log("Attempting to connect socket for user:", authUser._id);
    try {
      const socket = io(BASE_URL, {
        query: {
          userId: authUser._id,
        },
        transports: ["polling", "websocket"],
        path: "/socket.io/",
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: true
      });

      // Debug connection events
      socket.on("connect", () => {
        console.log("Socket connected successfully:", socket.id);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      socket.connect();
      set({ socket: socket });

      socket.on("getOnlineUsers", (userIds) => {
        console.log("Online users received:", userIds);
        set({ onlineUsers: userIds });
      });
    } catch (error) {
      console.error("Error initializing socket:", error);
    }
  },
  
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      console.log("Disconnecting socket");
      socket.disconnect();
      set({ socket: null });
    }
  },
}));