import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    workHours: v.optional(
      v.object({
        startTime: v.string(),
        endTime: v.string(),
      }),
    ),
    onboardingStep: v.union(
      v.literal("googleCalendar"),
      v.literal("workSchedule"),
      v.literal("placeCall"),
      v.literal("complete"),
    ),
    onboarded: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("byClerkId", ["clerkId"]),
});
