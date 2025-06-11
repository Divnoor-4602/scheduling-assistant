"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import React from "react";
import { cn } from "@/lib/utils";
import CustomButton from "@/components/shared/CustomButton";
import { ChevronRight } from "lucide-react";

type PlaceCallStepProps = {
  currentStep: number;
  onStepChange: (step: number) => void;
};

const PlaceCallStep = ({ currentStep, onStepChange }: PlaceCallStepProps) => {
  return (
    <div>
      <DialogHeader>
        <DialogTitle>Place a test call</DialogTitle>
        <DialogDescription>
          Test your{" "}
          <span className="font-semibold bg-gradient-to-r from-purple-500 to-indigo-700 text-transparent bg-clip-text">
            plinco
          </span>{" "}
          assistant by placing a quick test call.
        </DialogDescription>

        {/* Main content container */}
        <div className="w-full">
          <div className="relative flex w-full items-center justify-center overflow-hidden border border-gray-200 h-[200px] rounded-2xl p-10 my-3">
            {/* TODO: Add test call content */}
            <div className="text-center text-gray-500">
              Test call interface will go here
            </div>
          </div>
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

          <div>
            {/* Continue button - Right corner */}
            <CustomButton
              text="Continue"
              icon={<ChevronRight />}
              onClick={() => {
                onStepChange(currentStep - 1);
              }}
            />
          </div>
        </div>
      </DialogFooter>
    </div>
  );
};

export default PlaceCallStep;
