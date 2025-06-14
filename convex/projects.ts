import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { CreateProjectResult } from "./shared.types";

// Internal mutation to create a project (private - only callable by other Convex functions)
/***
 * This mutation is used to create a project for a user identified by clerkId
 * @param clerkId - The Clerk ID of the user creating the project
 * @param title - The title of the project
 * @param description - The description of the project
 * @param mainTasks - The main tasks of the project
 * @param deadline - The deadline of the project
 * @param dailyHours - The daily hours the user can dedicate to the project
 * @param weekendWork - Whether the user can work on weekends
 * @returns The projectId and the project object
 */
export const createProject = internalMutation({
  args: {
    clerkId: v.string(),
    title: v.string(),
    description: v.string(),
    mainTasks: v.array(v.string()),
    deadline: v.string(),
    dailyHours: v.number(),
    weekendWork: v.boolean(),
  },
  returns: v.object({
    projectId: v.id("projects"),
    project: v.object({
      title: v.string(),
      description: v.string(),
      mainTasks: v.array(v.string()),
      deadline: v.string(),
      dailyHours: v.number(),
      weekendWork: v.boolean(),
      status: v.union(
        v.literal("active"),
        v.literal("complete"),
        v.literal("cancelled"),
      ),
      createdAt: v.number(),
    }),
  }),
  handler: async (
    ctx,
    {
      clerkId,
      title,
      description,
      mainTasks,
      deadline,
      dailyHours,
      weekendWork,
    },
  ) => {
    // Find user by Clerk ID instead of using getCurrentUser
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      throw new Error(`User with Clerk ID ${clerkId} not found`);
    }

    console.log("Creating project for user:", user._id);

    // Insert into database
    const projectId = await ctx.db.insert("projects", {
      userId: user._id,
      title,
      description,
      mainTasks,
      deadline,
      dailyHours,
      weekendWork,
      status: "active" as const,
      createdAt: new Date().getTime(),
    });

    return {
      projectId,
      project: {
        title,
        description,
        mainTasks,
        deadline,
        dailyHours,
        weekendWork,
        status: "active" as const,
        createdAt: new Date().getTime(),
      },
    };
  },
});

// Public action to create a project (callable from external APIs)
export const createProjectAction = action({
  args: {
    clerkId: v.string(),
    title: v.string(),
    description: v.string(),
    mainTasks: v.array(v.string()),
    deadline: v.string(),
    dailyHours: v.number(),
    weekendWork: v.boolean(),
  },
  returns: v.object({
    projectId: v.id("projects"),
    project: v.object({
      title: v.string(),
      description: v.string(),
      mainTasks: v.array(v.string()),
      deadline: v.string(),
      dailyHours: v.number(),
      weekendWork: v.boolean(),
      status: v.union(
        v.literal("active"),
        v.literal("complete"),
        v.literal("cancelled"),
      ),
      createdAt: v.number(),
    }),
  }),
  handler: async (
    ctx,
    {
      clerkId,
      title,
      description,
      mainTasks,
      deadline,
      dailyHours,
      weekendWork,
    },
  ) => {
    // Call the internal mutation for actual database operations
    // calls the create project mutation from external sources
    const result: CreateProjectResult = await ctx.runMutation(
      internal.projects.createProject,
      {
        clerkId,
        title,
        description,
        mainTasks,
        deadline,
        dailyHours,
        weekendWork,
      },
    );

    return result;
  },
});
