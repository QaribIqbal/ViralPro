import { getCurrentUser } from "@/server/auth/get-current-user";
import { listImagesForUser } from "@/server/services/images";
import { imageListQuerySchema } from "@/server/validation/image.schema";
import { errorResponse, successResponse } from "@/server/utils/api-response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    imageListQuerySchema.parse({
      articleId: searchParams.get("articleId") ?? undefined,
    });
    const images = await listImagesForUser(user.id, request.url);

    return successResponse(images);
  } catch (error) {
    return errorResponse(error);
  }
}
