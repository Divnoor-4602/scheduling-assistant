import {
  internalMutation,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      clerkId: data.id,
      onboardingStep: "googleCalendar" as const,
      onboarded: false,
      email: data.email_addresses[0].email_address,
      createdAt: Date.now(),
    };

    const user = await userByClerkId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByClerkId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByClerkId(ctx, identity.subject);
}

async function userByClerkId(ctx: QueryCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
    .unique();
}

/**
 * Update the user's work hours through a mutation
 * @param startTime - The start time of the user's work hours
 * @param endTime - The end time of the user's work hours
 */
export const updateWorkHours = mutation({
  args: {
    startTime: v.string(),
    endTime: v.string(),
  },
  async handler(ctx, { startTime, endTime }) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      workHours: {
        startTime,
        endTime,
      },
    });
  },
});

/***
 * Change the onboarding step of the user based on where they are in the onboarding process
 * @param step - The step to change to
 */
export const changeOnboardingStep = mutation({
  args: {
    step: v.string(),
  },
  async handler(
    ctx,
    args: {
      step: "googleCalendar" | "workSchedule" | "placeCall" | "complete";
    },
  ) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { onboardingStep: args.step });
  },
});

/**
 * Add a phone number to the user
 * @param phoneNumber - The phone number to add
 */
export const addPhoneNumber = mutation({
  args: {
    phoneNumber: v.string(),
  },
  async handler(ctx, { phoneNumber }) {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { phone: phoneNumber });
  },
});
