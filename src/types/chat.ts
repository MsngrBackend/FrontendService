export interface Chat {
  id: number;
  name: string;
}

export interface ChatMember {
  id: number;
  chat_id: number;
  user_id: string;
}

export interface Message {
  id: number;
  chat_id: number;
  content: string;
  sender_id: string;
  created_at: string;
  updated_at?: string;
  _temp?: boolean;
}

// WebSocket incoming message shape
export interface WsMessage {
  text: string;
  sender_id: string;
  id?: number;
}

export interface WsTyping {
  sender_id: string;
}
