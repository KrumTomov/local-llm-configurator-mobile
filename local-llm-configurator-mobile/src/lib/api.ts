import { Platform } from 'react-native';

const DEFAULT_HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://127.0.0.1:3000';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? `${DEFAULT_HOST}/api/mobile/v1`;

export type ApiResult<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type User = {
  id: number;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  role: string;
  status?: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: User;
};

export type DashboardSummary = {
  totals: {
    models: number;
    configurations: number;
    benchmarks: number;
    agents: number;
    activeSessions: number;
  };
  performance: {
    avgTokensPerSecond: number;
    avgLatencyMs: number;
  };
  activeSessions: { session: ModelSession; model: AiModel }[];
  latestBenchmarks: { benchmark: Benchmark; model: AiModel }[];
  latestLogs: SystemLog[];
};

export type AiModel = {
  id: number;
  name: string;
  family: string;
  provider: string;
  modelType: string;
  quantization?: string | null;
  contextWindow?: number | null;
  recommendedVramMb?: number | null;
  recommendedRamMb?: number | null;
  availability: string;
  description?: string | null;
  isActive: boolean;
};

export type ModelConfiguration = {
  id: number;
  modelId: number;
  configName: string;
  description?: string | null;
  temperature?: string | null;
  contextSize?: number | null;
  maxTokens?: number | null;
  gpuLayers?: number | null;
  batchSize?: number | null;
  useCaseCategory?: string | null;
};

export type Benchmark = {
  id: number;
  modelId: number;
  benchmarkName?: string | null;
  tokensPerSecond?: number | null;
  latencyMs?: number | null;
  vramUsedMb?: number | null;
  benchmarkPrompt: string;
  createdAt: string;
};

export type PromptTemplate = {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  visibility: string;
  version?: number | null;
};

export type AgentPreset = {
  id: number;
  name: string;
  description?: string | null;
  modelId: number;
  configurationId?: number | null;
  category?: string | null;
  visibility: string;
};

export type ModelSession = {
  id: number;
  modelId: number;
  configurationId: number;
  agentPresetId?: number | null;
  sessionName?: string | null;
  status: string;
  totalTokensUsed?: number | null;
  startedAt: string;
};

export type SystemLog = {
  id: number;
  eventType: string;
  level: string;
  title: string;
  message?: string | null;
  createdAt: string;
};

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
) {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const payload = (await response.json().catch(() => null)) as ApiResult<T> | null;

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.error?.message ?? 'Unable to complete request.',
      payload?.error?.code ?? 'REQUEST_FAILED',
      response.status,
    );
  }

  return payload;
}
