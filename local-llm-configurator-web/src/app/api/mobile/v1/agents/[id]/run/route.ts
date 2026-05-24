import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { agentPresets, aiModels, modelConfigurations, modelSessions, sessionMessages } from "@/db/schema";
import {
  handleMobileError,
  mobileError,
  mobileSuccess,
  requireMobileSession,
  requiredString,
} from "@/lib/mobile-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const prompt = requiredString(body.prompt, "prompt");
    const [agent] = await db
      .select()
      .from(agentPresets)
      .where(and(eq(agentPresets.id, Number(id)), eq(agentPresets.userId, session.id)))
      .limit(1);

    if (!agent) return mobileError("Agent preset not found.", { code: "NOT_FOUND", status: 404 });

    let configurationId = agent.configurationId;

    if (!configurationId) {
      const [configuration] = await db
        .select()
        .from(modelConfigurations)
        .where(and(eq(modelConfigurations.modelId, agent.modelId), eq(modelConfigurations.userId, session.id)))
        .limit(1);
      configurationId = configuration?.id ?? null;
    }

    if (!configurationId) {
      return mobileError("Agent requires a model configuration.", {
        code: "CONFIGURATION_REQUIRED",
        status: 409,
      });
    }

    const [model] = await db.select().from(aiModels).where(eq(aiModels.id, agent.modelId)).limit(1);
    const [modelSession] = await db
      .insert(modelSessions)
      .values({
        userId: session.id,
        modelId: agent.modelId,
        configurationId,
        agentPresetId: agent.id,
        sessionName: `${agent.name} mobile run`,
        status: "completed",
        endedAt: new Date(),
        totalTokensUsed: Math.ceil(prompt.length / 4) + 120,
        promptTokens: Math.ceil(prompt.length / 4),
        completionTokens: 120,
        estimatedCost: "0",
        metadata: { source: "mobile-agent-run" },
      })
      .returning();
    const output = `Simulated ${agent.name} response via ${model?.name ?? "model"}: ${prompt}`;
    const [message] = await db
      .insert(sessionMessages)
      .values({
        sessionId: modelSession.id,
        role: "assistant",
        content: output,
        tokensUsed: 120,
      })
      .returning();

    return mobileSuccess({ session: modelSession, message, output });
  } catch (error) {
    return handleMobileError(error);
  }
}
