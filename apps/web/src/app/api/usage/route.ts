import { getCurrentUser } from "@/server/auth/get-current-user";
import { getUsageSummary } from "@/server/services/usage";
import { errorResponse, successResponse } from "@/server/utils/api-response";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const usage = await getUsageSummary(user);

    return successResponse(usage);
  } catch (error) {
    return errorResponse(error);
  }
}
