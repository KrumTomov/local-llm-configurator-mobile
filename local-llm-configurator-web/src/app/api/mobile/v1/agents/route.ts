import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { agentPresets } from "@/db/schema";
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
    .from(agentPresets)
    .where(and(eq(agentPresets.userId, session.id), isNull(agentPresets.deletedAt)))
    .orderBy(desc(agentPresets.createdAt))
    .limit(limit)
    .offset(offset);

  return mobileSuccess(data, { meta: { page, pageSize } });
}

export async function POST(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  try {
    const body = await request.json();
    const [agent] = await db
      .insert(agentPresets)
      .values({
        userId: session.id,
        name: requiredString(body.name, "name"),
        description: body.description,
        systemPrompt: body.systemPrompt,
        modelId: requiredNumber(body.modelId, "modelId"),
        configurationId: body.configurationId ? Number(body.configurationId) : undefined,
        category: body.category ?? "assistant",
        visibility: body.visibility ?? "private",
        toolPermissions: body.toolPermissions ?? [],
        maxContextTokens: Number(body.maxContextTokens ?? 4096),
        temperature: body.temperature ?? "0.40",
        isActive: true,
        metadata: body.metadata,
      })
      .returning();

    return mobileSuccess(agent, { status: 201 });
  } catch (error) {
    return handleMobileError(error);
  }
}
