// Vapi Configuration and Utilities

import { NextResponse } from "next/server";

// FRONTEND VAPI UTILS
export enum CALL_STATUS {
  INACTIVE = "inactive",
  ACTIVE = "active",
  LOADING = "loading",
}

export interface UseVapiReturn {
  callStatus: CALL_STATUS;
  isSpeaking: boolean;
  volumeLevel: number;
  startCall: (variableValues?: Record<string, string | undefined>) => void;
  endCall: () => void;
  isLoading: boolean;
}

// Helper functions to categorize end reasons based on Vapi documentation
export const isSuccessfulCompletion = (endedReason: string): boolean => {
  const successfulReasons = [
    "assistant-ended",
    "assistant-ended-call",
    "function-call",
    "pipeline-error-openai-voice-failed",
    "silence-timeout",
    "max-duration-timeout",
    "assistant-request-ended",
    "workflow-completed",
  ];
  return successfulReasons.includes(endedReason);
};

export const isUserInitiated = (endedReason: string): boolean => {
  const userInitiatedReasons = [
    "customer-ended-call",
    "customer-hung-up",
    "user-hung-up",
    "user-ended",
    "hangup",
  ];
  return userInitiatedReasons.includes(endedReason);
};

export const isError = (endedReason: string): boolean => {
  const errorReasons = [
    "call-start-error",
    "assistant-not-found",
    "assistant-not-invalid",
    "assistant-request-failed",
    "assistant-request-returned-error",
    "assistant-request-returned-unspeakable-error",
    "assistant-request-returned-invalid-assistant",
    "assistant-request-returned-no-assistant",
    "assistant-request-returned-forwarding-phone-number",
    "assistant-request-returned-error-phone-number",
    "pipeline-error",
    "pipeline-no-available-model",
    "call-start-error-neither-assistant-nor-server-set",
    "vonage-disconnected",
    "vonage-failed-to-connect-call",
    "twilio-failed-to-connect-call",
    "twilio-reported-customer-misdialed",
    "phone-call-provider-bypass-enabled-but-no-call-received",
    "exceeded-max-duration",
    "sip-gateway-failed-to-connect",
    "error",
  ];
  return errorReasons.some((reason) => endedReason.includes(reason));
};

// Vapi Environment Variables Helper
export const getVapiConfig = () => {
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  const assistantId = process.env.NEXT_PUBLIC_VAPI_SCHEDULING_ASSISTANT_KEY;

  return {
    publicKey,
    assistantId,
    isConfigValid: !!(publicKey && assistantId),
  };
};

// Volume normalization utility
export const normalizeVolume = (
  volume: number,
  multiplier: number = 2,
): number => {
  return Math.min(Math.max(volume * multiplier, 0), 1);
};

// Blob scale calculation utility
export const calculateBlobScale = (
  callStatus: CALL_STATUS,
  isSpeaking: boolean,
  volumeLevel: number,
  baseScale: number = 0.8,
  scaleMultiplier: number = 0.2,
  defaultScale: number = 1.0,
): number => {
  if (callStatus === CALL_STATUS.ACTIVE && isSpeaking) {
    return baseScale + volumeLevel * scaleMultiplier;
  }
  return defaultScale;
};

// API VAPI UTILS -> required to send proper responses and handle incoming tool requests

// CORS Configuration
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// CORS Handlers
export function createCorsHandler() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Vapi API Router types
export type TVapiToolCall = {
  arguments: Record<string, unknown>;
  toolCallId: string;
  functionName: string;
};

// API Response Helpers
export function createApiResponse(
  data: unknown,
  options: {
    status?: number;
    headers?: Record<string, string>;
  } = {},
) {
  const { status = 200, headers: additionalHeaders = {} } = options;

  return NextResponse.json(data, {
    status,
    headers: {
      ...corsHeaders,
      ...additionalHeaders,
    },
  });
}

export function createErrorResponse(
  error: string | { error: string; [key: string]: unknown },
  status: number = 500,
) {
  const errorData = typeof error === "string" ? { error } : error;

  return NextResponse.json(errorData, {
    status,
    headers: corsHeaders,
  });
}

// VAPI Tool Call Helpers
export function extractVapiToolCall(body: Record<string, unknown>) {
  const message = body?.message as Record<string, unknown> | undefined;
  const toolCallList = message?.toolCallList as unknown[] | undefined;
  const toolCall = toolCallList?.[0] as Record<string, unknown> | undefined;
  const functionObj = toolCall?.function as Record<string, unknown> | undefined;

  return {
    arguments: (functionObj?.arguments as Record<string, unknown>) || {},
    toolCallId: (toolCall?.id as string) || "",
    functionName: (functionObj?.name as string) || "",
  };
}

export function createVapiResponse(
  toolCallId: string,
  result: unknown,
  isError: boolean = false,
) {
  return {
    results: [
      {
        toolCallId,
        result: isError
          ? (result as string)
          : {
              type: "object",
              object: result,
            },
      },
    ],
  };
}

export function createVapiErrorResponse(
  toolCallId: string,
  errorMessage: string,
) {
  return createVapiResponse(toolCallId, `Error: ${errorMessage}`, true);
}

// Data Conversion Helpers
export function convertToConvexId(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value.trim();
}
