"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";

/**
 * Gets authenticated Google OAuth2 client for user's calendar access.
 * Verifies user has required calendar scopes before creating client.
 * Returns undefined if user lacks Google connection or required calendar scopes.
 * The returned client is authenticated and ready to access **Google Calendar API**.
 */
export async function getOAuthClient(clerkId: string) {
  // create a clerk client
  const client = await clerkClient();

  // get the token response from clerk client
  const tokenResponse = await client.users.getUserOauthAccessToken(
    clerkId,
    "google",
  );

  // see if the token is present
  if (tokenResponse.data.length === 0 || !tokenResponse.data) {
    // if there is no token or no length in the token
    return;
  }

  // get the token from the response
  const token = tokenResponse.data[0];

  // check if the token has required scopes
  const requiredScopes = [
    "email",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.freebusy",
  ];

  // check if the token has required calendar scopes
  const hasCalendarScopes = requiredScopes.every((scope) =>
    token.scopes?.includes(scope),
  );

  // if the token does not have the required calendar scopes, return
  if (!hasCalendarScopes) {
    return;
  }

  // if the token has the required scopes and it is valid, create a google client
  const googleClient = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URL,
  );

  // set the token
  googleClient.setCredentials({ access_token: token.token });

  // return the google client
  return googleClient;
}
