import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { modelConfigurations } from "@/db/schema";
import {
  handleMobileError,
  mobileError,
  mobileSuccess,
  requireMobileSession,
} from "@/lib/mobile-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { id } = await context.params;
  const [configuration] = await db
    .select()
    .from(modelConfigurations)
    .where(
      and(
        eq(modelConfigurations.id, Number(id)),
        eq(modelConfigurations.userId, session.id),
        isNull(modelConfigurations.deletedAt),
      ),
    )
    .limit(1);

  if (!configuration) {
    return mobileError("Configuration not found.", { code: "NOT_FOUND", status: 404 });
  }

  return mobileSuccess(configuration);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const [configuration] = await db
      .update(modelConfigurations)
      .set({
        configName: body.configName,
        description: body.description,
        temperature: body.temperature,
        topP: body.topP,
        topK: body.topK ? Number(body.topK) : undefined,
        repeatPenalty: body.repeatPenalty,
        contextSize: body.contextSize ? Number(body.contextSize) : undefined,
        maxTokens: body.maxTokens ? Number(body.maxTokens) : undefined,
        gpuLayers: body.gpuLayers ? Number(body.gpuLayers) : undefined,
        batchSize: body.batchSize ? Number(body.batchSize) : undefined,
        systemPrompt: body.systemPrompt,
        useCaseCategory: body.useCaseCategory,
        isPublic: body.isPublic,
        metadata: body.metadata,
        updatedAt: new Date(),
      })
      .where(and(eq(modelConfigurations.id, Number(id)), eq(modelConfigurations.userId, session.id)))
      .returning();

    if (!configuration) {
      return mobileError("Configuration not found.", { code: "NOT_FOUND", status: 404 });
    }

    return mobileSuccess(configuration);
  } catch (error) {
    return handleMobileError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { id } = await context.params;
  const [configuration] = await db
    .update(modelConfigurations)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(modelConfigurations.id, Number(id)), eq(modelConfigurations.userId, session.id)))
    .returning({ id: modelConfigurations.id });

  if (!configuration) {
    return mobileError("Configuration not found.", { code: "NOT_FOUND", status: 404 });
  }

  return mobileSuccess({ deleted: true, id: configuration.id });
}
