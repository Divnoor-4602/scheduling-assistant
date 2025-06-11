import { z } from "zod";

export const WorkHoursSchema = z
  .object({
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine(
    (data) => {
      // Convert time strings to comparable format for validation
      const startTime = new Date(`1970-01-01T${data.startTime}`);
      const endTime = new Date(`1970-01-01T${data.endTime}`);
      return startTime < endTime;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );
