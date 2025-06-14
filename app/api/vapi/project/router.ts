import { createVapiErrorResponse, TVapiToolCall } from "@/lib/vapiUtils";
import { createProject } from "./handlers/createProject";

export const router = async ({
  arguments: args,
  toolCallId,
  functionName,
}: TVapiToolCall) => {
  // switch statement to route to the correct functions to handle the vapi assistant;s request

  switch (functionName) {
    case "create_project":
      return await createProject(args, toolCallId);
    default:
      const errorResponse = createVapiErrorResponse(
        toolCallId,
        "Invalid function name",
      );
      console.log(`[VAPI Project API] 📤 Error Response:`, errorResponse);
      return errorResponse;
  }
};
