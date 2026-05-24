import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { modelConfigurations } from "@/db/schema";
import {
  handleMobileError,
  mobileSuccess,
  parseMobileQuery,
  requireMobileSession,
  requiredNumber,
  requiredString,
} from "@/lib/mobile-api";

export async function GET(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { limit, offset, page, pageSize } = parseMobileQuery(request.url);
  const data = await db
    .select()
    .from(modelConfigurations)
    .where(and(eq(modelConfigurations.userId, session.id), isNull(modelConfigurations.deletedAt)))
    .orderBy(desc(modelConfigurations.createdAt))
    .limit(limit)
    .offset(offset);

  return mobileSuccess(data, { meta: { page, pageSize } });
}

export async function POST(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  try {
    const body = await request.json();
    const [configuration] = await db
      .insert(modelConfigurations)
      .values({
        userId: session.id,
        modelId: requiredNumber(body.modelId, "modelId"),
        configName: requiredString(body.configName, "configName"),
        description: body.description,
        temperature: body.temperature ?? "0.70",
        topP: body.topP ?? "0.95",
        topK: Number(body.topK ?? 40),
        repeatPenalty: body.repeatPenalty ?? "1.10",
        contextSize: Number(body.contextSize ?? 4096),
        maxTokens: Number(body.maxTokens ?? 2048),
        gpuLayers: Number(body.gpuLayers ?? 24),
        batchSize: Number(body.batchSize ?? 1),
        systemPrompt: body.systemPrompt,
        useCaseCategory: body.useCaseCategory ?? "general_chat",
        isPublic: Boolean(body.isPublic ?? false),
        metadata: body.metadata,
      })
      .returning();

    return mobileSuccess(configuration, { status: 201 });
  } catch (error) {
    return handleMobileError(error);
  }
}
