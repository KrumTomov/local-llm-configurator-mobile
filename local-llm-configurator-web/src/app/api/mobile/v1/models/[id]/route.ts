import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { aiModels } from "@/db/schema";
import { handleMobileError, mobileError, mobileSuccess, requireMobileSession } from "@/lib/mobile-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { response } = await requireMobileSession(request);

  if (response) {
    return response;
  }

  try {
    const { id } = await context.params;
    const [model] = await db
      .select()
      .from(aiModels)
      .where(and(eq(aiModels.id, Number(id)), isNull(aiModels.deletedAt)))
      .limit(1);

    if (!model) {
      return mobileError("Model not found.", { code: "NOT_FOUND", status: 404 });
    }

    return mobileSuccess(model);
  } catch (error) {
    return handleMobileError(error);
  }
}
