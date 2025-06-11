"use server";

import { getGoogleOAuthClient, getGoogleTokenInfo } from "./google.actions";
import type { GoogleCalendarScopeInfo } from "./types";

// Helper function to check if required calendar scopes are present
function checkCalendarScopes(scopes: string[]): boolean {
  const requiredScopes = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.freebusy",
  ];

  return requiredScopes.every((scope) => scopes.includes(scope));
}

/**
 * Gets authenticated Google OAuth2 client specifically for calendar access.
 * Returns undefined if user lacks Google connection.
 * The returned client is authenticated and ready to access **Google Calendar API**.
 */
export async function getCalendarOAuthClient(clerkId: string) {
  return await getGoogleOAuthClient(clerkId);
}

/**
 * Gets Google client scopes with calendar-specific validation
 */
export async function getGoogleClientCalendarScopes(
  clerkId: string,
): Promise<GoogleCalendarScopeInfo> {
  try {
    console.log("Getting Google Calendar client scopes for clerkId:", clerkId);

    // Get token info from the base Google actions
    const tokenInfo = await getGoogleTokenInfo(clerkId);

    if (tokenInfo.token !== "valid") {
      return {
        ...tokenInfo,
        hasCalendarScopes: false,
      };
    }

    // Add calendar-specific scope checking
    const hasCalendarScopes = checkCalendarScopes(tokenInfo.scopes);

    console.log("Has calendar scopes:", hasCalendarScopes);

    return {
      ...tokenInfo,
      hasCalendarScopes,
    };
  } catch (error) {
    console.error("Error in getGoogleClientScopes:", error);

    return {
      scopes: [],
      hasCalendarScopes: false,
      token: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create the user's google account and connect it to the calendar for the plinco to access
 *
 */
export async function createGoogleAccountForClient() {}
