import { and, count, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  agentPresets,
  aiModels,
  benchmarks,
  deviceProfiles,
  modelConfigurations,
  modelSessions,
  promptTemplates,
  sessionMessages,
  systemLogs,
  type AgentPreset,
  type AIModel,
  type Benchmark,
  type DeviceProfile,
  type ModelConfiguration,
  type ModelSession,
  type NewAgentPreset,
  type NewModelConfiguration,
  type NewPromptTemplate,
  type PromptTemplate,
  type SystemLog,
} from "@/db/schema";

export type SessionUser = {
  id: number;
  email: string;
  displayName: string;
  role: "admin" | "moderator" | "user" | "viewer";
};

type PageInput = {
  limit?: number;
  offset?: number;
};

type SmartConfigInput = {
  modelId: number;
  configName?: string;
  useCaseCategory: string;
  gpuModel?: string;
  gpuVramMb?: number;
  cpuCores?: number;
  totalRamMb?: number;
};

type BenchmarkInput = {
  modelId: number;
  configurationId?: number;
  deviceProfileId?: number;
  benchmarkPrompt: string;
  benchmarkName?: string;
};

const defaultPage = { limit: 20, offset: 0 };

export async function getDashboardOverview(user: SessionUser) {
  const [
    [modelCount],
    [configurationCount],
    [benchmarkCount],
    [agentCount],
    activeSessions,
    latestBenchmarks,
    latestLogs,
  ] = await Promise.all([
    db.select({ value: count() }).from(aiModels).where(isNull(aiModels.deletedAt)),
    db
      .select({ value: count() })
      .from(modelConfigurations)
      .where(scopedSoftDelete(modelConfigurations.userId, user.id, modelConfigurations.deletedAt)),
    db
      .select({ value: count() })
      .from(benchmarks)
      .where(eq(benchmarks.userId, user.id)),
    db
      .select({ value: count() })
      .from(agentPresets)
      .where(scopedSoftDelete(agentPresets.userId, user.id, agentPresets.deletedAt)),
    listSessions(user, { status: "active", limit: 5 }),
    listBenchmarks(user, { limit: 5 }),
    listLogs(user, { limit: 8 }),
  ]);

  const [performance] = await db
    .select({
      avgTokensPerSecond: sql<number>`coalesce(avg(${benchmarks.tokensPerSecond}), 0)`,
      avgLatencyMs: sql<number>`coalesce(avg(${benchmarks.latencyMs}), 0)`,
    })
    .from(benchmarks)
    .where(eq(benchmarks.userId, user.id));

  return {
    totals: {
      models: modelCount.value,
      configurations: configurationCount.value,
      benchmarks: benchmarkCount.value,
      agents: agentCount.value,
      activeSessions: activeSessions.length,
    },
    performance,
    activeSessions,
    latestBenchmarks,
    latestLogs,
  };
}

export async function listModels({ limit, offset }: PageInput = defaultPage) {
  return db
    .select()
    .from(aiModels)
    .where(isNull(aiModels.deletedAt))
    .orderBy(desc(aiModels.isActive), aiModels.provider, aiModels.family)
    .limit(limit ?? defaultPage.limit)
    .offset(offset ?? defaultPage.offset);
}

export async function getModel(id: number) {
  const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id)).limit(1);

  return model;
}

export async function listConfigurations(
  user: SessionUser,
  { limit, offset }: PageInput = defaultPage,
) {
  return db
    .select({
      configuration: modelConfigurations,
      model: aiModels,
    })
    .from(modelConfigurations)
    .innerJoin(aiModels, eq(modelConfigurations.modelId, aiModels.id))
    .where(scopedSoftDelete(modelConfigurations.userId, user.id, modelConfigurations.deletedAt))
    .orderBy(desc(modelConfigurations.createdAt))
    .limit(limit ?? defaultPage.limit)
    .offset(offset ?? defaultPage.offset);
}

export async function createConfiguration(
  user: SessionUser,
  input: Omit<NewModelConfiguration, "userId">,
) {
  const [configuration] = await db
    .insert(modelConfigurations)
    .values({
      ...input,
      userId: user.id,
    })
    .returning();

  await logEvent(user, {
    eventType: "configuration_change",
    title: "Configuration created",
    message: configuration.configName,
    metadata: { configurationId: configuration.id, modelId: configuration.modelId },
  });

  return configuration;
}

export async function generateSmartConfiguration(user: SessionUser, input: SmartConfigInput) {
  const model = await getModel(input.modelId);

  if (!model) {
    throw new Error("Model not found.");
  }

  const useCase = input.useCaseCategory || "general_chat";
  const vram = input.gpuVramMb ?? model.recommendedVramMb ?? 4096;
  const ram = input.totalRamMb ?? model.recommendedRamMb ?? 8192;
  const contextTarget = chooseContextWindow(model, useCase, vram, ram);
  const config = await createConfiguration(user, {
    modelId: model.id,
    configName:
      input.configName ??
      `${model.name} ${useCase.replaceAll("_", " ")} optimized profile`,
    description: `Hardware-aware profile generated for ${input.gpuModel ?? "CPU/GPU"} with ${vram}MB VRAM.`,
    temperature: chooseTemperature(useCase),
    topP: useCase === "coding" || useCase === "cybersecurity" ? "0.90" : "0.95",
    topK: useCase === "creative_writing" ? 80 : 40,
    repeatPenalty: "1.10",
    contextSize: contextTarget,
    maxTokens: Math.min(4096, Math.floor(contextTarget / 2)),
    gpuLayers: estimateGpuLayers(model, vram),
    batchSize: vram >= 12000 ? 8 : vram >= 8000 ? 4 : 1,
    systemPrompt: getSystemPrompt(useCase),
    useCaseCategory: useCase,
    isPublic: false,
    metadata: {
      generatedBy: "NeuroForge Smart Configuration Generator",
      hardware: {
        gpuModel: input.gpuModel,
        gpuVramMb: vram,
        cpuCores: input.cpuCores,
        totalRamMb: ram,
      },
      recommendation: getRecommendation(model, vram, ram),
    },
  });

  return config;
}

export async function listBenchmarks(
  user: SessionUser,
  { limit, offset }: PageInput = defaultPage,
) {
  return db
    .select({
      benchmark: benchmarks,
      model: aiModels,
      configuration: modelConfigurations,
    })
    .from(benchmarks)
    .innerJoin(aiModels, eq(benchmarks.modelId, aiModels.id))
    .leftJoin(modelConfigurations, eq(benchmarks.configurationId, modelConfigurations.id))
    .where(eq(benchmarks.userId, user.id))
    .orderBy(desc(benchmarks.createdAt))
    .limit(limit ?? defaultPage.limit)
    .offset(offset ?? defaultPage.offset);
}

export async function runBenchmark(user: SessionUser, input: BenchmarkInput) {
  const model = await getModel(input.modelId);

  if (!model) {
    throw new Error("Model not found.");
  }

  const tokensPerSecond = simulateTokensPerSecond(model);
  const latencyMs = simulateLatency(model, tokensPerSecond);
  const promptTokens = Math.max(Math.ceil(input.benchmarkPrompt.length / 4), 8);
  const completionTokens = Math.max(Math.floor(tokensPerSecond * 4), 64);

  const [benchmark] = await db
    .insert(benchmarks)
    .values({
      userId: user.id,
      modelId: model.id,
      configurationId: input.configurationId,
      deviceProfileId: input.deviceProfileId,
      benchmarkName: input.benchmarkName ?? `${model.name} benchmark`,
      benchmarkPrompt: input.benchmarkPrompt,
      benchmarkResult: `Simulated benchmark completed for ${model.name}.`,
      tokensPerSecond,
      latencyMs,
      ttftMs: Math.round(latencyMs * 0.35),
      vramUsedMb: Math.min(
        model.recommendedVramMb ? model.recommendedVramMb + 512 : 4096,
        24576,
      ),
      ramUsedMb: model.recommendedRamMb ?? 8192,
      cpuUsagePercent: Math.round((20 + Math.random() * 55) * 100) / 100,
      promptTokens,
      completionTokens,
      notes: "Synthetic benchmark runner. Replace with Ollama/llama.cpp execution adapter.",
    })
    .returning();

  await logEvent(user, {
    eventType: "benchmark_execution",
    title: "Benchmark completed",
    message: `${model.name}: ${tokensPerSecond} tok/s`,
    metadata: { benchmarkId: benchmark.id, modelId: model.id },
  });

  return benchmark;
}

export async function listAgents(
  user: SessionUser,
  { limit, offset }: PageInput = defaultPage,
) {
  return db
    .select({
      agent: agentPresets,
      model: aiModels,
      configuration: modelConfigurations,
    })
    .from(agentPresets)
    .innerJoin(aiModels, eq(agentPresets.modelId, aiModels.id))
    .leftJoin(modelConfigurations, eq(agentPresets.configurationId, modelConfigurations.id))
    .where(scopedSoftDelete(agentPresets.userId, user.id, agentPresets.deletedAt))
    .orderBy(desc(agentPresets.createdAt))
    .limit(limit ?? defaultPage.limit)
    .offset(offset ?? defaultPage.offset);
}

export async function createAgent(user: SessionUser, input: Omit<NewAgentPreset, "userId">) {
  const [agent] = await db
    .insert(agentPresets)
    .values({ ...input, userId: user.id })
    .returning();

  await logEvent(user, {
    eventType: "configuration_change",
    title: "Agent preset created",
    message: agent.name,
    metadata: { agentId: agent.id, modelId: agent.modelId },
  });

  return agent;
}

export async function listPrompts(
  user: SessionUser,
  { limit, offset }: PageInput = defaultPage,
) {
  return db
    .select()
    .from(promptTemplates)
    .where(scopedSoftDelete(promptTemplates.userId, user.id, promptTemplates.deletedAt))
    .orderBy(desc(promptTemplates.updatedAt))
    .limit(limit ?? defaultPage.limit)
    .offset(offset ?? defaultPage.offset);
}

export async function createPrompt(user: SessionUser, input: Omit<NewPromptTemplate, "userId">) {
  const [prompt] = await db
    .insert(promptTemplates)
    .values({ ...input, userId: user.id })
    .returning();

  await logEvent(user, {
    eventType: "configuration_change",
    title: "Prompt template created",
    message: prompt.title,
    metadata: { promptId: prompt.id },
  });

  return prompt;
}

export async function testPrompt(user: SessionUser, promptId: number, modelId: number) {
  const [prompt] = await db
    .select()
    .from(promptTemplates)
    .where(and(eq(promptTemplates.id, promptId), eq(promptTemplates.userId, user.id)))
    .limit(1);
  const model = await getModel(modelId);

  if (!prompt || !model) {
    throw new Error("Prompt or model not found.");
  }

  const result = {
    promptId,
    modelId,
    modelName: model.name,
    output: `Simulated ${model.name} response for prompt "${prompt.title}".`,
    tokensUsed: Math.ceil(prompt.content.length / 4) + 96,
    latencyMs: simulateLatency(model, simulateTokensPerSecond(model)),
  };

  await logEvent(user, {
    eventType: "model_execution",
    title: "Prompt tested",
    message: `${prompt.title} on ${model.name}`,
    metadata: result,
  });

  return result;
}

export async function listSessions(
  user: SessionUser,
  options: PageInput & { status?: ModelSession["status"] } = defaultPage,
) {
  const filters = [eq(modelSessions.userId, user.id)];

  if (options.status) {
    filters.push(eq(modelSessions.status, options.status));
  }

  return db
    .select({
      session: modelSessions,
      model: aiModels,
      configuration: modelConfigurations,
      agent: agentPresets,
    })
    .from(modelSessions)
    .innerJoin(aiModels, eq(modelSessions.modelId, aiModels.id))
    .innerJoin(modelConfigurations, eq(modelSessions.configurationId, modelConfigurations.id))
    .leftJoin(agentPresets, eq(modelSessions.agentPresetId, agentPresets.id))
    .where(and(...filters))
    .orderBy(desc(modelSessions.startedAt))
    .limit(options.limit ?? defaultPage.limit)
    .offset(options.offset ?? defaultPage.offset);
}

export async function startSession(
  user: SessionUser,
  input: {
    modelId: number;
    configurationId: number;
    agentPresetId?: number;
    sessionName?: string;
  },
) {
  const [session] = await db
    .insert(modelSessions)
    .values({
      userId: user.id,
      modelId: input.modelId,
      configurationId: input.configurationId,
      agentPresetId: input.agentPresetId,
      sessionName: input.sessionName ?? "NeuroForge model session",
      status: "active",
      totalTokensUsed: 0,
      estimatedCost: "0",
      metadata: { runtime: "simulated", orchestrator: "NeuroForge" },
    })
    .returning();

  await logEvent(user, {
    eventType: "session_event",
    title: "Model session started",
    message: session.sessionName ?? `Session ${session.id}`,
    metadata: { sessionId: session.id, modelId: session.modelId },
  });

  return session;
}

export async function stopSession(user: SessionUser, sessionId: number) {
  const [session] = await db
    .update(modelSessions)
    .set({ status: "completed", endedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(modelSessions.id, sessionId), eq(modelSessions.userId, user.id)))
    .returning();

  if (session) {
    await logEvent(user, {
      eventType: "session_event",
      title: "Model session stopped",
      message: session.sessionName ?? `Session ${session.id}`,
      metadata: { sessionId: session.id },
    });
  }

  return session;
}

export async function sendSessionMessage(
  user: SessionUser,
  sessionId: number,
  content: string,
) {
  const [session] = await db
    .select()
    .from(modelSessions)
    .where(and(eq(modelSessions.id, sessionId), eq(modelSessions.userId, user.id)))
    .limit(1);

  if (!session) {
    throw new Error("Session not found.");
  }

  const userTokens = Math.ceil(content.length / 4);
  const assistantContent = `Simulated response from NeuroForge runtime for: ${content}`;
  const assistantTokens = Math.ceil(assistantContent.length / 4);

  const [message] = await db
    .insert(sessionMessages)
    .values({
      sessionId,
      role: "user",
      content,
      tokensUsed: userTokens,
    })
    .returning();

  const [assistantMessage] = await db
    .insert(sessionMessages)
    .values({
      sessionId,
      role: "assistant",
      content: assistantContent,
      tokensUsed: assistantTokens,
    })
    .returning();

  await db
    .update(modelSessions)
    .set({
      totalTokensUsed: (session.totalTokensUsed ?? 0) + userTokens + assistantTokens,
      promptTokens: (session.promptTokens ?? 0) + userTokens,
      completionTokens: (session.completionTokens ?? 0) + assistantTokens,
      updatedAt: new Date(),
    })
    .where(eq(modelSessions.id, sessionId));

  return { message, assistantMessage };
}

export async function listLogs(user: SessionUser, { limit, offset }: PageInput = defaultPage) {
  return db
    .select()
    .from(systemLogs)
    .where(user.role === "admin" ? undefined : eq(systemLogs.userId, user.id))
    .orderBy(desc(systemLogs.createdAt))
    .limit(limit ?? defaultPage.limit)
    .offset(offset ?? defaultPage.offset);
}

export async function getSystemHealth(user: SessionUser) {
  const [device] = await db
    .select()
    .from(deviceProfiles)
    .where(eq(deviceProfiles.userId, user.id))
    .orderBy(desc(deviceProfiles.createdAt))
    .limit(1);
  const activeSessions = await listSessions(user, { status: "active", limit: 20 });
  const recentLogs = await listLogs(user, { limit: 20 });

  return {
    status: recentLogs.some((log) => log.level === "critical" || log.level === "error")
      ? "degraded"
      : "operational",
    runtime: {
      ollama: "adapter-ready",
      llamaCpp: "adapter-ready",
      vllm: "adapter-ready",
      cloudProviders: ["openai", "anthropic", "google_gemini"],
    },
    activeSessions: activeSessions.length,
    device: device ?? null,
    lastCheckedAt: new Date().toISOString(),
  };
}

export async function logEvent(
  user: SessionUser,
  input: Pick<SystemLog, "eventType" | "title"> &
    Partial<Pick<SystemLog, "message" | "metadata" | "level" | "statusCode">>,
) {
  const [log] = await db
    .insert(systemLogs)
    .values({
      userId: user.id,
      eventType: input.eventType,
      level: input.level ?? "info",
      title: input.title,
      message: input.message,
      metadata: input.metadata,
      statusCode: input.statusCode ?? 200,
    })
    .returning();

  return log;
}

export type PlatformModel = AIModel;
export type PlatformConfiguration = ModelConfiguration;
export type PlatformBenchmark = Benchmark;
export type PlatformAgent = AgentPreset;
export type PlatformPrompt = PromptTemplate;
export type PlatformDevice = DeviceProfile;

function scopedSoftDelete<TUserColumn, TDeletedColumn>(
  userColumn: TUserColumn,
  userId: number,
  deletedColumn: TDeletedColumn,
) {
  return and(eq(userColumn as never, userId), isNull(deletedColumn as never));
}

function chooseTemperature(useCase: string) {
  if (useCase === "coding" || useCase === "cybersecurity" || useCase === "rag") {
    return "0.20";
  }

  if (useCase === "creative_writing") {
    return "0.85";
  }

  return "0.60";
}

function chooseContextWindow(model: AIModel, useCase: string, vram: number, ram: number) {
  const maxContext = model.contextWindow ?? 4096;
  const target =
    useCase === "rag" || useCase === "research" || useCase === "agents"
      ? maxContext
      : Math.min(maxContext, 4096);

  if (vram < 6000 || ram < 12000) {
    return Math.min(target, 4096);
  }

  return target;
}

function estimateGpuLayers(model: AIModel, vram: number) {
  const params = model.parameterCount ?? 7000000000;
  const sizeFactor = Math.max(params / 7000000000, 1);

  return Math.max(Math.floor(vram / 512 / sizeFactor), 8);
}

function getSystemPrompt(useCase: string) {
  const prompts: Record<string, string> = {
    coding: "You are a precise coding assistant. Prefer concise, tested solutions.",
    cybersecurity: "You are a defensive security assistant. Focus on authorized analysis and mitigation.",
    rag: "You are a retrieval-augmented assistant. Ground answers in provided context.",
    agents: "You are an autonomous task assistant. Plan, act, verify, and report.",
    creative_writing: "You are a creative writing partner with vivid but controlled style.",
  };

  return prompts[useCase] ?? "You are a helpful local AI assistant.";
}

function getRecommendation(model: AIModel, vram: number, ram: number) {
  if (model.recommendedVramMb && vram < model.recommendedVramMb) {
    return "Use lower quantization, smaller context, or CPU offload.";
  }

  if (model.recommendedRamMb && ram < model.recommendedRamMb) {
    return "Increase system RAM or choose a smaller model.";
  }

  return "Hardware profile is suitable for this model.";
}

function simulateTokensPerSecond(model: AIModel) {
  const params = model.parameterCount ?? 7000000000;
  const base = 95 / Math.max(params / 7000000000, 1);
  const quantBoost = model.quantization?.includes("q4") ? 1.25 : 1;

  return Math.round((base * quantBoost + Math.random() * 12) * 100) / 100;
}

function simulateLatency(model: AIModel, tokensPerSecond: number) {
  const contextPenalty = (model.contextWindow ?? 4096) / 4096;

  return Math.round((600 / Math.max(tokensPerSecond / 20, 1)) * contextPenalty);
}
