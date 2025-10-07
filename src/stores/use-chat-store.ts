import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User, Chat, Message, MessageContent } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from '@/components/ui/sonner';
export type ChatState = {
  loggedInUser: User | null;
  users: User[];
  chats: Chat[];
  selectedChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  activeChatPollingId: number | null;
  globalPollingId: number | null;
  unreadCounts: Record<string, number>;
};
export type ChatActions = {
  fetchInitialData: () => Promise<void>;
  selectChat: (chatId: string | null) => void;
  sendMessage: (chatId: string, content: MessageContent) => Promise<void>;
  addMessageToChat: (message: Message) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  createChat: (data: { type: 'private' | 'group'; name?: string; participantIds: string[] }) => Promise<void>;
  updateUserProfile: (userId: string, data: { name?: string; avatar?: string }) => Promise<void>;
  startActiveChatPolling: (chatId: string) => void;
  stopActiveChatPolling: () => void;
  startGlobalPolling: () => void;
  stopGlobalPolling: () => void;
  markChatAsRead: (chatId: string) => Promise<void>;
};
const initialState: ChatState = {
  loggedInUser: null,
  users: [],
  chats: [],
  selectedChat: null,
  isLoading: false,
  error: null,
  activeChatPollingId: null,
  globalPollingId: null,
  unreadCounts: {},
};
export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      fetchInitialData: async () => {
        const loggedInUser = get().loggedInUser;
        if (!loggedInUser) return;
        set({ isLoading: true, error: null });
        try {
          const users = await api<User[]>('/api/users');
          const chats = await api<Chat[]>(`/api/chats?userId=${loggedInUser.id}`);
          set({ users, chats, isLoading: false });
          get().startGlobalPolling();
          if (chats.length > 0) {
            const sortedChats = [...chats].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            get().selectChat(sortedChats[0].id);
          } else {
            set({ selectedChat: null });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch initial data';
          console.error("Error fetching initial data:", errorMessage);
          set({ error: errorMessage, isLoading: false });
        }
      },
      selectChat: async (chatId: string | null) => {
        get().stopActiveChatPolling();
        if (!chatId) {
          set({ selectedChat: null });
          return;
        }
        const currentChat = get().chats.find(c => c.id === chatId);
        // Only fetch if we don't have the chat or it's a summary without messages
        if (!currentChat || !currentChat.messages || currentChat.messages.length === 0) {
          try {
            const fullChat = await api<Chat>(`/api/chats/${chatId}`);
            set(state => {
              const chatIndex = state.chats.findIndex(c => c.id === chatId);
              if (chatIndex !== -1) {
                state.chats[chatIndex] = fullChat;
              } else {
                state.chats.push(fullChat);
              }
              state.selectedChat = fullChat;
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chat details';
            console.error(`Error fetching chat ${chatId}:`, errorMessage);
            set({ error: errorMessage });
          }
        } else {
           set({ selectedChat: currentChat });
        }
        await get().markChatAsRead(chatId);
        get().startActiveChatPolling(chatId);
      },
      sendMessage: async (chatId, content) => {
        const loggedInUser = get().loggedInUser;
        if (!loggedInUser) throw new Error("Cannot send message, user not logged in.");
        try {
          const newMessage = await api<Message>(`/api/chats/${chatId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ senderId: loggedInUser.id, content }),
          });
          get().addMessageToChat(newMessage);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
          console.error("Error sending message:", errorMessage);
          set({ error: errorMessage });
          throw error;
        }
      },
      addMessageToChat: (message: Message) => {
        set(state => {
          const chat = state.chats.find(c => c.id === message.chatId);
          if (chat) {
            if (!chat.messages) chat.messages = [];
            chat.messages.push(message);
            chat.updatedAt = message.timestamp;
          }
          if (state.selectedChat && state.selectedChat.id === message.chatId) {
            if (!state.selectedChat.messages) state.selectedChat.messages = [];
            state.selectedChat.messages.push(message);
            state.selectedChat.updatedAt = message.timestamp;
          }
        });
      },
      login: async (email, password) => {
        try {
          const user = await api<User>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          set({ loggedInUser: user, error: null, unreadCounts: {} });
          await get().fetchInitialData();
        } catch (error) {
          console.error("Login failed:", error);
          set({ error: error instanceof Error ? error.message : 'Login failed' });
          throw error;
        }
      },
      register: async (name, email, password) => {
        try {
          await api<User>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
          });
        } catch (error) {
          console.error("Registration failed:", error);
          set({ error: error instanceof Error ? error.message : 'Registration failed' });
          throw error;
        }
      },
      logout: () => {
        get().stopActiveChatPolling();
        get().stopGlobalPolling();
        set({ ...initialState, loggedInUser: null });
      },
      createChat: async (data) => {
        try {
          const newChat = await api<Chat>('/api/chats', {
            method: 'POST',
            body: JSON.stringify(data),
          });
          set(state => {
            state.chats.push(newChat);
          });
          get().selectChat(newChat.id);
        } catch (error) {
          console.error("Failed to create chat:", error);
          set({ error: error instanceof Error ? error.message : 'Failed to create chat' });
          throw error;
        }
      },
      updateUserProfile: async (userId, data) => {
        try {
          const updatedUser = await api<User>(`/api/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
          });
          set(state => {
            if (state.loggedInUser && state.loggedInUser.id === userId) {
              state.loggedInUser = { ...state.loggedInUser, ...updatedUser };
            }
            const userIndex = state.users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
              state.users[userIndex] = { ...state.users[userIndex], ...updatedUser };
            }
          });
        } catch (error) {
          console.error("Failed to update profile:", error);
          set({ error: error instanceof Error ? error.message : 'Failed to update profile' });
          throw error;
        }
      },
      startActiveChatPolling: (chatId: string) => {
        get().stopActiveChatPolling();
        const intervalId = window.setInterval(async () => {
          try {
            const fullChat = await api<Chat>(`/api/chats/${chatId}`);
            const { selectedChat } = get();
            if (selectedChat && selectedChat.id === chatId) {
              if (fullChat.messages.length > (selectedChat.messages?.length || 0)) {
                set(state => {
                  if (state.selectedChat && state.selectedChat.id === chatId) {
                    const existingMessageIds = new Set(state.selectedChat.messages.map(m => m.id));
                    const newMessages = fullChat.messages.filter(m => !existingMessageIds.has(m.id));
                    if (newMessages.length > 0) {
                      state.selectedChat.messages.push(...newMessages);
                    }
                    state.selectedChat.updatedAt = fullChat.updatedAt;
                    state.selectedChat.lastReadTimestamp = fullChat.lastReadTimestamp;
                  }
                  const chatIndex = state.chats.findIndex(c => c.id === chatId);
                  if (chatIndex !== -1) {
                    // Also update the summary chat in the main list
                    state.chats[chatIndex].updatedAt = fullChat.updatedAt;
                    state.chats[chatIndex].lastReadTimestamp = fullChat.lastReadTimestamp;
                  }
                });
                await get().markChatAsRead(chatId);
              }
            }
          } catch (error) {
            console.error(`Polling failed for chat ${chatId}:`, error);
            get().stopActiveChatPolling();
          }
        }, 3000);
        set({ activeChatPollingId: intervalId });
      },
      stopActiveChatPolling: () => {
        const intervalId = get().activeChatPollingId;
        if (intervalId) {
          window.clearInterval(intervalId);
          set({ activeChatPollingId: null });
        }
      },
      startGlobalPolling: () => {
        get().stopGlobalPolling();
        const intervalId = window.setInterval(async () => {
          const { loggedInUser, chats: localChats, selectedChat } = get();
          if (!loggedInUser) return;
          try {
            const remoteChats = await api<Chat[]>(`/api/chats?userId=${loggedInUser.id}`);
            set(state => {
              remoteChats.forEach(remoteChat => {
                const localChat = state.chats.find(c => c.id === remoteChat.id);
                if (localChat && remoteChat.updatedAt > localChat.updatedAt) {
                  // New message detected in a background chat
                  if (state.selectedChat?.id !== remoteChat.id) {
                    // Fetch full chat to get accurate message count
                    api<Chat>(`/api/chats/${remoteChat.id}`).then(fullChat => {
                      set(draft => {
                        const user = draft.loggedInUser;
                        if (!user) return;
                        const lastRead = fullChat.lastReadTimestamp?.[user.id] || 0;
                        const unreadMessages = fullChat.messages.filter(m => m.timestamp > lastRead);
                        draft.unreadCounts[remoteChat.id] = unreadMessages.length;
                      });
                    }).catch(err => console.error(`Failed to fetch chat ${remoteChat.id} for unread count`, err));
                  }
                  // Update local chat summary
                  localChat.updatedAt = remoteChat.updatedAt;
                } else if (!localChat) {
                  // A new chat has appeared
                  state.chats.push(remoteChat);
                }
              });
            });
          } catch (error) {
            console.error('Global polling failed:', error);
          }
        }, 5000); // Poll every 5 seconds
        set({ globalPollingId: intervalId });
      },
      stopGlobalPolling: () => {
        const intervalId = get().globalPollingId;
        if (intervalId) {
          window.clearInterval(intervalId);
          set({ globalPollingId: null });
        }
      },
      markChatAsRead: async (chatId: string) => {
        const { loggedInUser } = get();
        if (!loggedInUser) return;
        try {
          set(state => {
            state.unreadCounts[chatId] = 0;
          });
          await api(`/api/chats/${chatId}/read`, {
            method: 'POST',
            body: JSON.stringify({ userId: loggedInUser.id }),
          });
          set(state => {
            const chat = state.chats.find(c => c.id === chatId);
            if (chat) {
              if (!chat.lastReadTimestamp) chat.lastReadTimestamp = {};
              chat.lastReadTimestamp[loggedInUser.id] = Date.now();
            }
            if (state.selectedChat && state.selectedChat.id === chatId) {
              if (!state.selectedChat.lastReadTimestamp) state.selectedChat.lastReadTimestamp = {};
              state.selectedChat.lastReadTimestamp[loggedInUser.id] = Date.now();
            }
          });
        } catch (error) {
          console.error(`Failed to mark chat ${chatId} as read:`, error);
        }
      },
    })),
    {
      name: 'fluent-messenger-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ loggedInUser: state.loggedInUser }),
    }
  )
);