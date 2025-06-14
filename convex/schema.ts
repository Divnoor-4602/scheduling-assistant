import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  // user table
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

  // project table
  projects: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    // project status: active, complete, cancelled
    status: v.union(
      v.literal("active"),
      v.literal("complete"),
      v.literal("cancelled"),
    ),
    // when is the project due
    deadline: v.string(),
    mainTasks: v.array(v.string()),
    // how many hours can the user dedicate to this project daily
    dailyHours: v.number(),
    // can the user work on weekends
    weekendWork: v.boolean(),
    createdAt: v.number(),
  }).index("byUserId", ["userId"]),
});
