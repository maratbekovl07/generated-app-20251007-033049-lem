import { IndexedEntity, type Env as CoreEnv } from "./core-utils";
import type { User, Chat, Message, MessageContent } from "@shared/types";
// Extend the core Env type for local usage if needed, or just use CoreEnv
type Env = CoreEnv;
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", email: "", name: "", passwordHash: "" };
  // The key for a user entity is their email.
  // The `state` passed to this method is the full user object.
  static override keyOf(state: User): string {
    return state.email.toLowerCase();
  }
  static async findById(env: Env, id: string): Promise<User | null> {
    // This is inefficient for a real app. A secondary index (e.g., id -> email) would be needed.
    // For this project, we'll iterate, which is acceptable for a small number of users.
    const { items: allUsers } = await this.list(env);
    return allUsers.find((u) => u.id === id) || null;
  }
}
export class ChatEntity extends IndexedEntity<Chat> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: Chat = {
    id: "",
    type: 'private',
    participantIds: [],
    messages: [],
    createdAt: 0,
    updatedAt: 0,
    lastReadTimestamp: {}
  };
  async addMessage(senderId: string, content: MessageContent): Promise<Message> {
    const message: Message = {
      id: crypto.randomUUID(),
      chatId: this.id,
      senderId,
      content,
      timestamp: Date.now()
    };
    await this.mutate((s) => {
      const updatedMessages = [...(s.messages || []), message];
      return { ...s, messages: updatedMessages, updatedAt: message.timestamp };
    });
    return message;
  }
  async getMessages(): Promise<Message[]> {
    const state = await this.getState();
    return state.messages || [];
  }
  async markAsRead(userId: string): Promise<void> {
    await this.mutate((s) => {
      if (!s.lastReadTimestamp) {
        s.lastReadTimestamp = {};
      }
      s.lastReadTimestamp[userId] = Date.now();
      return s;
    });
  }
}