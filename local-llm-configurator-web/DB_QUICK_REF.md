# Database Quick Reference

## 📊 Tables At a Glance

| Table | Relations | Key Enums | Purpose |
|-------|-----------|-----------|---------|
| **users** | ← many | role, status | Auth & profiles |
| **user_preferences** | users | theme | User settings |
| **ai_models** | → many | provider, type, quantization, availability | Model catalog |
| **model_configurations** | users, models | - | Custom configs |
| **device_profiles** | users | - | Hardware info |
| **benchmarks** | users, models, configs, devices | - | Performance data |
| **prompt_templates** | users | visibility | Reusable prompts |
| **agent_presets** | users, models, configs | visibility | AI agents |
| **model_sessions** | users, models, configs, agents | status | Usage tracking |
| **session_messages** | sessions | - | Chat history |
| **system_logs** | users | event_type, level | Audit trail |
| **api_keys** | users | - | API access |

## 🔑 Key Fields by Table

### users
```typescript
id, email (UNIQUE), passwordHash, displayName, avatarUrl
role: 'admin'|'moderator'|'user'|'viewer'
status: 'active'|'suspended'|'deactivated'|'pending_verification'
lastLoginAt, createdAt, updatedAt, deletedAt
```

### ai_models
```typescript
id, name, family, provider, modelType
parameterCount (BIGINT), quantization, contextWindow
recommendedVramMb, recommendedRamMb, availability
isActive, metadata (JSONB), createdAt, updatedAt, deletedAt
```

### model_configurations
```typescript
id, userId, modelId, configName, description
temperature, topP, topK, repeatPenalty, contextSize, maxTokens
gpuLayers, batchSize, systemPrompt, useCaseCategory
isPublic, metadata (JSONB), createdAt, updatedAt, deletedAt
```

### model_sessions
```typescript
id, userId, modelId, configurationId, agentPresetId
sessionName
status: 'active'|'completed'|'paused'|'error'|'timeout'|'cancelled'
startedAt, endedAt
totalTokensUsed, promptTokens, completionTokens, estimatedCost
errorMessage, metadata (JSONB)
createdAt, updatedAt
```

### benchmarks
```typescript
id, userId, modelId, configurationId, deviceProfileId
benchmarkName, benchmarkPrompt, benchmarkResult
tokensPerSecond, latencyMs, ttftMs (time to first token)
vramUsedMb, ramUsedMb, cpuUsagePercent
completionTokens, promptTokens, notes
createdAt, updatedAt
```

### system_logs
```typescript
id, userId
eventType: 'model_execution'|'benchmark_execution'|'authentication'|'admin_action'|'system_error'|'configuration_change'|'session_event'
level: 'debug'|'info'|'warning'|'error'|'critical'
title, message, metadata (JSONB)
ipAddress, userAgent, statusCode, errorStackTrace
createdAt
```

## 🚀 Common Queries

### Insert User
```typescript
const user = await db.insert(users).values({
  email: 'user@example.com',
  passwordHash: bcryptHash,
  displayName: 'John',
  role: 'user',
  status: 'active'
}).returning();
```

### Get User with Config
```typescript
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: { modelConfigurations: true }
});
```

### Create Session
```typescript
const session = await db.insert(modelSessions).values({
  userId, modelId, configurationId,
  sessionName: 'My Session',
  status: 'active'
}).returning();
```

### Get Session with Messages
```typescript
const session = await db.query.modelSessions.findFirst({
  where: eq(modelSessions.id, sessionId),
  with: { messages: { orderBy: asc(sessionMessages.createdAt) } }
});
```

### Paginate Sessions
```typescript
const sessions = await db
  .select()
  .from(modelSessions)
  .where(eq(modelSessions.userId, userId))
  .orderBy(desc(modelSessions.createdAt))
  .limit(20)
  .offset(pageNumber * 20);
```

### Soft Delete
```typescript
await db.update(users)
  .set({ deletedAt: new Date() })
  .where(eq(users.id, userId));
```

### Query Active Only
```typescript
const active = await db
  .select()
  .from(users)
  .where(and(isNull(users.deletedAt), eq(users.status, 'active')));
```

### Log Event
```typescript
await db.insert(systemLogs).values({
  userId,
  eventType: 'model_execution',
  level: 'info',
  title: 'Model executed',
  message: 'GPT-4 completed in 2.3s',
  metadata: { modelId, sessionId, duration: 2300 }
});
```

## 📦 Imports

```typescript
import { db } from '@/db';
import { 
  users, 
  aiModels, 
  modelConfigurations,
  modelSessions,
  benchmarks,
  systemLogs,
  // ... any other table
} from '@/db/schema';

import { eq, desc, asc, and, or, isNull } from 'drizzle-orm';
```

## 🔍 Available Indexes

```
✅ users.email                    (UNIQUE)
✅ users.status                   
✅ users.role                     
✅ users.createdAt                

✅ ai_models.provider             
✅ ai_models.family               
✅ ai_models.modelType            
✅ ai_models.isActive             

✅ modelConfigurations.userId     
✅ modelConfigurations.modelId    
✅ modelConfigurations.isPublic   

✅ benchmarks.userId              
✅ benchmarks.modelId             
✅ benchmarks.configurationId     
✅ benchmarks.deviceProfileId     
✅ benchmarks.createdAt           

✅ modelSessions.userId           
✅ modelSessions.modelId          
✅ modelSessions.status           
✅ modelSessions.startedAt        
✅ modelSessions.createdAt        

✅ ... and 16 more indexes
```

## 🌍 Environment Setup

```bash
# .env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NODE_ENV=development
```

## 🎯 Available Commands

```bash
npm run db:generate    # Generate migrations from schema
npm run db:migrate     # Apply migrations to DB
npm run db:seed        # Populate with test data
npm run db:studio      # View in Drizzle Studio
npm run db:push        # Push schema directly (Neon)
```

## 🧮 Quick Stats

```
Tables:           12
Columns:          141
Indexes:          41
Enums:            10
Foreign Keys:     20+
Seed Records:     12,915

Users:            100
Models:           15
Sessions:         2,000
Messages:         5,000
Benchmarks:       1,500
Logs:             3,000
```

## 🔐 Security Fields

| Field | Table | Purpose |
|-------|-------|---------|
| passwordHash | users | Store bcrypt hash |
| keyHash | api_keys | Store hashed API key |
| deletedAt | users, models, configs, templates, agents, keys | Soft delete marker |
| role | users | Authorization |
| userId | system_logs | Audit trail |
| ipAddress, userAgent | system_logs | Request tracking |

## 📖 Documentation Files

- **SCHEMA.md** — Full schema specification & relationships
- **DATABASE_GUIDE.md** — Examples & common queries
- **DATABASE_IMPLEMENTATION.md** — Implementation summary
- **src/db/schema.ts** — TypeScript definitions
- **src/db/seed.ts** — Seed data generation
- **src/db/index.ts** — Database client

## 💡 Pro Tips

1. Always use indexes in WHERE clauses (user_id, status, created_at)
2. Use `.with()` for relationship loading, not manual joins
3. Paginate large results with LIMIT/OFFSET
4. Soft delete with `deletedAt` timestamp, not DROP
5. Log all important operations to system_logs
6. Use JSONB metadata fields to extend schema without migrations
7. Check `created_at` indexes for time-based queries
8. Use enums for type safety (no string typos)

## ❌ Common Mistakes to Avoid

```typescript
// ❌ Manual joins instead of relations
const bad = await db
  .select()
  .from(users)
  .innerJoin(modelConfigurations, 
    eq(users.id, modelConfigurations.userId));

// ✅ Use .with() for clean relationship loading
const good = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: { modelConfigurations: true }
});

// ❌ Query without indexes
const slow = await db
  .select()
  .from(benchmarks)
  .where(eq(benchmarks.metadata, { key: 'value' }));

// ✅ Use indexed columns
const fast = await db
  .select()
  .from(benchmarks)
  .where(eq(benchmarks.userId, userId));

// ❌ No pagination for large results
const memory = await db.select().from(benchmarks);

// ✅ Always paginate
const paginated = await db
  .select()
  .from(benchmarks)
  .limit(50)
  .offset(pageNumber * 50);
```

---

**Version:** 1.0  
**Last Updated:** May 23, 2026
