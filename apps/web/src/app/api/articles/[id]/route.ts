import { getCurrentUser } from "@/server/auth/get-current-user";
import {
  deleteArticleForUser,
  getArticleForUser,
} from "@/server/services/articles";
import { errorResponse, successResponse } from "@/server/utils/api-response";

export const runtime = "nodejs";

type ArticleRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: ArticleRouteContext) {
  try {
    const user = await getCurrentUser();
    const { id } = await context.params;
    const article = await getArticleForUser(user.id, id);

    return successResponse(article);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: ArticleRouteContext) {
  try {
    const user = await getCurrentUser();
    const { id } = await context.params;
    const result = await deleteArticleForUser(user.id, id);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
