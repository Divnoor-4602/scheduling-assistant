import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";
import {
  CALL_STATUS,
  UseVapiReturn,
  isSuccessfulCompletion,
  isUserInitiated,
  isError,
  getVapiConfig,
  normalizeVolume,
} from "@/lib/vapiUtils";

export const useVapi = (): UseVapiReturn => {
  const [callStatus, setCallStatus] = useState<CALL_STATUS>(
    CALL_STATUS.INACTIVE,
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const vapiRef = useRef<Vapi | null>(null);
  const callEndedNaturally = useRef(false);

  useEffect(() => {
    // Initialize Vapi instance using config helper
    const { publicKey, isConfigValid } = getVapiConfig();

    if (!isConfigValid) {
      console.error("Vapi configuration missing");
      toast.error(
        "Vapi configuration missing. Please check environment variables.",
      );
      return;
    }

    const vapiInstance = new Vapi(publicKey!);
    vapiRef.current = vapiInstance;

    // Set up event listeners
    const handleCallStart = () => {
      setCallStatus(CALL_STATUS.ACTIVE);
      setIsLoading(false);
      callEndedNaturally.current = false; // Reset flag for new call
      toast.success("Connected to scheduling assistant!");
    };
    const handleCallEnd = (callEndData?: unknown) => {
      setCallStatus(CALL_STATUS.INACTIVE);
      setIsSpeaking(false);
      setVolumeLevel(0);
      setIsLoading(false);

      // Mark that call ended naturally to prevent error toast
      callEndedNaturally.current = true;

      // Show appropriate message based on how the call ended
      if (
        callEndData &&
        typeof callEndData === "object" &&
        "endedReason" in callEndData
      ) {
        const endedReason = (callEndData as { endedReason: string })
          .endedReason;

        // Categorize end reasons for appropriate user messaging
        if (isSuccessfulCompletion(endedReason)) {
          toast.success("Call completed successfully!");
        } else if (isUserInitiated(endedReason)) {
          // Don't show any toast for user-initiated end
        } else if (isError(endedReason)) {
          toast.error("Call ended unexpectedly. Please try again.");
        } else {
          toast.info("Call ended.");
        }
      } else {
        toast.info("Call ended.");
      }
    };
    const handleSpeechStart = () => {
      setIsSpeaking(true);
    };
    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      setVolumeLevel(0);
    };
    const handleVolumeLevel = (volume: number) => {
      const normalizedVolume = normalizeVolume(volume);
      setVolumeLevel(normalizedVolume);
    };
    const handleError = (error: unknown) => {
      // Don't show error toast if call ended naturally
      if (callEndedNaturally.current) {
        callEndedNaturally.current = false; // Reset flag
        return;
      }

      setCallStatus(CALL_STATUS.INACTIVE);
      setIsLoading(false);
      toast.error("Connection failed. Please try again later.");
      console.error("Vapi error:", error);
    };
    vapiInstance.on("call-start", handleCallStart);
    vapiInstance.on("call-end", handleCallEnd);
    vapiInstance.on("speech-start", handleSpeechStart);
    vapiInstance.on("speech-end", handleSpeechEnd);
    vapiInstance.on("volume-level", handleVolumeLevel);
    vapiInstance.on("error", handleError);
    return () => {
      vapiInstance.off("call-start", handleCallStart);
      vapiInstance.off("call-end", handleCallEnd);
      vapiInstance.off("speech-start", handleSpeechStart);
      vapiInstance.off("speech-end", handleSpeechEnd);
      vapiInstance.off("volume-level", handleVolumeLevel);
      vapiInstance.off("error", handleError);
      vapiInstance.stop();
    };
  }, []);

  const startCall = async (
    variableValues?: Record<string, string | undefined>,
  ) => {
    if (!vapiRef.current) {
      toast.error("Vapi not initialized");
      return;
    }

    const { assistantId } = getVapiConfig();
    if (!assistantId) {
      toast.error(
        "Assistant ID not found. Please check environment variables.",
      );
      return;
    }

    try {
      setIsLoading(true);
      setCallStatus(CALL_STATUS.LOADING);

      // Start call with dynamic variables if provided
      if (variableValues) {
        await vapiRef.current.start(assistantId, {
          variableValues,
        });
      } else {
        await vapiRef.current.start(assistantId);
      }
    } catch (error) {
      setCallStatus(CALL_STATUS.INACTIVE);
      setIsLoading(false);
      toast.error("Failed to start call. Please try again.");
      console.error("Failed to start call:", error);
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  return {
    callStatus,
    isSpeaking,
    volumeLevel,
    startCall,
    endCall,
    isLoading,
  };
};
