import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { User, Chat, MessageContent } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- AUTHENTICATION ---
  app.post('/api/auth/register', async (c) => {
    const { email, name, password } = await c.req.json<{ email?: string; name?: string; password?: string }>();
    if (!isStr(email) || !isStr(name) || !isStr(password)) {
      return bad(c, 'Email, name, and password are required');
    }
    const userKey = email.toLowerCase();
    const existingUser = new UserEntity(c.env, userKey);
    if (await existingUser.exists()) {
      return bad(c, 'User with this email already exists');
    }
// Hash the password with a salt
const salt = crypto.randomUUID().replaceAll('-', '');
const data = new TextEncoder().encode(password + salt);
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
const hashedPassword = `${salt}:${hash}`;

const newUser: User = {
  id: crypto.randomUUID(),
  email: userKey,
  name: name.trim(),
  passwordHash: hashedPassword,
  avatar: `https://i.pravatar.cc/150?u=${userKey}`
};
    await UserEntity.create(c.env, newUser);
    const { passwordHash, ...userResponse } = newUser;
    return ok(c, userResponse);
  });
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json<{ email?: string; password?: string }>();
    if (!isStr(email) || !isStr(password)) {
      return bad(c, 'Email and password are required');
    }
    const userKey = email.toLowerCase();
    const userEntity = new UserEntity(c.env, userKey);
    if (!await userEntity.exists()) {
      return notFound(c, 'Invalid credentials');
    }
const user = await userEntity.getState();
const [salt, storedHash] = (user.passwordHash || '').split(':');

if (!salt || !storedHash) {
  // Fallback for legacy plain text passwords, or invalid format
  if (user.passwordHash !== password) {
    return bad(c, 'Invalid credentials');
  }
} else {
  // Verify hashed password
  const data = new TextEncoder().encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  if (hash !== storedHash) {
    return bad(c, 'Invalid credentials');
  }
}
    const { passwordHash, ...userResponse } = user;
    return ok(c, userResponse);
  });
  // --- USERS ---
  app.get('/api/users', async (c) => {
    const { items } = await UserEntity.list(c.env);
    const usersWithoutPassword = items.map(({ passwordHash, ...rest }) => rest);
    return ok(c, usersWithoutPassword);
  });
  app.get('/api/users/:id', async (c) => {
    const userId = c.req.param('id');
    const user = await UserEntity.findById(c.env, userId);
    if (!user) {
      return notFound(c, 'User not found');
    }
    const { passwordHash, ...userResponse } = user;
    return ok(c, userResponse);
  });
  app.put('/api/users/:id', async (c) => {
    const userId = c.req.param('id');
    const { name, avatar } = await c.req.json<{ name?: string; avatar?: string }>();
    const user = await UserEntity.findById(c.env, userId);
    if (!user) {
      return notFound(c, 'User not found');
    }
    const userEntity = new UserEntity(c.env, user.email);
    const updates: Partial<User> = {};
    if (isStr(name)) updates.name = name.trim();
    if (isStr(avatar)) updates.avatar = avatar.trim();
    if (Object.keys(updates).length === 0) {
      return bad(c, 'No update fields provided');
    }
    await userEntity.patch(updates);
    const updatedUser = await userEntity.getState();
    const { passwordHash, ...userResponse } = updatedUser;
    return ok(c, userResponse);
  });
  // --- CHATS ---
  app.get('/api/chats', async (c) => {
    const userId = c.req.query('userId');
    if (!isStr(userId)) {
      return bad(c, 'userId query parameter is required');
    }
    const { items: allChats } = await ChatEntity.list(c.env);
    const userChats = allChats.filter(chat => chat.participantIds.includes(userId));
    // Return chat summaries without messages
    const chatSummaries = userChats.map(({ messages, ...rest }) => rest);
    return ok(c, chatSummaries);
  });
  app.post('/api/chats', async (c) => {
    const { type, name, participantIds } = await c.req.json<{ type: 'private' | 'group', name?: string, participantIds: string[] }>();
    if (!participantIds || participantIds.length < 2) {
      return bad(c, 'At least two participants are required');
    }
    if (type === 'group' && !isStr(name)) {
      return bad(c, 'Group name is required for group chats');
    }
    const now = Date.now();
    const newChatData: Omit<Chat, 'id' | 'messages'> = {
      type,
      name: type === 'group' ? name : undefined,
      avatar: type === 'group' ? `https://i.pravatar.cc/150?u=${crypto.randomUUID()}` : undefined,
      participantIds,
      createdAt: now,
      updatedAt: now,
      lastReadTimestamp: {},
    };
    const created = await ChatEntity.create(c.env, {
      id: crypto.randomUUID(),
      ...newChatData,
      messages: [],
    });
    return ok(c, created);
  });
  app.get('/api/chats/:chatId', async (c) => {
    const chatId = c.req.param('chatId');
    const chatEntity = new ChatEntity(c.env, chatId);
    if (!await chatEntity.exists()) {
      return notFound(c, 'Chat not found');
    }
    const chat = await chatEntity.getState();
    return ok(c, chat);
  });
  app.post('/api/chats/:chatId/read', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId } = await c.req.json<{ userId: string }>();
    if (!isStr(userId)) {
      return bad(c, 'userId is required');
    }
    const chatEntity = new ChatEntity(c.env, chatId);
    if (!await chatEntity.exists()) {
      return notFound(c, 'Chat not found');
    }
    await chatEntity.markAsRead(userId);
    return ok(c, { success: true });
  });
  // --- MESSAGES ---
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const chatEntity = new ChatEntity(c.env, chatId);
    if (!await chatEntity.exists()) {
      return notFound(c, 'Chat not found');
    }
    const messages = await chatEntity.getMessages();
    return ok(c, messages);
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { senderId, content } = await c.req.json<{ senderId: string; content: MessageContent }>();
    if (!isStr(senderId) || !content) {
      return bad(c, 'senderId and content are required');
    }
    const chatEntity = new ChatEntity(c.env, chatId);
    if (!await chatEntity.exists()) {
      return notFound(c, 'Chat not found');
    }
    const message = await chatEntity.addMessage(senderId, content);
    return ok(c, message);
  });
}