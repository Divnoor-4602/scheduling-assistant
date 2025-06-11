"use client";

import { useState, useEffect } from "react";
import { getGoogleClientCalendarScopes } from "@/lib/actions/googleCalendar.actions";
import { useUser } from "@clerk/clerk-react";
import { calendarScopes } from "@/constants";
import { toast } from "sonner";

interface UseGoogleCalendarReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  checkScopes: () => Promise<void>;
  connectGoogleCalendar: () => Promise<void>;
}

export const useGoogleCalendar = (
  clerkId?: string,
): UseGoogleCalendarReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // get the logged in clerk user
  const { user } = useUser();

  const connectGoogleCalendar = async () => {
    try {
      setIsLoading(true);
      if (!user) return;

      // note: get the provider from the external accounts of the user
      const googleAccount = user.externalAccounts?.find(
        (account) => account.provider === "google",
      );

      console.log("googleAccount", googleAccount);

      // reauth the google account with the required additional scopes
      const reauth = await googleAccount?.reauthorize({
        redirectUrl: window.location.href,
        additionalScopes: calendarScopes,
      });

      if (reauth?.verification?.externalVerificationRedirectURL) {
        window.location.href =
          reauth.verification.externalVerificationRedirectURL.href;
      }
    } catch (error) {
      toast.error("Failed to connect Google account", {
        description: "Please try again",
      });
      throw {
        message: "Failed to connect Google account",
        error,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const checkScopes = async () => {
    if (!clerkId) return;

    setIsLoading(true);
    setError(null);

    try {
      const scopeResponse = await getGoogleClientCalendarScopes(clerkId);
      const hasCalendarScopes = scopeResponse.hasCalendarScopes;
      setIsConnected(hasCalendarScopes);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to check Google Calendar scopes";
      setError(errorMessage);
      console.error("Error fetching Google scopes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-check scopes when clerkId is available
  useEffect(() => {
    if (clerkId) {
      checkScopes();
    }
  }, [clerkId]);

  return {
    isConnected,
    isLoading,
    error,
    checkScopes,
    connectGoogleCalendar,
  };
};
