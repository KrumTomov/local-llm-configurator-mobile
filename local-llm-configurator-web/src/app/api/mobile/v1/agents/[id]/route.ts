import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { agentPresets } from "@/db/schema";
import { handleMobileError, mobileError, mobileSuccess, requireMobileSession } from "@/lib/mobile-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { id } = await context.params;
  const [agent] = await db
    .select()
    .from(agentPresets)
    .where(and(eq(agentPresets.id, Number(id)), eq(agentPresets.userId, session.id), isNull(agentPresets.deletedAt)))
    .limit(1);

  if (!agent) return mobileError("Agent preset not found.", { code: "NOT_FOUND", status: 404 });

  return mobileSuccess(agent);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const [agent] = await db
      .update(agentPresets)
      .set({
        name: body.name,
        description: body.description,
        systemPrompt: body.systemPrompt,
        modelId: body.modelId ? Number(body.modelId) : undefined,
        configurationId: body.configurationId ? Number(body.configurationId) : undefined,
        category: body.category,
        visibility: body.visibility,
        toolPermissions: body.toolPermissions,
        maxContextTokens: body.maxContextTokens ? Number(body.maxContextTokens) : undefined,
        temperature: body.temperature,
        isActive: body.isActive,
        metadata: body.metadata,
        updatedAt: new Date(),
      })
      .where(and(eq(agentPresets.id, Number(id)), eq(agentPresets.userId, session.id)))
      .returning();

    if (!agent) return mobileError("Agent preset not found.", { code: "NOT_FOUND", status: 404 });

    return mobileSuccess(agent);
  } catch (error) {
    return handleMobileError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { id } = await context.params;
  const [agent] = await db
    .update(agentPresets)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(agentPresets.id, Number(id)), eq(agentPresets.userId, session.id)))
    .returning({ id: agentPresets.id });

  if (!agent) return mobileError("Agent preset not found.", { code: "NOT_FOUND", status: 404 });

  return mobileSuccess({ deleted: true, id: agent.id });
}
