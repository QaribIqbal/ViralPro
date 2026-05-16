import { getCurrentUser } from "@/server/auth/get-current-user";
import { listArticlesForUser } from "@/server/services/articles";
import { articleListQuerySchema } from "@/server/validation/article.schema";
import { errorResponse, successResponse } from "@/server/utils/api-response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    articleListQuerySchema.parse({
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    const articles = await listArticlesForUser(user.id, request.url);

    return successResponse(articles);
  } catch (error) {
    return errorResponse(error);
  }
}
