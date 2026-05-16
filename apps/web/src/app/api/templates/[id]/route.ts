import { getCurrentUser } from "@/server/auth/get-current-user";
import { deleteTemplateForUser } from "@/server/services/templates";
import { errorResponse, successResponse } from "@/server/utils/api-response";

export const runtime = "nodejs";

type TemplateRouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: TemplateRouteContext) {
  try {
    const user = await getCurrentUser();
    const { id } = await context.params;
    const result = await deleteTemplateForUser(user.id, id);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
