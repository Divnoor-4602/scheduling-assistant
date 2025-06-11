"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import {
  containerStyles,
  googleCalendarImageProps,
  plincoImageProps,
  createUpperBeamConfig,
  createLowerBeamConfig,
} from "./googleCalendarStepConfig";

import CustomButton from "@/components/shared/CustomButton";
import { Check, ChevronRight, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

type GoogleCalendarStepProps = {
  currentStep: number;
  googleCalendarConnected: boolean;
  isLoading?: boolean;
  error?: string | null;
  onStepChange: (step: number) => void;
  onConnectGoogleCalendar: () => Promise<void>;
};

const Container = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-16 items-center justify-center rounded-xl border-1 bg-white p-3 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
});

Container.displayName = "Container";

const GoogleCalendarStep = ({
  currentStep,
  googleCalendarConnected,
  onConnectGoogleCalendar,
  isLoading,
  onStepChange,
}: GoogleCalendarStepProps) => {
  // get the onboarding mutation
  const mutateOnboardingStep = useMutation(api.users.changeOnboardingStep);

  // Component refs
  const containerRef = useRef<HTMLDivElement>(null);
  const googleCalendarRef = useRef<HTMLDivElement>(null);
  const plincoRef = useRef<HTMLDivElement>(null);

  // Create beam configurations with refs
  const upperBeamConfig = createUpperBeamConfig(
    containerRef,
    googleCalendarRef,
    plincoRef,
  );
  const lowerBeamConfig = createLowerBeamConfig(
    containerRef,
    googleCalendarRef,
    plincoRef,
  );

  return (
    <div>
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center justify-between w-full">
            Sync your calendar
            {isLoading ? (
              <Badge className="bg-yellow-100 text-yellow-600 flex items-center gap-1">
                Verifying status
                <Loader2 className="w-4 h-4 animate-spin" />
              </Badge>
            ) : googleCalendarConnected ? (
              <Badge className="bg-green-100 text-green-600 flex items-center gap-1">
                Connected
                <Check className="w-4 h-4" />
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-600 flex items-center gap-1">
                Not Connected
                <X className="w-4 h-4" />
              </Badge>
            )}
          </div>
        </DialogTitle>
        <DialogDescription>
          Link{" "}
          <span className="bg-gradient-to-r bg-clip-text text-transparent from-red-500 via-yellow-500 to-blue-500 font-semibold">
            Google Calendar
          </span>{" "}
          so{" "}
          <span className="font-semibold bg-gradient-to-r from-purple-500 to-indigo-700 text-transparent bg-clip-text">
            plinco
          </span>{" "}
          can carve out smart work blocks automatically.
        </DialogDescription>

        {/* Main content container */}
        <div className="w-full">
          <div
            className="relative flex w-full items-center justify-center overflow-hidden border border-gray-200 h-[200px] rounded-2xl p-10 my-3"
            style={containerStyles}
            ref={containerRef}
          >
            {/* Logo containers */}
            <div className="flex size-full flex-row items-center justify-between">
              <Container ref={googleCalendarRef}>
                <Image
                  {...googleCalendarImageProps}
                  alt="Google Calendar Logo"
                />
              </Container>

              <Container ref={plincoRef}>
                <Image {...plincoImageProps} alt="Plinco Logo" />
              </Container>
            </div>

            {/* Bidirectional animated beams */}
            <AnimatedBeam {...upperBeamConfig} />
            <AnimatedBeam {...lowerBeamConfig} />
          </div>
          {/* TODO: Implement the step counter and the buttons to either continue or connect the google */}
        </div>
      </DialogHeader>
      <DialogFooter>
        <div className="flex items-center justify-between w-full mt-2">
          {/* Step counter - Left corner */}
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
              ></div>
            ))}
          </div>

          {/* Continue button - Right corner */}
          <CustomButton
            disabled={isLoading}
            text={
              isLoading
                ? "Connecting"
                : googleCalendarConnected
                  ? "Continue"
                  : "Connect"
            }
            icon={
              isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronRight />
              )
            }
            onClick={() => {
              if (googleCalendarConnected) {
                onStepChange(currentStep + 1);
                mutateOnboardingStep({ step: "workSchedule" });
              } else {
                onConnectGoogleCalendar();
              }
            }}
          />
        </div>
      </DialogFooter>
    </div>
  );
};

export default GoogleCalendarStep;

// cases:

// case 1: The user logs in with google
// case 1.1: The user gives calendar permissions so now I can sync the calendar, if the permissions are there i'll show a badge saying permissions present
// case 1.2: The user does not give calendar permissions so now I need to connect them to the google calendar in the onboarding modal

// case 2: The user logs in manually -> email, phone and password
// case 2.1: I need to have them connect to the google calendar in the onboarding modal
