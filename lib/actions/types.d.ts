// Google OAuth Token Types
export interface TokenValidationResult {
  isValid: boolean;
  expiresIn?: number;
  error?: string;
}

export interface GoogleTokenInfo {
  scopes: string[];
  token: "valid" | "missing_or_expired" | "error";
  expiresIn?: number;
  email?: string | null;
  error?: string;
}

export interface GoogleCalendarScopeInfo extends GoogleTokenInfo {
  hasCalendarScopes: boolean;
}

// Google OAuth Status Types
export type GoogleTokenStatus = "valid" | "missing_or_expired" | "error";
