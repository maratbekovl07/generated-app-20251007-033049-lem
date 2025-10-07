export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// USER
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  passwordHash?: string; // Only for backend
}
// MESSAGE
export type MessageContent = {
  type: 'text';
  text: string;
} | {
  type: 'image';
  url: string;
} | {
  type: 'file';
  url: string;
  fileName: string;
  fileSize: number;
};
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: MessageContent;
  timestamp: number; // epoch millis
}
// CHAT
export interface Chat {
  id:string;
  type: 'private' | 'group';
  name?: string; // For group chats
  avatar?: string; // For group chats
  participantIds: string[];
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  lastReadTimestamp?: { [participantId: string]: number };
}