import {
  createApiResponse,
  createCorsHandler,
  createErrorResponse,
  extractVapiToolCall,
} from "@/lib/vapiUtils";
import { NextRequest } from "next/server";
import { router } from "./router";

// handle CORS errors
export function OPTIONS() {
  return createCorsHandler();
}

export async function POST(request: NextRequest) {
  const logPrefix = "[VAPI Project API]";

  try {
    const body = await request.json();
    console.log(`${logPrefix} Recieved body: ${JSON.stringify(body)}`);

    const {
      arguments: args,
      toolCallId,
      functionName,
    } = extractVapiToolCall(body);

    // check for the function name and tool call to make sure they are present
    if (!functionName || !toolCallId) {
      return createErrorResponse("Missing function name or tool call ID", 400);
    }

    // if the body is correct, function and tool exists, we pass it to the router to handle the request with the appropriate route handler
    const result = await router({
      arguments: args,
      toolCallId,
      functionName,
    });

    // function execution result
    console.log(`${logPrefix} 📤 Response:`, JSON.stringify(result, null, 2));

    // The way this works is -> success -> vapi response returned in result -> wrapped in api response -> returned to vapi in the correct format
    return createApiResponse(result);
  } catch (error) {
    console.error(`${logPrefix} Error: ${error}`);
    return createErrorResponse("Internal server error", 500);
  }
}
