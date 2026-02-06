import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
const LOGIN_REDIRECT_URI = process.env.GOOGLE_LOGIN_REDIRECT_URI || 'http://localhost:3000/api/auth/google/login-callback';

// Scopes necessários para Google Ads
const ADS_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/adwords',
];

// Scopes para login (apenas perfil)
const LOGIN_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export const oauth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Cliente OAuth separado para login (redirect URI diferente)
export const loginOauth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  LOGIN_REDIRECT_URI
);

export function getAuthUrl(userId: number): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ADS_SCOPES,
    state: JSON.stringify({ userId }),
    prompt: 'consent',
  });
}

export function getLoginAuthUrl(): string {
  return loginOauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: LOGIN_SCOPES,
    state: JSON.stringify({ action: 'login' }),
    prompt: 'consent',
  });
}

export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function getLoginTokensFromCode(code: string) {
  const { tokens } = await loginOauth2Client.getToken(code);
  return tokens;
}

export async function getUserInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
}
