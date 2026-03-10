import type { Chat, ChatMember, Message } from '../types/chat';
import { getUserIdFromJwt } from './client';

const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api/v1/messages`;

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = localStorage.getItem('access_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const userId = getUserIdFromJwt();
  if (userId) headers['X-User-Id'] = userId;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Unknown error' })) as Record<string, unknown>;
    throw new Error(typeof body['detail'] === 'string' ? body['detail'] : 'Unknown error');
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export const chatsApi = {
  getMyChats: () =>
    req<Chat[]>('/chats/'),

  getChat: (chatId: number) =>
    req<Chat>(`/chats/${chatId}`),

  createChat: (name: string) =>
    req<Chat>('/chats/', { method: 'POST', body: JSON.stringify({ name }) }),

  getMembers: (chatId: number) =>
    req<ChatMember[]>(`/chats/${chatId}/members`),

  addMember: (chatId: number, userId: string) =>
    req<ChatMember>(`/chats/${chatId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),

  removeMember: (chatId: number, userId: string) =>
    req<void>(`/chats/${chatId}/members/${userId}`, { method: 'DELETE' }),

  getMessages: (chatId: number, limit = 50, offset = 0) =>
    req<Message[]>(`/messages/chats/${chatId}/messages/?limit=${limit}&offset=${offset}`),

  sendMessage: (chatId: number, content: string, senderId: string) =>
    req<{ id: number; content: string }>(`/messages/?chat_id=${chatId}&content=${encodeURIComponent(content)}&sender_id=${senderId}`, {
      method: 'POST',
    }),

  updateMessage: (messageId: number, content: string) =>
    req<{ id: number; content: string }>(`/messages/${messageId}/?content=${encodeURIComponent(content)}`, {
      method: 'PATCH',
    }),

  deleteMessage: (messageId: number) =>
    req<void>(`/messages/${messageId}/`, { method: 'DELETE' }),
};
