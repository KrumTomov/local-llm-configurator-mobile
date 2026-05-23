# Database Setup & Usage Guide

## Overview

Your PostgreSQL database is now fully configured with 12 normalized tables, 10 PostgreSQL enums, and 12,915+ seed records.

**Status:** ✅ Database migrated and seeded successfully

---

## Quick Start

### 1. Check Database Status

```bash
# View database tables and structure
npm run db:studio
```

### 2. Run Migrations

Migrations are already applied, but if you need to apply them again:

```bash
npm run db:migrate
```

### 3. Reseed Database

To clear and reseed with fresh data:

```bash
npm run db:seed
```

---

## Project Structure

```
src/db/
├── schema.ts              # Drizzle ORM schema definitions (12 tables, 10 enums)
├── index.ts               # Database client initialization
├── seed.ts                # Seed script for 12,915+ records
└── migrations/
    ├── 0000_*.sql         # Generated SQL migration
    └── meta/              # Drizzle metadata
```

---

## Database Tables

### Core Tables (Required)

| Table | Records | Purpose |
|-------|---------|---------|
| **users** | 100 | User accounts, authentication, roles |
| **ai_models** | 15 | Model metadata (local/cloud) |
| **model_configurations** | 500 | User-created model configurations |
| **model_sessions** | 2,000 | Active/historical model usage |
| **benchmarks** | 1,500 | Performance test results |

### Extended Tables (Recommended)

| Table | Records | Purpose |
|-------|---------|---------|
| **user_preferences** | 100 | User settings, defaults |
| **device_profiles** | 150 | Hardware profiles |
| **prompt_templates** | 300 | Reusable prompts |
| **agent_presets** | 200 | Pre-configured agents |
| **session_messages** | 5,000 | Conversation history |
| **system_logs** | 3,000 | Audit trail & events |
| **api_keys** | 50 | API access tokens |

---

## Key Features

### ✅ 1. Complete Schema with Relationships

```typescript
// All relationships are properly defined
export const usersRelations = relations(users, ({ many }) => ({
  modelConfigurations: many(modelConfigurations),
  benchmarks: many(benchmarks),
  promptTemplates: many(promptTemplates),
  // ... more relations
}));
```

### ✅ 2. PostgreSQL Enums (Type-Safe)

```typescript
// 10 native PostgreSQL enums
user_role: 'admin' | 'moderator' | 'user' | 'viewer'
user_status: 'active' | 'suspended' | 'deactivated' | 'pending_verification'
model_provider: 'openai' | 'anthropic' | 'huggingface' | 'ollama' | ...
model_type: 'language_model' | 'embedding_model' | 'code_model' | ...
session_status: 'active' | 'completed' | 'paused' | 'error' | 'timeout' | 'cancelled'
// ... and 5 more
```

### ✅ 3. Soft Deletes

Recoverable deletion via `deletedAt` timestamp:

```typescript
// Tables with soft delete support
users, ai_models, model_configurations, prompt_templates, agent_presets, api_keys

// Query active records only
const activeUsers = await db
  .select()
  .from(users)
  .where(isNull(users.deletedAt));
```

### ✅ 4. Strategic Indexing

41 indexes across all tables for:
- Fast lookups (email, user_id, model_id)
- Pagination (created_at, started_at)
- Filtering (status, role, visibility)
- Type discovery (provider, family, model_type)

### ✅ 5. Pagination-Friendly

All tables include `created_at` and `updated_at` for reliable sorting:

```typescript
// Paginate model sessions
const sessions = await db
  .select()
  .from(modelSessions)
  .where(eq(modelSessions.userId, userId))
  .orderBy(desc(modelSessions.createdAt))
  .limit(20)
  .offset(pageNumber * 20);
```

### ✅ 6. JSONB Metadata Fields

Flexible schema extension without migrations:

```typescript
// Store arbitrary JSON data
ai_models.metadata: { license, paperUrl, releaseDate, ... }
model_sessions.metadata: { context, tags, customFields, ... }
user_preferences.metadata: { ... any custom data ... }
```

### ✅ 7. Cascading Deletes

Data integrity via automatic cleanup:

```sql
-- When a user is deleted, all dependent records are removed
ON DELETE CASCADE for:
  - user_preferences
  - device_profiles
  - model_configurations
  - prompt_templates
  - agent_presets
  - api_keys
  - When a session is deleted, all messages are removed
```

---

## Usage Examples

### Create a User

```typescript
import { db } from '@/db';
import { users } from '@/db/schema';

const newUser = await db
  .insert(users)
  .values({
    email: 'user@example.com',
    passwordHash: '$2b$10$...', // bcrypt hash
    displayName: 'John Doe',
    avatarUrl: 'https://...',
    role: 'user',
    status: 'active',
  })
  .returning();
```

### Get User with Preferences

```typescript
const userWithPrefs = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    userPreferences: true,
    modelConfigurations: true,
  },
});
```

### Create a Model Session

```typescript
const session = await db
  .insert(modelSessions)
  .values({
    userId,
    modelId,
    configurationId,
    status: 'active',
    startedAt: new Date(),
  })
  .returning();
```

### Get Session with Messages

```typescript
const session = await db.query.modelSessions.findFirst({
  where: eq(modelSessions.id, sessionId),
  with: {
    messages: {
      orderBy: asc(sessionMessages.createdAt),
    },
  },
});
```

### Store Benchmark Results

```typescript
const benchmark = await db
  .insert(benchmarks)
  .values({
    userId,
    modelId,
    configurationId,
    deviceProfileId,
    benchmarkPrompt: 'What is the capital of France?',
    benchmarkResult: 'Paris',
    tokensPerSecond: 45.2,
    latencyMs: 1234.5,
    ttftMs: 234.1,
    vramUsedMb: 6144,
    ramUsedMb: 8192,
  })
  .returning();
```

### Log System Event

```typescript
await db.insert(systemLogs).values({
  userId,
  eventType: 'model_execution',
  level: 'info',
  title: 'Model executed successfully',
  message: 'GPT-4 completed in 2.3s',
  metadata: {
    modelId,
    sessionId,
    duration: 2300,
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  statusCode: 200,
});
```

### Query with Pagination

```typescript
const pageSize = 20;
const pageNumber = 2;

const benchmarks = await db
  .select()
  .from(benchmarks)
  .where(eq(benchmarks.userId, userId))
  .orderBy(desc(benchmarks.createdAt))
  .limit(pageSize)
  .offset(pageNumber * pageSize);
```

### Soft Delete

```typescript
// Mark as deleted (recoverable)
await db
  .update(users)
  .set({ deletedAt: new Date() })
  .where(eq(users.id, userId));

// Query active only
const activeUsers = await db
  .select()
  .from(users)
  .where(isNull(users.deletedAt));

// Restore
await db
  .update(users)
  .set({ deletedAt: null })
  .where(eq(users.id, userId));
```

---

## Environment Configuration

### Required Variables (.env)

```env
# PostgreSQL connection string (Neon)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Optional Variables

```env
NODE_ENV=development
```

---

## Common Queries

### Active Users by Role

```typescript
const moderators = await db
  .select()
  .from(users)
  .where(
    and(
      isNull(users.deletedAt),
      eq(users.status, 'active'),
      eq(users.role, 'moderator')
    )
  );
```

### Recent Sessions with Model Details

```typescript
const recentSessions = await db
  .select({
    sessionId: modelSessions.id,
    modelName: aiModels.name,
    userEmail: users.email,
    status: modelSessions.status,
    startedAt: modelSessions.startedAt,
  })
  .from(modelSessions)
  .innerJoin(aiModels, eq(modelSessions.modelId, aiModels.id))
  .innerJoin(users, eq(modelSessions.userId, users.id))
  .orderBy(desc(modelSessions.startedAt))
  .limit(50);
```

### Benchmark Summary by Model

```typescript
const summary = await db
  .select({
    modelId: benchmarks.modelId,
    modelName: aiModels.name,
    avgTokensPerSecond: avg(benchmarks.tokensPerSecond),
    avgLatencyMs: avg(benchmarks.latencyMs),
    testCount: count(),
  })
  .from(benchmarks)
  .innerJoin(aiModels, eq(benchmarks.modelId, aiModels.id))
  .groupBy(benchmarks.modelId, aiModels.name)
  .orderBy(desc(count()));
```

### Public Templates

```typescript
const publicTemplates = await db
  .select()
  .from(promptTemplates)
  .where(
    and(
      eq(promptTemplates.visibility, 'public'),
      eq(promptTemplates.isActive, true),
      isNull(promptTemplates.deletedAt)
    )
  )
  .orderBy(desc(promptTemplates.createdAt));
```

---

## Performance Optimization

### Index Usage

All frequently queried columns are indexed:

```
✅ user_id         - All user lookups
✅ model_id        - Model queries
✅ status          - Filtering by status
✅ created_at      - Pagination
✅ email           - Authentication
✅ visibility      - Public/private filtering
✅ provider        - Model discovery
✅ configuration_id - Session config lookups
```

### Query Tips

1. **Always use indexes in WHERE clauses**
   ```typescript
   // Good - uses index
   where(eq(modelSessions.userId, userId))
   
   // Slower - full table scan
   where(eq(modelSessions.metadata, jsonData))
   ```

2. **Paginate large result sets**
   ```typescript
   .limit(pageSize)
   .offset(pageNumber * pageSize)
   ```

3. **Select only needed columns**
   ```typescript
   .select({
     id: users.id,
     email: users.email,
     name: users.displayName
   })
   ```

4. **Use relationships for joins**
   ```typescript
   db.query.users.findFirst({
     with: { modelConfigurations: true }
   })
   ```

---

## Monitoring & Maintenance

### Check Database Size

```bash
# In Neon console, view project usage
```

### View Slow Queries

```sql
SELECT query, calls, total_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Analyze Query Plans

```typescript
const result = await db.run(
  sql`EXPLAIN ANALYZE SELECT * FROM benchmarks WHERE model_id = ${modelId}`
);
```

### Backup Strategy

Neon provides automatic daily backups. Access via console for recovery.

---

## Next Steps

1. **Create API Routes** - Use the database client in Next.js API routes
2. **Add Validation** - Validate input before database operations
3. **Implement Authentication** - Hash passwords, manage sessions
4. **Add Rate Limiting** - Protect against abuse
5. **Set Up Logging** - Track all database operations
6. **Monitor Performance** - Use EXPLAIN ANALYZE for slow queries
7. **Create Indexes** - For custom queries not covered by default indexes

---

## Troubleshooting

### Migration Failed

```bash
# Check migration status
npx drizzle-kit status

# View migration files
ls src/db/migrations/
```

### Connection Errors

```bash
# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

### Seed Failed

```bash
# Run with verbose output
npm run db:seed 2>&1 | tee seed.log

# Check for constraint violations
# Review the seed script for conflicts
```

### Schema Mismatch

```bash
# Regenerate migrations
npm run db:generate

# Check for differences
git diff src/db/schema.ts
```

---

## Additional Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Neon Console](https://console.neon.tech/)
- [Schema Documentation](./SCHEMA.md)

---

## Support

For issues with:
- **Schema**: See [SCHEMA.md](./SCHEMA.md)
- **Drizzle ORM**: https://orm.drizzle.team/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Neon**: https://neon.tech/docs/

Last Updated: May 23, 2026
