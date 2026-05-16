import { getCurrentUser } from "@/server/auth/get-current-user";
import {
  createTemplateForUser,
  listTemplatesForUser,
} from "@/server/services/templates";
import { createTemplateSchema } from "@/server/validation/template.schema";
import { errorResponse, successResponse } from "@/server/utils/api-response";
import { ApiError } from "@/server/utils/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json().catch(() => {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON request body.");
    });
    const input = createTemplateSchema.parse(body);
    const template = await createTemplateForUser(user.id, input);

    return successResponse(template, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    const templates = await listTemplatesForUser(user.id);

    return successResponse(templates);
  } catch (error) {
    return errorResponse(error);
  }
}
