"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";
import type { TokenValidationResult, GoogleTokenInfo } from "./types";

/**
 * Validates if the Google access token is still valid
 * Checks how much time is left on the token
 * If the token is valid, returns the expiresIn time
 */
async function validateGoogleToken(
  accessToken: string,
): Promise<TokenValidationResult> {
  try {
    const oauth2 = google.oauth2("v2");
    const tokenInfo = await oauth2.tokeninfo({
      access_token: accessToken,
    });

    const expiresIn = tokenInfo.data.expires_in;
    const isValid = expiresIn ? expiresIn > 60 : false; // Consider valid if > 1 minute left

    return {
      isValid,
      expiresIn: expiresIn || 0,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Gets a fresh Google OAuth token from Clerk with validation
 * If the token is expired, it will refresh the token
 */
export async function refreshGoogleToken(
  clerkId: string,
  retryCount = 0,
): Promise<string | null> {
  const maxRetries = 2;

  try {
    // creates a clerk client to access the google token
    const client = await clerkClient();
    const tokenResponse = await client.users.getUserOauthAccessToken(
      clerkId,
      "google",
    );

    if (tokenResponse.data.length === 0 || !tokenResponse.data[0]?.token) {
      console.log("No Google token found for user");
      return null;
    }

    const token = tokenResponse.data[0].token;

    // Validate the token
    const validation = await validateGoogleToken(token);

    // If the token still has time left, return the token
    if (validation.isValid) {
      console.log(`Token is valid, expires in ${validation.expiresIn} seconds`);
      return token;
    }

    // Token is expired or invalid
    console.log(`Token validation failed: ${validation.error}`);

    // Retry once more to get a fresh token from Clerk
    if (retryCount < maxRetries) {
      console.log(
        `Retrying to get fresh token (attempt ${retryCount + 1}/${maxRetries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      return refreshGoogleToken(clerkId, retryCount + 1);
    }

    return null;
  } catch (error) {
    console.error("Error getting Google token:", error);
    return null;
  }
}

/**
 * Gets authenticated Google OAuth2 client for user's access.
 * Returns undefined if user lacks Google connection.
 * The returned client is authenticated and ready to access **Google APIs**.
 */
export async function getGoogleOAuthClient(clerkId: string) {
  // Get a fresh, validated token
  const accessToken = await refreshGoogleToken(clerkId);

  if (!accessToken) {
    console.log("No valid Google token available");
    return;
  }

  // Create Google OAuth2 client
  const googleClient = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URL,
  );

  // Set the validated token
  googleClient.setCredentials({ access_token: accessToken });

  return googleClient;
}

/**
 * Gets Google OAuth scopes and token information for a user
 */
export async function getGoogleTokenInfo(
  clerkId: string,
): Promise<GoogleTokenInfo> {
  try {
    console.log("Getting Google token info for clerkId:", clerkId);

    // Get a fresh, validated token
    const accessToken = await refreshGoogleToken(clerkId);

    if (!accessToken) {
      console.log("No valid Google token available for scope checking");
      return {
        scopes: [],
        token: "missing_or_expired",
        error: "No valid Google token found",
      };
    }

    // Get token info including scopes
    const oauth2 = google.oauth2("v2");
    const tokenInfo = await oauth2.tokeninfo({
      access_token: accessToken,
    });

    const scopes = tokenInfo.data.scope?.split(" ") || [];
    console.log("Token scopes found:", scopes);

    // return the scope information
    return {
      scopes,
      token: "valid",
      expiresIn: tokenInfo.data.expires_in || 0,
      email: tokenInfo.data.email || null,
    };
  } catch (error) {
    console.error("Error in getGoogleTokenInfo:", error);

    return {
      scopes: [],
      token: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
