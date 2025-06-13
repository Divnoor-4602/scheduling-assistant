// Vapi Configuration and Utilities

export enum CALL_STATUS {
  INACTIVE = "inactive",
  ACTIVE = "active",
  LOADING = "loading",
}

export interface UseVapiReturn {
  callStatus: CALL_STATUS;
  isSpeaking: boolean;
  volumeLevel: number;
  startCall: () => void;
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
