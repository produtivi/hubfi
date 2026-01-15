export interface GoogleAccount {
  id: number;
  email: string;
  createdAt: Date | string;
  mccCount?: number;
  adsAccountCount?: number;
  conversionActionsCount?: number;
}

export interface CreateGoogleAccountRequest {
  email: string;
}

export interface GoogleAccountResponse {
  success: boolean;
  data?: GoogleAccount | GoogleAccount[];
  error?: string;
  message?: string;
}