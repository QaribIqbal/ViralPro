import { getCurrentUser } from "@/server/auth/get-current-user";
import { deleteImageForUser } from "@/server/services/images";
import { errorResponse, successResponse } from "@/server/utils/api-response";

export const runtime = "nodejs";

type ImageRouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: ImageRouteContext) {
  try {
    const user = await getCurrentUser();
    const { id } = await context.params;
    const result = await deleteImageForUser(user.id, id);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
