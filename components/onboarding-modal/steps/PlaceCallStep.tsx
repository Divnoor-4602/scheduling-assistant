"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import CustomButton from "@/components/shared/CustomButton";
import { Phone, Loader2, Save, PhoneOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PhoneNumberSchema } from "@/lib/schema.zod";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { AnimatePresence } from "motion/react";
import { containerStyles } from "./placeCallStepConfig";
import PhoneNumberInput from "./PhoneNumberInput";
import TalkToPlinco from "./TalkToPlinco";
import { useVapi } from "@/hooks/useVapi";
import { CALL_STATUS } from "@/lib/vapiUtils";

type PlaceCallStepProps = {
  currentStep: number;
  onStepChange: (step: number) => void;
};

// Define the form schema
const PlaceCallFormSchema = z.object({
  phoneNumber: PhoneNumberSchema,
});

// Define the current view type
type ViewType = "phone-input" | "talk-to-plinco";

const PlaceCallStep = ({ currentStep }: PlaceCallStepProps) => {
  // mutation to add the phone number to the user
  const mutateAddPhoneNumber = useMutation(api.users.addPhoneNumber);

  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("phone-input");

  // Vapi hook for voice calls
  const {
    callStatus,
    startCall,
    isLoading: vapiLoading,
    isSpeaking,
    volumeLevel,
    endCall,
  } = useVapi();

  // Form setup
  const form = useForm<z.infer<typeof PlaceCallFormSchema>>({
    resolver: zodResolver(PlaceCallFormSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  async function onSubmit(data: z.infer<typeof PlaceCallFormSchema>) {
    setIsLoading(true);
    try {
      console.log("Placing call to:", data.phoneNumber);

      // save the phone number to the user in the database
      await mutateAddPhoneNumber({ phoneNumber: data.phoneNumber });

      toast.success("Phone number saved!", {
        description: `Plinco will call you at ${data.phoneNumber}`,
      });

      // Sync the transition with the exit animation duration
      setCurrentView("talk-to-plinco");
    } catch (error) {
      toast.error("Failed to place call");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 text-sm">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "w-2 h-2 rounded-full",
            index === currentStep
              ? "bg-violet-600 animate-pulse"
              : "bg-gray-200",
          )}
        />
      ))}
    </div>
  );

  const renderActionButton = () => {
    if (currentView === "phone-input") {
      return (
        <CustomButton
          text="Save phone number"
          className="bg-green-500 hover:bg-green-600"
          icon={<Save />}
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
        />
      );
    }

    // For talk-to-plinco view, show appropriate button based on call status
    const getButtonText = () => {
      if (callStatus === CALL_STATUS.LOADING || vapiLoading)
        return "Connecting";
      if (callStatus === CALL_STATUS.ACTIVE) return "End call";
      return "Start voice call";
    };

    const getButtonIcon = () => {
      if (callStatus === CALL_STATUS.LOADING || vapiLoading) {
        return <Loader2 className="w-4 h-4 animate-spin" />;
      }
      if (callStatus === CALL_STATUS.ACTIVE)
        return <PhoneOff className="w-4 h-4" />;
      return <Phone />;
    };

    const handleButtonClick = () => {
      if (callStatus === CALL_STATUS.ACTIVE) {
        endCall();
      } else if (callStatus === CALL_STATUS.INACTIVE) {
        startCall();
      }
    };

    const getButtonColor = () => {
      if (callStatus === CALL_STATUS.ACTIVE) {
        return "bg-red-500 hover:bg-red-600";
      }
      return "bg-green-500 hover:bg-green-600";
    };

    return (
      <CustomButton
        text={getButtonText()}
        className={getButtonColor()}
        icon={getButtonIcon()}
        onClick={handleButtonClick}
        disabled={callStatus === CALL_STATUS.LOADING || vapiLoading}
        customAnimation={(isHovered) => ({
          x: isHovered ? [-1.5, 1.5, -1, 1, -0.5, 0.5, 0] : 0,
          y: isHovered ? [0, -1, 1, -0.5, 1, -1, 0] : 0,
          rotate: isHovered ? [-2, 2, -3, 3, -1, 1, 0] : 0,
          transition: isHovered
            ? {
                duration: 0.25,
                repeat: Infinity,
                repeatType: "loop" as const,
                ease: "linear",
              }
            : {
                duration: 0.15,
                repeat: 0,
                ease: "easeOut",
              },
        })}
      />
    );
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Place a test call</DialogTitle>
        <DialogDescription>
          Talk to{" "}
          <span className="font-semibold bg-gradient-to-r from-purple-500 to-indigo-700 text-transparent bg-clip-text">
            plinco
          </span>{" "}
          about your <span className="font-semibold">project.</span>
        </DialogDescription>
        <div
          className="w-full my-3 h-[225px] border border-gray-200 rounded-2xl p-4 items-center justify-center flex overflow-hidden"
          style={containerStyles}
        >
          {/* Main content container with AnimatePresence for smooth transitions */}
          <AnimatePresence mode="wait">
            {currentView === "phone-input" && (
              <PhoneNumberInput
                key="phone-input"
                form={form}
                isLoading={isLoading}
                onSubmit={onSubmit}
              />
            )}
            {currentView === "talk-to-plinco" && (
              <TalkToPlinco
                key="talk-to-plinco"
                callStatus={callStatus}
                isSpeaking={isSpeaking}
                volumeLevel={volumeLevel}
              />
            )}
          </AnimatePresence>
        </div>
      </DialogHeader>
      <DialogFooter>
        <div className="flex items-center justify-between w-full mt-2">
          {renderStepIndicator()}
          {renderActionButton()}
        </div>
      </DialogFooter>
    </div>
  );
};

export default PlaceCallStep;
