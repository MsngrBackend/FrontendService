import { useEffect, useRef, useState, useCallback } from "react";
import { chatsApi } from "../api/chats";
import { getUserIdFromJwt } from "../api/client";
import type { Message, WsMessage } from "../types/chat";

interface UseChatOptions {
  chatId: number | null;
  username: string;
}

export const useChat = ({ chatId, username }: UseChatOptions) => {
  const [fetchState, setFetchState] = useState<{
    chatId: number | null;
    messages: Message[];
    error?: string;
  }>({ chatId: null, messages: [] });
  const [isTyping, setIsTyping] = useState(false);

  const messages = fetchState.chatId === chatId ? fetchState.messages : [];
  const loading = chatId !== null && fetchState.chatId !== chatId;
  const fetchError = fetchState.chatId === chatId ? fetchState.error : undefined;
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const myUserId = getUserIdFromJwt();

  // Load message history
  useEffect(() => {
    if (!chatId) return;

    let cancelled = false;

    chatsApi
      .getMessages(chatId)
      .then((msgs) => {
        if (!cancelled) {
          // API returns newest-first, reverse for display
          setFetchState({ chatId, messages: [...msgs].reverse() });
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Ошибка загрузки сообщений';
          setFetchState({ chatId, messages: [], error: msg });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chatId]);

  // WebSocket connection with auto-reconnect
  useEffect(() => {
    if (!chatId || !myUserId) return;

    let destroyed = false;

    const connect = () => {
      if (destroyed) return;

      const token = localStorage.getItem('access_token') ?? '';
      const wsBase = import.meta.env.VITE_WS_BASE as string | undefined;
      const wsScheme = location.protocol === 'https:' ? 'wss' : 'ws';
      const rawUrl = wsBase
        ? `${wsBase}/${chatId}/${myUserId}?username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}`
        : `${wsScheme}://${location.host}/ws/${chatId}/${myUserId}?username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}`;
      const wsUrl = rawUrl.startsWith('ws://') && location.protocol === 'https:'
        ? rawUrl.replace(/^ws:\/\//, 'wss://')
        : rawUrl;

      let ws: WebSocket;
      try {
        ws = new WebSocket(wsUrl);
      } catch (e) {
        console.error('[useChat] WebSocket URL error:', wsUrl, e);
        return;
      }
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data as string) as WsMessage & {
          sender_id?: string;
        };
        console.debug("[WS] received", data, "| myUserId:", myUserId);

        if (data.text === undefined) {
          // typing event
          if (data.sender_id !== myUserId) {
            setIsTyping(true);
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
            typingTimerRef.current = setTimeout(() => setIsTyping(false), 2000);
          }
          return;
        }

        // Skip echo of own messages (added optimistically on send)
        if (data.sender_id === myUserId) {
          return;
        }

        const msg: Message = {
          id: Date.now(),
          chat_id: chatId,
          content: data.text,
          sender_id: data.sender_id ?? "",
          created_at: new Date().toISOString(),
        };
        setFetchState((prev) => ({
          ...prev,
          messages: [...prev.messages, msg],
        }));
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!destroyed) {
          reconnectTimerRef.current = setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      const ws = wsRef.current;
      wsRef.current = null;
      if (ws) {
        // Всегда сбрасываем onclose, чтобы старый сокет не обнулял wsRef
        // нового соединения (актуально для StrictMode и смены deps).
        ws.onclose = null;
        if (ws.readyState === WebSocket.CONNECTING) {
          // Ждём открытия и сразу закрываем — избегаем ошибки браузера.
          ws.onopen = () => ws.close();
        } else {
          ws.close();
        }
      }
    };
  }, [chatId, myUserId, username]);

  const sendMessage = useCallback(
    (text: string) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !text.trim()) return;
      ws.send(JSON.stringify({ type: "message", text: text.trim() }));
      // Optimistically add own message — don't wait for server echo
      if (chatId && myUserId) {
        setFetchState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: Date.now(),
              chat_id: chatId,
              content: text.trim(),
              sender_id: myUserId,
              created_at: new Date().toISOString(),
              _temp: true,
            },
          ],
        }));
      }
    },
    [chatId, myUserId]
  );

  const sendTyping = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "typing" }));
  }, []);

  const editMessage = useCallback(async (messageId: number, content: string) => {
    await chatsApi.updateMessage(messageId, content);
    setFetchState((prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.id === messageId ? { ...m, content, updated_at: new Date().toISOString() } : m
      ),
    }));
  }, []);

  const deleteMessage = useCallback(async (messageId: number) => {
    await chatsApi.deleteMessage(messageId);
    setFetchState((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== messageId),
    }));
  }, []);

  return { messages, loading, fetchError, isTyping, myUserId, sendMessage, sendTyping, editMessage, deleteMessage };
}
