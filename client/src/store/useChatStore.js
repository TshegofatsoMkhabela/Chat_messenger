import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://chat-messenger-tu2j.onrender.com";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    groups: [],
    selectedUser: null,
    selectedGroup: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isRightSidebarOpen: true,

    toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axios.get(`${API_URL}/api/users`);
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error fetching users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getGroups: async () => {
        // set({ isGroupsLoading: true }); // Add loading state if needed
        try {
            const res = await axios.get(`${API_URL}/api/groups`);
            set({ groups: res.data });
        } catch (error) {
            console.error(error);
            // toast.error("Error fetching groups"); // Silent fail usually better for initial load
        }
    },

    createGroup: async (groupData) => {
        try {
            const res = await axios.post(`${API_URL}/api/groups/create`, groupData);
            set((state) => ({ groups: [res.data, ...state.groups] }));
            toast.success("Group created successfully");
            return res.data; // Return created group
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating group");
            return false;
        }
    },

    updateGroup: async (groupId, updateData) => {
        try {
            const res = await axios.put(`${API_URL}/api/groups/update/${groupId}`, updateData);
            set((state) => ({
                groups: state.groups.map(g => g._id === groupId ? res.data : g),
                selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup
            }));
            toast.success("Group updated successfully");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating group");
            return false;
        }
    },

    joinGroup: async (groupId) => {
        try {
            const res = await axios.post(`${API_URL}/api/groups/join/${groupId}`);
            set((state) => ({ groups: [res.data, ...state.groups] }));
            toast.success("Joined group successfully");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Error joining group");
            return false;
        }
    },



    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axios.get(`${API_URL}/api/messages/${userId}`);
            set({ messages: res.data.messages });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error fetching messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    getGroupMessages: async (groupId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axios.get(`${API_URL}/api/groups/${groupId}/messages`);
            set({ messages: res.data });
        } catch (error) {
            toast.error("Error fetching group messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axios.post(`${API_URL}/api/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data.newMessage] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending message");
        }
    },

    sendGroupMessage: async (messageData) => {
        const { selectedGroup, messages } = get();
        try {
            const res = await axios.post(`${API_URL}/api/groups/send/${selectedGroup._id}`, messageData);
            // The socket will likely allow us to receive our own message if we emit to room, 
            // but for instant feedback we can append it manually if the socket logic excludes sender
            // usually better to wait for socket or append optimistically. 
            // Our backend emits to room, so we will receive it via socket if we are in room.
            // But usually we append optimistically:
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error("Error sending group message");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser, selectedGroup } = get();
        // If nothing selected, maybe still listen for addedToGroup? 
        // We should listen for addedToGroup globally actually.

        const socket = useAuthStore.getState().socket;

        // Global listeners (should be moved to separate init?)
        socket.on("addedToGroup", (newGroup) => {
            set((state) => ({ groups: [newGroup, ...state.groups] }));
            toast.success(`You were added to group: ${newGroup.name}`);
        });

        socket.on("groupUpdated", (updatedGroup) => {
            set((state) => ({
                groups: state.groups.map(g => g._id === updatedGroup._id ? updatedGroup : g),
                selectedGroup: state.selectedGroup?._id === updatedGroup._id ? updatedGroup : state.selectedGroup
            }));
        });

        if (!selectedUser && !selectedGroup) return;

        // Join the group room if a group is selected
        if (selectedGroup) {
            socket.emit("joinGroup", selectedGroup._id);
        }

        socket.on("newMessage", (newMessage) => {
            const isMessageFromSelectedUser = newMessage.senderId._id === selectedUser._id;
            if (!isMessageFromSelectedUser) return;

            set({ messages: [...get().messages, newMessage] });
        });

        socket.on("newGroupMessage", (newMessage) => {
            if (selectedGroup && newMessage.groupId === selectedGroup._id) {
                // Prevent duplicates if we appended optimistically?
                // Simple check:
                const msgs = get().messages;
                if (!msgs.find(m => m._id === newMessage._id)) {
                    set({ messages: [...msgs, newMessage] });
                }
            }
        });

        socket.on("messageUpdated", (updatedMessage) => {
            // Check if it belongs to current view
            const isRelevantDiff =
                (selectedUser && (updatedMessage.senderId === selectedUser._id || updatedMessage.receiverId === selectedUser._id)) ||
                (selectedGroup && updatedMessage.groupId === selectedGroup._id);

            if (!isRelevantDiff) return;

            set({
                messages: get().messages.map((msg) =>
                    msg._id === updatedMessage._id ? updatedMessage : msg
                ),
            });
        });

    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
            socket.off("newGroupMessage");
            socket.off("messageUpdated");
            socket.off("addedToGroup");
            socket.off("groupUpdated");
        }
    },

    setSelectedUser: (selectedUser) => set({ selectedUser, selectedGroup: null }), // Clear group
    setSelectedGroup: (selectedGroup) => set({ selectedGroup, selectedUser: null }), // Clear user
}));
