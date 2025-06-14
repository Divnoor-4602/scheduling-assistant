import { createVapiResponse, createVapiErrorResponse } from "@/lib/vapiUtils";
import { validateAndReturnCreateProjectArgs } from "./utils";
import { api } from "@/convex/_generated/api";
import { fetchAction } from "convex/nextjs";
import { CreateProjectResult } from "@/convex/shared.types";

/**
 * Creates a project from VAPI arguments
 * which is stored as-is in the database as a string
 */
export const createProject = async (
  args: Record<string, unknown>,
  toolCallId: string,
) => {
  try {
    // validate the arguments and proceed only if all the args needed are available
    // This includes validating the deadline as a valid ISO date string
    const validatedArgs = validateAndReturnCreateProjectArgs(args);

    // call the convex function to create the project using mutation
    const convexResult: CreateProjectResult = await fetchAction(
      api.projects.createProjectAction,
      validatedArgs,
    );

    return createVapiResponse(toolCallId, {
      success: true,
      projectId: convexResult.projectId,
      message: `Project "${validatedArgs.title}" created successfully`,
      data: convexResult,
    });
  } catch (error) {
    console.error("[Create Project] Error:", error);
    return createVapiErrorResponse(
      toolCallId,
      `Failed to create project: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
