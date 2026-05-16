import { getCurrentUser } from "@/server/auth/get-current-user";
import { generateArticleForUser } from "@/server/services/articles";
import { generateArticleSchema } from "@/server/validation/article.schema";
import { errorResponse, successResponse } from "@/server/utils/api-response";
import { ApiError } from "@/server/utils/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json().catch(() => {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON request body.");
    });
    const input = generateArticleSchema.parse(body);
    const article = await generateArticleForUser(user.id, input);

    return successResponse(article);
  } catch (error) {
    return errorResponse(error);
  }
}
