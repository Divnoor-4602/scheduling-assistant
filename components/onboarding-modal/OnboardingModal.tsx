"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import GoogleCalendarStep from "./steps/GoogleCalendarStep";

const OnboardingModal = () => {
  // Get the currently logged in user
  // Check the user's onboarding state
  const user = useQuery(api.users.current);

  // onboarding completions status
  const isOnboarded = user?.onboarded ?? false;
  // onboarding current step
  const onboardingStep = user?.onboardingStep;

  // open state of the modal
  const [open] = useState<boolean>(true);

  // track the steps the user has completed and according to the steps, render the details
  const [currentStep, setCurrentStep] = useState<number>(0);

  return (
    <Dialog open={open}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="border border-gray-200 rounded-3xl"
      >
        <GoogleCalendarStep />
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
