"use client";

import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronRight, Clock } from "lucide-react";

import React, { forwardRef, useRef, useState } from "react";
import CustomButton from "@/components/shared/CustomButton";
import { Meteors } from "@/components/magicui/meteors";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { WorkHoursSchema } from "@/lib/schema.zod";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";

type WorkHoursStepProps = {
  currentStep: number;
  onStepChange: (step: number) => void;
};

const Container = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-xl border-1 bg-white p-2 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
});

Container.displayName = "Container";

// time picker component
const TimePicker = ({
  label,
  value,
  onChange,
  ringColor,
  error,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  ringColor: string;
  error?: string;
  disabled?: boolean;
}) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <Label htmlFor="time" className="px-1 text-xs font-medium">
        {label}
      </Label>
      <Input
        type="time"
        id="time"
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none ring-1 ${ringColor} focus-visible:${ringColor} ${error ? "ring-red-400" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      {error && <span className="text-xs text-red-500 px-1">{error}</span>}
    </div>
  );
};

const WorkHoursStep = ({ currentStep, onStepChange }: WorkHoursStepProps) => {
  const mutateOnboardingStep = useMutation(api.users.changeOnboardingStep);

  const updateWorkHoursMutation = useMutation(api.users.updateWorkHours);
  const [isLoading, setIsLoading] = useState(false);
  // Component refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const plincoRef = useRef<HTMLDivElement>(null);
  const moonRef = useRef<HTMLDivElement>(null);

  // Form setup
  const form = useForm<z.infer<typeof WorkHoursSchema>>({
    resolver: zodResolver(WorkHoursSchema),
    defaultValues: {
      startTime: "09:00",
      endTime: "18:00",
    },
  });

  async function onSubmit(data: z.infer<typeof WorkHoursSchema>) {
    setIsLoading(true);
    try {
      await updateWorkHoursMutation({
        startTime: data.startTime,
        endTime: data.endTime,
      });
      onStepChange(currentStep + 1);
      // mutate the onboarding status to the next step
      mutateOnboardingStep({ step: "placeCall" });

      // show a success toast
      toast.success("Work hours set successfully!", {
        description: `${data.startTime} - ${data.endTime}`,
      });
    } catch (error) {
      toast.error("Failed to set work hours");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Set your work hours</DialogTitle>
        <DialogDescription>
          <div className="flex items-center gap-1">
            Tell us when are you on the clock.
            <span>
              <Clock className="w-4 h-4" />
            </span>
          </div>
        </DialogDescription>

        <div
          className="w-full h-[150px] mt-1 overflow-hidden relative border border-gray-200 rounded-2xl p-4"
          ref={containerRef}
        >
          {/* Meteors container - extends beyond visible area */}
          <div className="absolute -inset-20 pointer-events-none">
            <Meteors number={30} />
          </div>

          {/* Animated beam layout */}
          <div className="relative flex w-full h-full items-center justify-between">
            <Container
              ref={sunRef}
              className="bg-yellow-50 border-yellow-400 border"
            >
              <span className="text-xl">☀️</span>
            </Container>

            <Container ref={plincoRef}>
              <Image
                src="/images/plinco-logo.png"
                alt="Plinco Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain rounded-[4px]"
              />
            </Container>

            <Container
              ref={moonRef}
              className="border border-violet-400 bg-violet-50"
            >
              <span className="text-xl">🌘</span>
            </Container>
          </div>

          {/* Unidirectional beams from plinco to sun and moon */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={plincoRef}
            toRef={sunRef}
            curvature={-75}
            endYOffset={-10}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={plincoRef}
            toRef={moonRef}
            curvature={75}
            endYOffset={10}
          />
        </div>

        {/* work time selectors */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex w-full items-center justify-between my-3 gap-4">
            {/* start time picker */}
            <TimePicker
              label="Start Time"
              value={form.watch("startTime")}
              onChange={(value) => form.setValue("startTime", value)}
              ringColor="ring-yellow-400"
              error={form.formState.errors.startTime?.message}
              disabled={isLoading}
            />
            {/* end time picker */}
            <TimePicker
              label="End Time"
              value={form.watch("endTime")}
              onChange={(value) => form.setValue("endTime", value)}
              ringColor="ring-violet-400"
              error={form.formState.errors.endTime?.message}
              disabled={isLoading}
            />
          </div>
        </form>
      </DialogHeader>
      <DialogFooter>
        <div className="flex items-center justify-between w-full mt-2">
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
          {/* continue button */}
          <CustomButton
            text={isLoading ? "Setting" : "Continue"}
            icon={
              isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronRight />
              )
            }
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          />
        </div>
      </DialogFooter>
    </div>
  );
};

export default WorkHoursStep;
