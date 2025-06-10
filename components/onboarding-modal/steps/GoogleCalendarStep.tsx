"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Button } from "@/components/ui/button";

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

const GoogleCalendarStep = () => {
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
    <DialogHeader>
      <DialogTitle>Sync your calendar</DialogTitle>
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
              <Image {...googleCalendarImageProps} alt="Google Calendar Logo" />
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
      <Button className="bg-violet-600 text-white w-fit">Continue</Button>
    </DialogHeader>
  );
};

export default GoogleCalendarStep;

// cases:

// case 1: The user logs in with google
// case 1.1: The user gives calendar permissions so now I can sync the calendar
// case 1.2: The user does not give calendar permissions so now I need to connect them to the google calendar in the onboarding modal

// case 2: The user logs in manually -> email, phone and password
// case 2.1: I need to have them connect to the google calendar in the onboarding modal
