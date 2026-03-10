export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface Session {
  id: string;
  user_agent: string;
  ip: string;
  expires_at: string;
  created_at: string;
}

export interface RegisterResponse {
  message: string;
  confirm_code: string;
}
