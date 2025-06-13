"use client";

import React from "react";
import { motion } from "motion/react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { phoneInputAnimations } from "./placeCallStepConfig";
import { PhoneNumberSchema } from "@/lib/schema.zod";

// Define the form schema
const PlaceCallFormSchema = z.object({
  phoneNumber: PhoneNumberSchema,
});

type PhoneNumberInputProps = {
  form: UseFormReturn<z.infer<typeof PlaceCallFormSchema>>;
  isLoading: boolean;
  onSubmit: (data: z.infer<typeof PlaceCallFormSchema>) => Promise<void>;
};

export const PhoneNumberInput = ({
  form,
  isLoading,
  onSubmit,
}: PhoneNumberInputProps) => {
  return (
    <motion.div className="w-full" {...phoneInputAnimations}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="w-full">
          <Label htmlFor="phoneNumber" className="text-sm font-medium">
            Phone Number
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Enter your phone number (e.g., +1-234-567-8900)"
            value={form.watch("phoneNumber")}
            onChange={(e) => form.setValue("phoneNumber", e.target.value)}
            disabled={isLoading}
            className={cn(
              "bg-background ring-1 ring-green-200 focus-visible:ring-green-300 mt-1 w-full",
              form.formState.errors.phoneNumber &&
                "ring-red-300 focus-visible:ring-red-400",
              isLoading && "opacity-50 cursor-not-allowed",
            )}
          />
          {form.formState.errors.phoneNumber && (
            <span className="text-xs text-red-500 px-1">
              {form.formState.errors.phoneNumber.message}
            </span>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default PhoneNumberInput;
