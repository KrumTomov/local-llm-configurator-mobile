import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { aiModels } from "@/db/schema";
import {
  handleMobileError,
  mobileSuccess,
  parseMobileQuery,
  requireMobileSession,
} from "@/lib/mobile-api";

export async function GET(request: Request) {
  const { response } = await requireMobileSession(request);

  if (response) {
    return response;
  }

  try {
    const { limit, offset, page, pageSize, searchParams } = parseMobileQuery(request.url);
    const filters = [isNull(aiModels.deletedAt)];
    const provider = searchParams.get("provider");
    const family = searchParams.get("family");
    const modelType = searchParams.get("modelType");
    const quantization = searchParams.get("quantization");
    const availability = searchParams.get("availability");

    if (provider) filters.push(eq(aiModels.provider, provider as never));
    if (family) filters.push(eq(aiModels.family, family));
    if (modelType) filters.push(eq(aiModels.modelType, modelType as never));
    if (quantization) filters.push(eq(aiModels.quantization, quantization as never));
    if (availability) filters.push(eq(aiModels.availability, availability as never));

    const data = await db
      .select()
      .from(aiModels)
      .where(and(...filters))
      .limit(limit)
      .offset(offset);

    return mobileSuccess(data, { meta: { page, pageSize, filters: Object.fromEntries(searchParams) } });
  } catch (error) {
    return handleMobileError(error);
  }
}
