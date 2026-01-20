export interface LoginCredentials {
  email: string;
  password: string;
}

export interface MagicLinkRequest {
  email: string;
}

export interface MagicLinkVerification {
  email: string;
  code: string;
}

export type LoginMethod = 'traditional' | 'magic-link';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // segundos até expirar
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  tokens: AuthTokens;
  lastActivity: number; // timestamp
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}
