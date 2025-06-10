import { internalMutation, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

// utility function to check google calendar permissions
function checkCalendarPermissions(userData: UserJSON): boolean {
  const googleAccount = userData.external_accounts?.find(
    (account) => account.provider === "oauth_google",
  );

  if (!googleAccount?.approved_scopes) {
    return false;
  }

  const requiredScopes = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.freebusy",
    "https://www.googleapis.com/auth/calendar.settings.readonly",
  ];

  // Check if at least calendar.events scope is present (most important one)
  return requiredScopes.every((scope) =>
    googleAccount.approved_scopes.includes(scope),
  );
}

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    // check if the user has google calendar permissions
    const hasCalendarPermissions = checkCalendarPermissions(data);

    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      clerkId: data.id,
      onboardingStep: hasCalendarPermissions
        ? ("workSchedule" as const)
        : ("googleCalendar" as const),
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
