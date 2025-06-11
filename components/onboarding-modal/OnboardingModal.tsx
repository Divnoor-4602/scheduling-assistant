"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import GoogleCalendarStep from "./steps/GoogleCalendarStep";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import WorkHoursStep from "./steps/WorkHoursStep";
import { AnimatePresence, motion } from "motion/react";
import PlaceCallStep from "./steps/PlaceCallStep";

const OnboardingModal = () => {
  // Get the currently logged in user
  const user = useQuery(api.users.current);

  // Check the user's onboarding state
  const onboardingStep = user?.onboardingStep;

  console.log("onboardingStep", onboardingStep);

  // track the current step the user is on
  const [currentStep, setCurrentStep] = useState<number>(0);

  // open state of the modal
  const [open] = useState<boolean>(true);

  // use effect to set the current step based on the onboarding step
  useEffect(() => {
    // if the user has completed the onboarding process, set the current step to 1
    if (
      onboardingStep === "placeCall" &&
      user?.workHours?.startTime &&
      user?.workHours?.endTime
    ) {
      setCurrentStep(2);
    } else {
      // Otherwise, always start at step 0 to show Google Calendar step
      setCurrentStep(0);
    }
  }, [onboardingStep, user?.workHours?.startTime, user?.workHours?.endTime]);

  // Use the custom hook for Google Calendar logic
  const {
    isConnected: googleCalendarConnected,
    connectGoogleCalendar,
    isLoading,
    error,
  } = useGoogleCalendar(user?.clerkId);

  // determine which step to render
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <GoogleCalendarStep
            key={"google-calendar-step"}
            googleCalendarConnected={googleCalendarConnected}
            currentStep={currentStep}
            isLoading={isLoading}
            error={error}
            onConnectGoogleCalendar={connectGoogleCalendar}
            onStepChange={setCurrentStep}
          />
        );
      case 1:
        return (
          <WorkHoursStep
            key={"work-hours-step"}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        );
      case 2:
        return (
          <PlaceCallStep
            key={"place-call-step"}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        );
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="border border-gray-200 rounded-3xl overflow-hidden h-[400px]"
      >
        {/* Animate between steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
