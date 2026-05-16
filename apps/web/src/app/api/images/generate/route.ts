import { getCurrentUser } from "@/server/auth/get-current-user";
import { generateImageForUser } from "@/server/services/images";
import { generateImageSchema } from "@/server/validation/image.schema";
import { errorResponse, successResponse } from "@/server/utils/api-response";
import { ApiError } from "@/server/utils/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json().catch(() => {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON request body.");
    });
    const input = generateImageSchema.parse(body);
    const image = await generateImageForUser(user.id, input);

    return successResponse(image);
  } catch (error) {
    return errorResponse(error);
  }
}
