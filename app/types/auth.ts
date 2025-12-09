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
