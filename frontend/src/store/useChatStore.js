import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: {}, // Map of userId to typing status
  
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
      
      // Stop typing indication after sending a message
      get().emitStopTyping();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  setTypingStatus: (userId, isTyping) => {
    const typingUsers = { ...get().typingUsers };
    if (isTyping) {
      typingUsers[userId] = true;
    } else {
      delete typingUsers[userId];
    }
    set({ typingUsers });
  },

  // Emit typing event to server
  emitTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    
    if (!socket || !selectedUser || !authUser) return;
    
    socket.emit("typing", {
      senderId: authUser._id,
      receiverId: selectedUser._id,
    });
  },
  
  // Emit stop typing event to server
  emitStopTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    
    if (!socket || !selectedUser || !authUser) return;
    
    socket.emit("stopTyping", {
      senderId: authUser._id,
      receiverId: selectedUser._id,
    });
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
      
      // Clear typing indicator when message is received
      get().setTypingStatus(newMessage.senderId, false);
    });
    
    // Listen for typing events
    socket.on("typing", ({ senderId }) => {
      get().setTypingStatus(senderId, true);
    });
    
    socket.on("stopTyping", ({ senderId }) => {
      get().setTypingStatus(senderId, false);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("stopTyping");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));