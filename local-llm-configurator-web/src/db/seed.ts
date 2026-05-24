import { randomBytes, scryptSync } from 'crypto';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = postgres(DATABASE_URL);
const db = drizzle(sql, { schema });

// Helper to generate random strings
function randomString(length: number): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

// Helper to generate password hash for demo users. Default password: Password123
function generatePasswordHash(): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync('Password123', salt, 64).toString('hex');

  return `scrypt$${salt}$${hash}`;
}

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (optional - comment out if you want to keep data)
    // await db.delete(schema.systemLogs);
    // await db.delete(schema.sessionMessages);
    // await db.delete(schema.modelSessions);
    // await db.delete(schema.benchmarks);
    // await db.delete(schema.agentPresets);
    // await db.delete(schema.promptTemplates);
    // await db.delete(schema.apiKeys);
    // await db.delete(schema.userPreferences);
    // await db.delete(schema.deviceProfiles);
    // await db.delete(schema.modelConfigurations);
    // await db.delete(schema.users);
    // await db.delete(schema.aiModels);

    // Seed AI Models (20 realistic models)
    console.log('📦 Seeding AI models...');
    const models = await db
      .insert(schema.aiModels)
      .values([
        // LLaMA family
        {
          name: 'Llama 2 7B',
          family: 'Llama',
          provider: 'ollama',
          modelType: 'language_model',
          parameterCount: 7000000000,
          quantization: 'gguf_q4',
          contextWindow: 4096,
          recommendedVramMb: 4096,
          recommendedRamMb: 8192,
          availability: 'local_only',
          isActive: true,
          description: 'Llama 2 7B quantized model optimized for local deployment',
          metadata: {
            license: 'Llama 2 Community License',
            paperUrl: 'https://arxiv.org/abs/2307.09288',
            releaseDate: '2023-07-18',
          },
        },
        {
          name: 'Llama 2 13B',
          family: 'Llama',
          provider: 'ollama',
          modelType: 'language_model',
          parameterCount: 13000000000,
          quantization: 'gguf_q4',
          contextWindow: 4096,
          recommendedVramMb: 6144,
          recommendedRamMb: 12288,
          availability: 'local_only',
          isActive: true,
          description: 'Llama 2 13B model with improved reasoning',
          metadata: {
            license: 'Llama 2 Community License',
            paperUrl: 'https://arxiv.org/abs/2307.09288',
          },
        },
        {
          name: 'Mistral 7B',
          family: 'Mistral',
          provider: 'ollama',
          modelType: 'language_model',
          parameterCount: 7000000000,
          quantization: 'gguf_q4',
          contextWindow: 8192,
          recommendedVramMb: 4096,
          recommendedRamMb: 8192,
          availability: 'local_only',
          isActive: true,
          description: 'High-performance 7B model with extended context',
          metadata: {
            license: 'Apache 2.0',
            paperUrl: 'https://arxiv.org/abs/2310.06825',
            releaseDate: '2023-10-06',
          },
        },
        {
          name: 'Neural Chat 7B',
          family: 'Neural Chat',
          provider: 'ollama',
          modelType: 'language_model',
          parameterCount: 7000000000,
          quantization: 'gguf_q4',
          contextWindow: 4096,
          recommendedVramMb: 4096,
          recommendedRamMb: 8192,
          availability: 'local_only',
          isActive: true,
          description: 'Optimized for conversational tasks',
          metadata: {
            license: 'Apache 2.0',
            releaseDate: '2023-09-15',
          },
        },
        {
          name: 'Code Llama 7B',
          family: 'Code Llama',
          provider: 'ollama',
          modelType: 'code_model',
          parameterCount: 7000000000,
          quantization: 'gguf_q4',
          contextWindow: 4096,
          recommendedVramMb: 4096,
          recommendedRamMb: 8192,
          availability: 'local_only',
          isActive: true,
          description: 'Specialized for code generation and analysis',
          metadata: {
            license: 'Llama 2 Community License',
            languages: ['python', 'javascript', 'java', 'cpp', 'c'],
          },
        },
        {
          name: 'OpenHermes 2.5 Mistral',
          family: 'OpenHermes',
          provider: 'ollama',
          modelType: 'language_model',
          parameterCount: 7000000000,
          quantization: 'gguf_q4',
          contextWindow: 8192,
          recommendedVramMb: 4096,
          recommendedRamMb: 8192,
          availability: 'local_only',
          isActive: true,
          description: 'Instruction-tuned Mistral variant',
          metadata: {
            license: 'Apache 2.0',
            releaseDate: '2023-12-01',
          },
        },
        {
          name: 'Zephyr 7B Beta',
          family: 'Zephyr',
          provider: 'ollama',
          modelType: 'language_model',
          parameterCount: 7000000000,
          quantization: 'gguf_q4',
          contextWindow: 4096,
          recommendedVramMb: 4096,
          recommendedRamMb: 8192,
          availability: 'local_only',
          isActive: true,
          description: 'High-quality instruction-tuned Mistral model',
          metadata: {
            license: 'MIT',
            releaseDate: '2023-10-26',
          },
        },
        {
          name: 'Nous Hermes 2 Mistral',
          family: 'Nous Hermes',
          provider: 'ollama',
          modelType: 'language_model',
          parameterCount: 7000000000,
          quantization: 'gguf_q4',
          contextWindow: 8192,
          recommendedVramMb: 4096,
          recommendedRamMb: 8192,
          availability: 'local_only',
          isActive: true,
          description: 'Reasoning-focused instruction tuned model',
          metadata: {
            license: 'Apache 2.0',
            releaseDate: '2024-01-15',
          },
        },
        {
          name: 'Dolphin 2.5 Mixtral',
          family: 'Dolphin',
          provider: 'ollama',
          modelType: 'language_model',
          parameterCount: 46000000000,
          quantization: 'gguf_q4',
          contextWindow: 32000,
          recommendedVramMb: 8192,
          recommendedRamMb: 16384,
          availability: 'local_only',
          isActive: true,
          description: 'Dolphin tuned Mixtral with extended context',
          metadata: {
            license: 'Apache 2.0',
            releaseDate: '2024-01-08',
          },
        },
        {
          name: 'Orca Mini 3B',
          family: 'Orca',
          provider: 'ollama',
          modelType: 'language_model',
          parameterCount: 3000000000,
          quantization: 'gguf_q4',
          contextWindow: 3900,
          recommendedVramMb: 2048,
          recommendedRamMb: 4096,
          availability: 'local_only',
          isActive: true,
          description: 'Ultra-lightweight model for edge devices',
          metadata: {
            license: 'Apache 2.0',
            releaseDate: '2023-09-01',
          },
        },
        // Cloud models
        {
          name: 'GPT-4 Turbo',
          family: 'GPT-4',
          provider: 'openai',
          modelType: 'language_model',
          parameterCount: null,
          quantization: null,
          contextWindow: 128000,
          availability: 'cloud_only',
          isActive: true,
          description: 'Latest GPT-4 Turbo model with vision capabilities',
          metadata: {
            license: 'Proprietary',
            costPerMillionTokens: 0.01,
          },
        },
        {
          name: 'Claude 3 Opus',
          family: 'Claude 3',
          provider: 'anthropic',
          modelType: 'language_model',
          parameterCount: null,
          quantization: null,
          contextWindow: 200000,
          availability: 'cloud_only',
          isActive: true,
          description: 'Advanced reasoning and long context capabilities',
          metadata: {
            license: 'Proprietary',
            costPerMillionTokens: 0.015,
          },
        },
        // Embedding models
        {
          name: 'BAAI General Embedding',
          family: 'BAAI',
          provider: 'huggingface',
          modelType: 'embedding_model',
          parameterCount: 335000000,
          quantization: 'fp32',
          contextWindow: 512,
          recommendedVramMb: 2048,
          recommendedRamMb: 4096,
          availability: 'local_only',
          isActive: true,
          description: 'High-quality general-purpose embeddings',
          metadata: {
            license: 'MIT',
            embeddingDimension: 768,
          },
        },
        {
          name: 'all-minilm-l6-v2',
          family: 'MiniLM',
          provider: 'huggingface',
          modelType: 'embedding_model',
          parameterCount: 22000000,
          quantization: 'fp32',
          contextWindow: 256,
          recommendedVramMb: 512,
          recommendedRamMb: 2048,
          availability: 'local_only',
          isActive: true,
          description: 'Lightweight embedding model for fast inference',
          metadata: {
            license: 'Apache 2.0',
            embeddingDimension: 384,
          },
        },
        {
          name: 'nomic-embed-text',
          family: 'Nomic',
          provider: 'ollama',
          modelType: 'embedding_model',
          parameterCount: 137000000,
          quantization: 'fp32',
          contextWindow: 2048,
          recommendedVramMb: 1024,
          recommendedRamMb: 2048,
          availability: 'local_only',
          isActive: true,
          description: 'High-performance text embeddings',
          metadata: {
            license: 'CC BY-NC 4.0',
            embeddingDimension: 768,
          },
        },
      ])
      .returning();

    console.log(`✅ Seeded ${models.length} AI models`);

    // Seed Users (100 users)
    console.log('👥 Seeding users...');
    const users: Array<typeof schema.users.$inferInsert> = [];
    for (let i = 0; i < 100; i++) {
      users.push({
        email: `user${i + 1}@example.com`,
        passwordHash: generatePasswordHash(),
        displayName: `User ${i + 1}`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`,
        role: i === 0 ? 'admin' : i < 5 ? 'moderator' : 'user',
        status: i % 20 === 0 ? 'suspended' : 'active',
      });
    }
    const createdUsers = await db
      .insert(schema.users)
      .values(users)
      .returning();

    console.log(`✅ Seeded ${createdUsers.length} users`);

    // Seed User Preferences
    console.log('⚙️ Seeding user preferences...');
    const userPrefs = createdUsers.map((user) => ({
      userId: user.id,
      theme: Math.random() > 0.5 ? 'dark' : 'light',
      defaultModelId: models[Math.floor(Math.random() * models.length)].id,
      notificationsEnabled: Math.random() > 0.3,
      dataRetentionDays: 90,
    }));
    const createdPrefs = await db
      .insert(schema.userPreferences)
      .values(userPrefs)
      .returning();

    console.log(`✅ Seeded ${createdPrefs.length} user preferences`);

    // Seed Device Profiles (150 total across users)
    console.log('💻 Seeding device profiles...');
    const deviceProfiles: Array<typeof schema.deviceProfiles.$inferInsert> = [];
    for (let i = 0; i < 150; i++) {
      const user = createdUsers[i % createdUsers.length];
      const gpuOptions = ['NVIDIA RTX 4090', 'NVIDIA RTX 3090', 'AMD RX 7900', 'Apple M2', 'Intel Arc', null];
      const selectedGpu = gpuOptions[Math.floor(Math.random() * gpuOptions.length)];

      deviceProfiles.push({
        userId: user.id,
        deviceName: `${user.displayName}'s Device ${Math.floor(i / 100) + 1}`,
        gpuModel: selectedGpu,
        gpuVramMb: selectedGpu ? Math.floor(Math.random() * 24) * 1024 + 4096 : null,
        cpuCores: Math.floor(Math.random() * 16) + 4,
        totalRamMb: Math.floor(Math.random() * 64) * 1024 + 8192,
        osName: ['Windows', 'macOS', 'Linux'][Math.floor(Math.random() * 3)],
        osVersion: Math.floor(Math.random() * 5) + 20 + '.0',
        description: `Personal ${selectedGpu ? 'GPU' : 'CPU'} workstation`,
      });
    }
    const createdDevices = await db
      .insert(schema.deviceProfiles)
      .values(deviceProfiles)
      .returning();

    console.log(`✅ Seeded ${createdDevices.length} device profiles`);

    // Seed Model Configurations (500 configurations)
    console.log('⚙️ Seeding model configurations...');
    const configurations: Array<typeof schema.modelConfigurations.$inferInsert> = [];
    for (let i = 0; i < 500; i++) {
      const user = createdUsers[i % createdUsers.length];
      const model = models[i % models.length];
      const useCases = [
        'general_chat',
        'code_generation',
        'content_creation',
        'data_analysis',
        'research',
        'brainstorming',
        'tutoring',
      ];

      configurations.push({
        userId: user.id,
        modelId: model.id,
        configName: `${model.name} Config ${Math.floor(i / 5) + 1}`,
        description: `Custom configuration for ${model.name}`,
        temperature: (Math.random() * 2).toFixed(2),
        topP: (0.7 + Math.random() * 0.3).toFixed(2),
        topK: Math.floor(Math.random() * 100) + 20,
        repeatPenalty: (1.0 + Math.random() * 0.2).toFixed(2),
        contextSize: Math.min(model.contextWindow || 4096, 2048 + Math.floor(Math.random() * 6000)),
        maxTokens: 512 + Math.floor(Math.random() * 3000),
        gpuLayers: Math.floor(Math.random() * 32),
        batchSize: [1, 2, 4, 8][Math.floor(Math.random() * 4)],
        useCaseCategory: useCases[Math.floor(Math.random() * useCases.length)],
        isPublic: Math.random() > 0.7,
        systemPrompt:
          'You are a helpful, harmless, and honest assistant. Always provide accurate information.',
      });
    }
    const createdConfigs = await db
      .insert(schema.modelConfigurations)
      .values(configurations)
      .returning();

    console.log(`✅ Seeded ${createdConfigs.length} model configurations`);

    // Seed Benchmarks (1500 benchmarks)
    console.log('📊 Seeding benchmarks...');
    const benchmarks: Array<typeof schema.benchmarks.$inferInsert> = [];
    const benchmarkPrompts = [
      'What is the capital of France?',
      'Explain quantum computing in simple terms.',
      'Write a Python function to calculate factorial.',
      'What are the benefits of exercise?',
      'Describe the water cycle.',
      'How does photosynthesis work?',
      'What is machine learning?',
      'Explain cryptocurrency.',
      'Write a SQL query to find top customers.',
      'What is the theory of relativity?',
    ];

    for (let i = 0; i < 1500; i++) {
      const user = createdUsers[i % createdUsers.length];
      const config = createdConfigs[i % createdConfigs.length];
      const model = models.find((m) => m.id === config.modelId)!;
      const device = createdDevices[i % createdDevices.length];
      const prompt = benchmarkPrompts[i % benchmarkPrompts.length];

      benchmarks.push({
        userId: user.id,
        modelId: model.id,
        configurationId: config.id,
        deviceProfileId: device.id,
        benchmarkName: `Benchmark ${i + 1}`,
        benchmarkPrompt: prompt,
        benchmarkResult: `Result for: ${prompt}`,
        tokensPerSecond: Number((Math.random() * 100 + 10).toFixed(2)),
        latencyMs: Number((Math.random() * 5000 + 100).toFixed(2)),
        ttftMs: Number((Math.random() * 500 + 50).toFixed(2)),
        vramUsedMb: Math.floor(Math.random() * 8000) + 1024,
        ramUsedMb: Math.floor(Math.random() * 16000) + 2048,
        cpuUsagePercent: Number((Math.random() * 100).toFixed(2)),
        completionTokens: Math.floor(Math.random() * 500) + 50,
        promptTokens: Math.floor(Math.random() * 100) + 10,
        notes: `Benchmark run on ${device.osName}`,
      });
    }
    const createdBenchmarks = await db
      .insert(schema.benchmarks)
      .values(benchmarks)
      .returning();

    console.log(`✅ Seeded ${createdBenchmarks.length} benchmarks`);

    // Seed Prompt Templates (300 templates)
    console.log('📝 Seeding prompt templates...');
    const templates: Array<typeof schema.promptTemplates.$inferInsert> = [];
    const categories = [
      'general',
      'coding',
      'creative_writing',
      'analysis',
      'tutoring',
      'business',
      'research',
    ];

    for (let i = 0; i < 300; i++) {
      const user = createdUsers[i % createdUsers.length];
      const category = categories[i % categories.length];

      templates.push({
        userId: user.id,
        title: `${category} Template ${Math.floor(i / 5) + 1}`,
        description: `A template for ${category} tasks`,
        content: `You are an expert in ${category}. Please help with the following: {user_input}`,
        category,
        tags: `${category},ai,template`,
        visibility: Math.random() > 0.7 ? 'public' : 'private',
        isActive: true,
      });
    }
    const createdTemplates = await db
      .insert(schema.promptTemplates)
      .values(templates)
      .returning();

    console.log(`✅ Seeded ${createdTemplates.length} prompt templates`);

    // Seed Agent Presets (200 agents)
    console.log('🤖 Seeding agent presets...');
    const agents: Array<typeof schema.agentPresets.$inferInsert> = [];

    for (let i = 0; i < 200; i++) {
      const user = createdUsers[i % createdUsers.length];
      const config = createdConfigs[i % createdConfigs.length];
      const model = models.find((m) => m.id === config.modelId)!;

      agents.push({
        userId: user.id,
        name: `Agent ${i + 1}`,
        description: `An AI agent for various tasks`,
        modelId: model.id,
        configurationId: config.id,
        category: ['assistant', 'analyst', 'creative', 'developer'][i % 4],
        visibility: Math.random() > 0.6 ? 'public' : 'private',
        systemPrompt: `You are a specialized AI agent.`,
        toolPermissions: [
          'web_search',
          'file_operations',
          'code_execution',
          'data_analysis',
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        maxContextTokens: 4096,
        temperature: (0.5 + Math.random() * 0.5).toFixed(2),
        isActive: true,
      });
    }
    const createdAgents = await db
      .insert(schema.agentPresets)
      .values(agents)
      .returning();

    console.log(`✅ Seeded ${createdAgents.length} agent presets`);

    // Seed Model Sessions (2000 sessions for pagination testing)
    console.log('🔄 Seeding model sessions...');
    const sessions: Array<typeof schema.modelSessions.$inferInsert> = [];
    const statuses: Array<(typeof schema.sessionStatusEnum.enumValues)[number]> = [
      'completed',
      'active',
      'paused',
      'error',
    ];

    for (let i = 0; i < 2000; i++) {
      const user = createdUsers[i % createdUsers.length];
      const config = createdConfigs[i % createdConfigs.length];
      const model = models.find((m) => m.id === config.modelId)!;
      const agent = createdAgents[i % createdAgents.length];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const startedAt = new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      );
      const endedAt =
        status === 'active'
          ? null
          : new Date(
              startedAt.getTime() + Math.random() * 60 * 60 * 1000
            );

      sessions.push({
        userId: user.id,
        modelId: model.id,
        configurationId: config.id,
        agentPresetId: agent.id,
        sessionName: `Session ${i + 1}`,
        status,
        startedAt,
        endedAt,
        totalTokensUsed: Math.floor(Math.random() * 10000),
        promptTokens: Math.floor(Math.random() * 5000),
        completionTokens: Math.floor(Math.random() * 5000),
        estimatedCost: (Math.random() * 10).toFixed(4),
        errorMessage:
          status === 'error'
            ? 'Connection timeout or model failure'
            : null,
      });
    }
    const createdSessions = await db
      .insert(schema.modelSessions)
      .values(sessions)
      .returning();

    console.log(`✅ Seeded ${createdSessions.length} model sessions`);

    // Seed Session Messages (5000 messages)
    console.log('💬 Seeding session messages...');
    const messages: Array<typeof schema.sessionMessages.$inferInsert> = [];

    for (let i = 0; i < 5000; i++) {
      const session = createdSessions[i % createdSessions.length];

      messages.push({
        sessionId: session.id,
        role: i % 3 === 0 ? 'system' : i % 2 === 0 ? 'user' : 'assistant',
        content:
          i % 2 === 0
            ? `This is a user message ${i}`
            : `This is an assistant response ${i}`,
        tokensUsed: Math.floor(Math.random() * 500) + 10,
      });
    }
    const createdMessages = await db
      .insert(schema.sessionMessages)
      .values(messages)
      .returning();

    console.log(`✅ Seeded ${createdMessages.length} session messages`);

    // Seed System Logs (3000 logs)
    console.log('📋 Seeding system logs...');
    const logs: Array<typeof schema.systemLogs.$inferInsert> = [];
    const eventTypes: Array<(typeof schema.logEventTypeEnum.enumValues)[number]> = [
      'model_execution',
      'benchmark_execution',
      'authentication',
      'admin_action',
      'system_error',
      'configuration_change',
      'session_event',
    ];
    const levels: Array<(typeof schema.logLevelEnum.enumValues)[number]> = [
      'debug',
      'info',
      'warning',
      'error',
      'critical',
    ];

    for (let i = 0; i < 3000; i++) {
      const user = i % 20 === 0 ? createdUsers[0] : createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];

      logs.push({
        userId: user.id,
        eventType,
        level,
        title: `${eventType}: Event ${i + 1}`,
        message: `Details about the ${eventType} event`,
        ipAddress: `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        statusCode: [200, 201, 400, 401, 403, 404, 500][Math.floor(Math.random() * 7)],
      });
    }
    const createdLogs = await db
      .insert(schema.systemLogs)
      .values(logs)
      .returning();

    console.log(`✅ Seeded ${createdLogs.length} system logs`);

    // Seed API Keys (50 keys)
    console.log('🔑 Seeding API keys...');
    const keys: Array<typeof schema.apiKeys.$inferInsert> = [];
    for (let i = 0; i < 50; i++) {
      const user = createdUsers[i % createdUsers.length];
      keys.push({
        userId: user.id,
        keyHash: randomString(60),
        keyName: `API Key ${i + 1}`,
        isActive: Math.random() > 0.2,
        expiresAt:
          Math.random() > 0.5
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : null,
      });
    }
    const createdKeys = await db
      .insert(schema.apiKeys)
      .values(keys)
      .returning();

    console.log(`✅ Seeded ${createdKeys.length} API keys`);

    console.log('\n🎉 Database seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  • Users: ${createdUsers.length}`);
    console.log(`  • User Preferences: ${createdPrefs.length}`);
    console.log(`  • AI Models: ${models.length}`);
    console.log(`  • Device Profiles: ${createdDevices.length}`);
    console.log(`  • Model Configurations: ${createdConfigs.length}`);
    console.log(`  • Benchmarks: ${createdBenchmarks.length}`);
    console.log(`  • Prompt Templates: ${createdTemplates.length}`);
    console.log(`  • Agent Presets: ${createdAgents.length}`);
    console.log(`  • Model Sessions: ${createdSessions.length}`);
    console.log(`  • Session Messages: ${createdMessages.length}`);
    console.log(`  • System Logs: ${createdLogs.length}`);
    console.log(`  • API Keys: ${createdKeys.length}`);
    console.log(
      `\n  Total Records: ${createdUsers.length + createdPrefs.length + models.length + createdDevices.length + createdConfigs.length + createdBenchmarks.length + createdTemplates.length + createdAgents.length + createdSessions.length + createdMessages.length + createdLogs.length + createdKeys.length}`
    );
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();
