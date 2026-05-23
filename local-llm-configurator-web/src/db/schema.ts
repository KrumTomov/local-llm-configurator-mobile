import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  foreignKey,
  pgEnum,
  serial,
  smallint,
  jsonb,
  real,
  bigint,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'moderator',
  'user',
  'viewer',
]);

export const userStatusEnum = pgEnum('user_status', [
  'active',
  'suspended',
  'deactivated',
  'pending_verification',
]);

export const modelTypeEnum = pgEnum('model_type', [
  'language_model',
  'embedding_model',
  'image_model',
  'multimodal_model',
  'code_model',
]);

export const modelProviderEnum = pgEnum('model_provider', [
  'openai',
  'anthropic',
  'huggingface',
  'ollama',
  'llama_cpp',
  'vllm',
  'other',
]);

export const quantizationEnum = pgEnum('quantization', [
  'fp32',
  'fp16',
  'int8',
  'int4',
  'gguf_q2',
  'gguf_q3',
  'gguf_q4',
  'gguf_q5',
  'gguf_q6',
  'gguf_q8',
]);

export const modelAvailabilityEnum = pgEnum('model_availability', [
  'local_only',
  'cloud_only',
  'hybrid',
]);

export const sessionStatusEnum = pgEnum('session_status', [
  'active',
  'completed',
  'paused',
  'error',
  'timeout',
  'cancelled',
]);

export const visibilityEnum = pgEnum('visibility', ['private', 'public', 'shared']);

export const logLevelEnum = pgEnum('log_level', [
  'debug',
  'info',
  'warning',
  'error',
  'critical',
]);

export const logEventTypeEnum = pgEnum('log_event_type', [
  'model_execution',
  'benchmark_execution',
  'authentication',
  'admin_action',
  'system_error',
  'configuration_change',
  'session_event',
]);

// ============================================================================
// TABLES
// ============================================================================

/**
 * USERS TABLE
 * Stores user account information with authentication and profile data
 */
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    displayName: varchar('display_name', { length: 255 }).notNull(),
    avatarUrl: varchar('avatar_url', { length: 512 }),
    role: userRoleEnum('role').notNull().default('user'),
    status: userStatusEnum('status').notNull().default('pending_verification'),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'), // soft delete
  },
  (table) => [
    uniqueIndex('idx_users_email').on(table.email),
    index('idx_users_status').on(table.status),
    index('idx_users_role').on(table.role),
    index('idx_users_created_at').on(table.createdAt),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  modelConfigurations: many(modelConfigurations),
  benchmarks: many(benchmarks),
  promptTemplates: many(promptTemplates),
  agentPresets: many(agentPresets),
  modelSessions: many(modelSessions),
  systemLogs: many(systemLogs),
  userPreferences: many(userPreferences),
}));

/**
 * USER_PREFERENCES TABLE
 * Stores user-specific settings and preferences
 */
export const userPreferences = pgTable(
  'user_preferences',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    theme: varchar('theme', { length: 50 }).default('light'),
    defaultModelId: integer('default_model_id'),
    defaultConfigurationId: integer('default_configuration_id'),
    notificationsEnabled: boolean('notifications_enabled').default(true),
    dataRetentionDays: integer('data_retention_days').default(90),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_user_preferences_user_id').on(table.userId),
  ]
);

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

/**
 * AI_MODELS TABLE
 * Stores metadata about available AI models
 */
export const aiModels = pgTable(
  'ai_models',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    family: varchar('family', { length: 255 }).notNull(),
    provider: modelProviderEnum('provider').notNull(),
    modelType: modelTypeEnum('model_type').notNull(),
    parameterCount: bigint('parameter_count', { mode: 'number' }),
    quantization: quantizationEnum('quantization'),
    contextWindow: integer('context_window'), // in tokens
    recommendedVramMb: integer('recommended_vram_mb'),
    recommendedRamMb: integer('recommended_ram_mb'),
    availability: modelAvailabilityEnum('availability').notNull(),
    description: text('description'),
    modelUrl: varchar('model_url', { length: 512 }),
    isActive: boolean('is_active').notNull().default(true),
    metadata: jsonb('metadata'), // additional fields like license, paper_url, etc.
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'), // soft delete
  },
  (table) => [
    index('idx_ai_models_provider').on(table.provider),
    index('idx_ai_models_family').on(table.family),
    index('idx_ai_models_model_type').on(table.modelType),
    index('idx_ai_models_is_active').on(table.isActive),
  ]
);

export const aiModelsRelations = relations(aiModels, ({ many }) => ({
  modelConfigurations: many(modelConfigurations),
  benchmarks: many(benchmarks),
  agentPresets: many(agentPresets),
  modelSessions: many(modelSessions),
  compatibleDevices: many(deviceProfiles),
}));

/**
 * MODEL_CONFIGURATIONS TABLE
 * Stores user-created or system configurations for AI models
 */
export const modelConfigurations = pgTable(
  'model_configurations',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    modelId: integer('model_id')
      .notNull()
      .references(() => aiModels.id),
    configName: varchar('config_name', { length: 255 }).notNull(),
    description: text('description'),
    temperature: decimal('temperature', { precision: 3, scale: 2 }).default('0.7'),
    topP: decimal('top_p', { precision: 3, scale: 2 }).default('1.0'),
    topK: integer('top_k').default(40),
    repeatPenalty: decimal('repeat_penalty', { precision: 3, scale: 2 }).default('1.1'),
    contextSize: integer('context_size'), // tokens
    maxTokens: integer('max_tokens'),
    gpuLayers: integer('gpu_layers'),
    batchSize: integer('batch_size').default(1),
    systemPrompt: text('system_prompt'),
    useCaseCategory: varchar('use_case_category', { length: 100 }),
    isPublic: boolean('is_public').notNull().default(false),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'), // soft delete
  },
  (table) => [
    index('idx_model_configurations_user_id').on(table.userId),
    index('idx_model_configurations_model_id').on(table.modelId),
    index('idx_model_configurations_is_public').on(table.isPublic),
  ]
);

export const modelConfigurationsRelations = relations(modelConfigurations, ({ one, many }) => ({
  user: one(users, {
    fields: [modelConfigurations.userId],
    references: [users.id],
  }),
  model: one(aiModels, {
    fields: [modelConfigurations.modelId],
    references: [aiModels.id],
  }),
  benchmarks: many(benchmarks),
  modelSessions: many(modelSessions),
  agentPresets: many(agentPresets),
}));

/**
 * DEVICE_PROFILES TABLE
 * Stores hardware profiles for benchmarking and resource management
 */
export const deviceProfiles = pgTable(
  'device_profiles',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    deviceName: varchar('device_name', { length: 255 }).notNull(),
    gpuModel: varchar('gpu_model', { length: 255 }),
    gpuVramMb: integer('gpu_vram_mb'),
    cpuCores: smallint('cpu_cores'),
    totalRamMb: integer('total_ram_mb'),
    osName: varchar('os_name', { length: 100 }),
    osVersion: varchar('os_version', { length: 100 }),
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_device_profiles_user_id').on(table.userId),
  ]
);

export const deviceProfilesRelations = relations(deviceProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [deviceProfiles.userId],
    references: [users.id],
  }),
  benchmarks: many(benchmarks),
}));

/**
 * BENCHMARKS TABLE
 * Stores performance test results for model configurations
 */
export const benchmarks = pgTable(
  'benchmarks',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    modelId: integer('model_id')
      .notNull()
      .references(() => aiModels.id),
    configurationId: integer('configuration_id').references(() => modelConfigurations.id),
    deviceProfileId: integer('device_profile_id').references(() => deviceProfiles.id),
    benchmarkName: varchar('benchmark_name', { length: 255 }),
    benchmarkPrompt: text('benchmark_prompt').notNull(),
    benchmarkResult: text('benchmark_result'),
    tokensPerSecond: real('tokens_per_second'),
    latencyMs: real('latency_ms'),
    ttftMs: real('ttft_ms'), // time to first token
    vramUsedMb: integer('vram_used_mb'),
    ramUsedMb: integer('ram_used_mb'),
    cpuUsagePercent: real('cpu_usage_percent'),
    completionTokens: integer('completion_tokens'),
    promptTokens: integer('prompt_tokens'),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_benchmarks_user_id').on(table.userId),
    index('idx_benchmarks_model_id').on(table.modelId),
    index('idx_benchmarks_configuration_id').on(table.configurationId),
    index('idx_benchmarks_device_profile_id').on(table.deviceProfileId),
    index('idx_benchmarks_created_at').on(table.createdAt),
  ]
);

export const benchmarksRelations = relations(benchmarks, ({ one }) => ({
  user: one(users, {
    fields: [benchmarks.userId],
    references: [users.id],
  }),
  model: one(aiModels, {
    fields: [benchmarks.modelId],
    references: [aiModels.id],
  }),
  configuration: one(modelConfigurations, {
    fields: [benchmarks.configurationId],
    references: [modelConfigurations.id],
  }),
  deviceProfile: one(deviceProfiles, {
    fields: [benchmarks.deviceProfileId],
    references: [deviceProfiles.id],
  }),
}));

/**
 * PROMPT_TEMPLATES TABLE
 * Stores reusable prompt templates created by users
 */
export const promptTemplates = pgTable(
  'prompt_templates',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    content: text('content').notNull(),
    category: varchar('category', { length: 100 }),
    tags: text('tags'), // comma-separated or JSON array
    visibility: visibilityEnum('visibility').notNull().default('private'),
    version: integer('version').default(1),
    isActive: boolean('is_active').notNull().default(true),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'), // soft delete
  },
  (table) => [
    index('idx_prompt_templates_user_id').on(table.userId),
    index('idx_prompt_templates_visibility').on(table.visibility),
    index('idx_prompt_templates_category').on(table.category),
  ]
);

export const promptTemplatesRelations = relations(promptTemplates, ({ one }) => ({
  user: one(users, {
    fields: [promptTemplates.userId],
    references: [users.id],
  }),
}));

/**
 * AGENT_PRESETS TABLE
 * Stores configured AI agent presets with assigned models and configurations
 */
export const agentPresets = pgTable(
  'agent_presets',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    systemPrompt: text('system_prompt'),
    modelId: integer('model_id')
      .notNull()
      .references(() => aiModels.id),
    configurationId: integer('configuration_id').references(() => modelConfigurations.id),
    category: varchar('category', { length: 100 }),
    visibility: visibilityEnum('visibility').notNull().default('private'),
    toolPermissions: jsonb('tool_permissions'), // JSON array of tool IDs or names
    maxContextTokens: integer('max_context_tokens'),
    temperature: decimal('temperature', { precision: 3, scale: 2 }),
    isActive: boolean('is_active').notNull().default(true),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'), // soft delete
  },
  (table) => [
    index('idx_agent_presets_user_id').on(table.userId),
    index('idx_agent_presets_model_id').on(table.modelId),
    index('idx_agent_presets_visibility').on(table.visibility),
  ]
);

export const agentPresetsRelations = relations(agentPresets, ({ one, many }) => ({
  user: one(users, {
    fields: [agentPresets.userId],
    references: [users.id],
  }),
  model: one(aiModels, {
    fields: [agentPresets.modelId],
    references: [aiModels.id],
  }),
  configuration: one(modelConfigurations, {
    fields: [agentPresets.configurationId],
    references: [modelConfigurations.id],
  }),
  modelSessions: many(modelSessions),
}));

/**
 * MODEL_SESSIONS TABLE
 * Tracks active or historical model usage and interaction sessions
 */
export const modelSessions = pgTable(
  'model_sessions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    modelId: integer('model_id')
      .notNull()
      .references(() => aiModels.id),
    configurationId: integer('configuration_id')
      .notNull()
      .references(() => modelConfigurations.id),
    agentPresetId: integer('agent_preset_id').references(() => agentPresets.id),
    sessionName: varchar('session_name', { length: 255 }),
    status: sessionStatusEnum('status').notNull().default('active'),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    endedAt: timestamp('ended_at'),
    totalTokensUsed: integer('total_tokens_used').default(0),
    promptTokens: integer('prompt_tokens').default(0),
    completionTokens: integer('completion_tokens').default(0),
    estimatedCost: decimal('estimated_cost', { precision: 10, scale: 6 }),
    errorMessage: text('error_message'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_model_sessions_user_id').on(table.userId),
    index('idx_model_sessions_model_id').on(table.modelId),
    index('idx_model_sessions_status').on(table.status),
    index('idx_model_sessions_started_at').on(table.startedAt),
    index('idx_model_sessions_created_at').on(table.createdAt),
  ]
);

export const modelSessionsRelations = relations(modelSessions, ({ one }) => ({
  user: one(users, {
    fields: [modelSessions.userId],
    references: [users.id],
  }),
  model: one(aiModels, {
    fields: [modelSessions.modelId],
    references: [aiModels.id],
  }),
  configuration: one(modelConfigurations, {
    fields: [modelSessions.configurationId],
    references: [modelConfigurations.id],
  }),
  agentPreset: one(agentPresets, {
    fields: [modelSessions.agentPresetId],
    references: [agentPresets.id],
  }),
}));

/**
 * SESSION_MESSAGES TABLE
 * Stores conversation messages within model sessions
 */
export const sessionMessages = pgTable(
  'session_messages',
  {
    id: serial('id').primaryKey(),
    sessionId: integer('session_id')
      .notNull()
      .references(() => modelSessions.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 50 }).notNull(), // 'user', 'assistant', 'system'
    content: text('content').notNull(),
    tokensUsed: integer('tokens_used'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_session_messages_session_id').on(table.sessionId),
    index('idx_session_messages_created_at').on(table.createdAt),
  ]
);

export const sessionMessagesRelations = relations(sessionMessages, ({ one }) => ({
  session: one(modelSessions, {
    fields: [sessionMessages.sessionId],
    references: [modelSessions.id],
  }),
}));

/**
 * SYSTEM_LOGS TABLE
 * Comprehensive audit and system logging
 */
export const systemLogs = pgTable(
  'system_logs',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    eventType: logEventTypeEnum('event_type').notNull(),
    level: logLevelEnum('level').notNull().default('info'),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message'),
    metadata: jsonb('metadata'), // contextual data like model_id, session_id, etc.
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    statusCode: integer('status_code'),
    errorStackTrace: text('error_stack_trace'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_system_logs_user_id').on(table.userId),
    index('idx_system_logs_event_type').on(table.eventType),
    index('idx_system_logs_level').on(table.level),
    index('idx_system_logs_created_at').on(table.createdAt),
  ]
);

export const systemLogsRelations = relations(systemLogs, ({ one }) => ({
  user: one(users, {
    fields: [systemLogs.userId],
    references: [users.id],
  }),
}));

/**
 * API_KEYS TABLE
 * Stores user API keys for programmatic access
 */
export const apiKeys = pgTable(
  'api_keys',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    keyHash: text('key_hash').notNull(),
    keyName: varchar('key_name', { length: 255 }).notNull(),
    lastUsedAt: timestamp('last_used_at'),
    expiresAt: timestamp('expires_at'),
    isActive: boolean('is_active').notNull().default(true),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'), // soft delete
  },
  (table) => [
    index('idx_api_keys_user_id').on(table.userId),
    index('idx_api_keys_is_active').on(table.isActive),
  ]
);

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type ModelConfiguration = typeof modelConfigurations.$inferSelect;
export type NewModelConfiguration = typeof modelConfigurations.$inferInsert;

export type AIModel = typeof aiModels.$inferSelect;
export type NewAIModel = typeof aiModels.$inferInsert;

export type Benchmark = typeof benchmarks.$inferSelect;
export type NewBenchmark = typeof benchmarks.$inferInsert;

export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type NewPromptTemplate = typeof promptTemplates.$inferInsert;

export type AgentPreset = typeof agentPresets.$inferSelect;
export type NewAgentPreset = typeof agentPresets.$inferInsert;

export type ModelSession = typeof modelSessions.$inferSelect;
export type NewModelSession = typeof modelSessions.$inferInsert;

export type SessionMessage = typeof sessionMessages.$inferSelect;
export type NewSessionMessage = typeof sessionMessages.$inferInsert;

export type SystemLog = typeof systemLogs.$inferSelect;
export type NewSystemLog = typeof systemLogs.$inferInsert;

export type DeviceProfile = typeof deviceProfiles.$inferSelect;
export type NewDeviceProfile = typeof deviceProfiles.$inferInsert;

export type APIKey = typeof apiKeys.$inferSelect;
export type NewAPIKey = typeof apiKeys.$inferInsert;

export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;
