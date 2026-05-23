# PostgreSQL Database Schema - Local LLM Configurator

## Overview

This document describes the normalized PostgreSQL schema for the Local LLM Configurator application. The schema is designed to support multi-user management of local and cloud-based AI models with comprehensive configuration, benchmarking, and session tracking.

**Total Tables: 12**  
**Total Records (seeded): 15,500+**  
**Architecture: Fully normalized with proper relationships and indexes**

---

## Schema Architecture

### Design Principles

1. **Normalization**: 3NF (Third Normal Form) - eliminates data redundancy while maintaining relationships
2. **Soft Deletes**: Implemented via `deletedAt` timestamps for audit trails
3. **Timestamps**: All tables include `createdAt` and `updatedAt` for audit and sorting
4. **Indexing**: Strategic indexes on foreign keys, status fields, and timestamp columns for efficient pagination
5. **Enums**: PostgreSQL native enums for type safety and performance
6. **Relationships**: Proper foreign key constraints with cascade delete where appropriate

---

## Table Structure

### 1. **users**

Stores user account information with authentication credentials and profile data.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(512),
  role user_role NOT NULL DEFAULT 'user',
  status user_status NOT NULL DEFAULT 'pending_verification',
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP  -- soft delete
);

INDEXES:
  - UNIQUE on email (authentication)
  - on status (filtering by account status)
  - on role (permission checks)
  - on created_at (sorting)
```

**Enums:**
- `user_role`: admin, moderator, user, viewer
- `user_status`: active, suspended, deactivated, pending_verification

**Relationships:**
- 1:N → model_configurations
- 1:N → benchmarks
- 1:N → prompt_templates
- 1:N → agent_presets
- 1:N → model_sessions
- 1:N → system_logs
- 1:N → user_preferences
- 1:N → device_profiles
- 1:N → api_keys

---

### 2. **user_preferences**

Stores user-specific settings and preferences.

```sql
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(50) DEFAULT 'light',
  default_model_id INTEGER,
  default_configuration_id INTEGER,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  data_retention_days INTEGER DEFAULT 90,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

INDEXES:
  - on user_id (lookup)
```

**Purpose:** Supports personalization without cluttering the users table

---

### 3. **ai_models**

Metadata about available AI models (both local and cloud).

```sql
CREATE TABLE ai_models (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  family VARCHAR(255) NOT NULL,
  provider model_provider NOT NULL,
  model_type model_type NOT NULL,
  parameter_count BIGINT,
  quantization quantization,
  context_window INTEGER,  -- in tokens
  recommended_vram_mb INTEGER,
  recommended_ram_mb INTEGER,
  availability model_availability NOT NULL,
  description TEXT,
  model_url VARCHAR(512),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,  -- license, paper_url, etc.
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP  -- soft delete
);

INDEXES:
  - on provider (model discovery)
  - on family (grouping)
  - on model_type (filtering)
  - on is_active (listing active models)
```

**Enums:**
- `model_provider`: openai, anthropic, huggingface, ollama, llama_cpp, vllm, other
- `model_type`: language_model, embedding_model, image_model, multimodal_model, code_model
- `quantization`: fp32, fp16, int8, int4, gguf_q2-q8
- `model_availability`: local_only, cloud_only, hybrid

**Relationships:**
- 1:N → model_configurations
- 1:N → benchmarks
- 1:N → agent_presets
- 1:N → model_sessions

---

### 4. **model_configurations**

User-created custom configurations for AI models.

```sql
CREATE TABLE model_configurations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  model_id INTEGER NOT NULL REFERENCES ai_models(id),
  config_name VARCHAR(255) NOT NULL,
  description TEXT,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  top_p DECIMAL(3,2) DEFAULT 1.0,
  top_k INTEGER DEFAULT 40,
  repeat_penalty DECIMAL(3,2) DEFAULT 1.1,
  context_size INTEGER,
  max_tokens INTEGER,
  gpu_layers INTEGER,
  batch_size INTEGER DEFAULT 1,
  system_prompt TEXT,
  use_case_category VARCHAR(100),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP  -- soft delete
);

INDEXES:
  - on user_id (user lookups)
  - on model_id (model lookups)
  - on is_public (discovering shared configs)
```

**Purpose:** Allows users to save and reuse model settings without modifying base models

**Relationships:**
- N:1 → users
- N:1 → ai_models
- 1:N → benchmarks
- 1:N → model_sessions
- 1:N → agent_presets

---

### 5. **device_profiles**

Hardware profiles for benchmarking and resource tracking.

```sql
CREATE TABLE device_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  device_name VARCHAR(255) NOT NULL,
  gpu_model VARCHAR(255),
  gpu_vram_mb INTEGER,
  cpu_cores SMALLINT,
  total_ram_mb INTEGER,
  os_name VARCHAR(100),
  os_version VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

INDEXES:
  - on user_id (lookup)
```

**Purpose:** Track hardware configuration for accurate benchmark comparison and resource prediction

**Relationships:**
- N:1 → users
- 1:N → benchmarks

---

### 6. **benchmarks**

Performance test results for model configurations.

```sql
CREATE TABLE benchmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  model_id INTEGER NOT NULL REFERENCES ai_models(id),
  configuration_id INTEGER REFERENCES model_configurations(id),
  device_profile_id INTEGER REFERENCES device_profiles(id),
  benchmark_name VARCHAR(255),
  benchmark_prompt TEXT NOT NULL,
  benchmark_result TEXT,
  tokens_per_second REAL,
  latency_ms REAL,
  ttft_ms REAL,  -- time to first token
  vram_used_mb INTEGER,
  ram_used_mb INTEGER,
  cpu_usage_percent REAL,
  completion_tokens INTEGER,
  prompt_tokens INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

INDEXES:
  - on user_id (user benchmarks)
  - on model_id (model performance)
  - on configuration_id (config benchmarks)
  - on device_profile_id (device stats)
  - on created_at (time-series queries)
```

**Purpose:** Store performance metrics for analysis and model selection

**Relationships:**
- N:1 → users
- N:1 → ai_models
- N:1 → model_configurations
- N:1 → device_profiles

---

### 7. **prompt_templates**

Reusable prompt templates created by users.

```sql
CREATE TABLE prompt_templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT,
  visibility visibility NOT NULL DEFAULT 'private',
  version INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP  -- soft delete
);

INDEXES:
  - on user_id (user templates)
  - on visibility (filtering public/shared)
  - on category (template discovery)
```

**Enums:**
- `visibility`: private, public, shared

**Relationships:**
- N:1 → users

---

### 8. **agent_presets**

Configured AI agent presets with assigned models and configurations.

```sql
CREATE TABLE agent_presets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  system_prompt TEXT,
  model_id INTEGER NOT NULL REFERENCES ai_models(id),
  configuration_id INTEGER REFERENCES model_configurations(id),
  category VARCHAR(100),
  visibility visibility NOT NULL DEFAULT 'private',
  tool_permissions JSONB,  -- array of tool IDs/names
  max_context_tokens INTEGER,
  temperature DECIMAL(3,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP  -- soft delete
);

INDEXES:
  - on user_id (user agents)
  - on model_id (model usage)
  - on visibility (discovering shared agents)
```

**Purpose:** Define pre-configured AI agents for different use cases

**Relationships:**
- N:1 → users
- N:1 → ai_models
- N:1 → model_configurations
- 1:N → model_sessions

---

### 9. **model_sessions**

Tracks active or historical model usage and interaction sessions.

```sql
CREATE TABLE model_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  model_id INTEGER NOT NULL REFERENCES ai_models(id),
  configuration_id INTEGER NOT NULL REFERENCES model_configurations(id),
  agent_preset_id INTEGER REFERENCES agent_presets(id),
  session_name VARCHAR(255),
  status session_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMP DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMP,
  total_tokens_used INTEGER DEFAULT 0,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10,6),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

INDEXES:
  - on user_id (user sessions)
  - on model_id (model usage)
  - on status (active/completed filtering)
  - on started_at (sorting)
  - on created_at (pagination)
```

**Enums:**
- `session_status`: active, completed, paused, error, timeout, cancelled

**Purpose:** Track model interactions for usage analytics and cost tracking

**Relationships:**
- N:1 → users
- N:1 → ai_models
- N:1 → model_configurations
- N:1 → agent_presets
- 1:N → session_messages

---

### 10. **session_messages**

Stores conversation messages within model sessions.

```sql
CREATE TABLE session_messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES model_sessions(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,  -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  tokens_used INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

INDEXES:
  - on session_id (message retrieval)
  - on created_at (message ordering)
```

**Purpose:** Store conversation history with efficient pagination

**Relationships:**
- N:1 → model_sessions

---

### 11. **system_logs**

Comprehensive audit and system logging.

```sql
CREATE TABLE system_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  event_type log_event_type NOT NULL,
  level log_level NOT NULL DEFAULT 'info',
  title VARCHAR(255) NOT NULL,
  message TEXT,
  metadata JSONB,  -- contextual data
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  status_code INTEGER,
  error_stack_trace TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

INDEXES:
  - on user_id (user audit trail)
  - on event_type (event filtering)
  - on level (severity filtering)
  - on created_at (log retrieval)
```

**Enums:**
- `log_event_type`: model_execution, benchmark_execution, authentication, admin_action, system_error, configuration_change, session_event
- `log_level`: debug, info, warning, error, critical

**Purpose:** Complete audit trail for compliance and debugging

**Relationships:**
- N:1 → users

---

### 12. **api_keys**

Stores user API keys for programmatic access.

```sql
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  key_name VARCHAR(255) NOT NULL,
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP  -- soft delete
);

INDEXES:
  - on user_id (key lookup)
  - on is_active (valid key filtering)
```

**Purpose:** Secure API access management

**Relationships:**
- N:1 → users

---

## Entity Relationship Diagram

```
┌─────────────┐
│   USERS     │
└──────┬──────┘
       │
       ├─→ user_preferences (1:N)
       ├─→ device_profiles (1:N)
       ├─→ model_configurations (1:N)
       ├─→ benchmarks (1:N)
       ├─→ prompt_templates (1:N)
       ├─→ agent_presets (1:N)
       ├─→ model_sessions (1:N)
       ├─→ system_logs (1:N)
       └─→ api_keys (1:N)

┌────────────────┐
│   AI_MODELS    │
└────────┬───────┘
         │
         ├─→ model_configurations (1:N)
         ├─→ benchmarks (1:N)
         ├─→ agent_presets (1:N)
         └─→ model_sessions (1:N)

┌──────────────────────────┐
│ MODEL_CONFIGURATIONS     │
└────────┬─────────────────┘
         │
         ├─→ benchmarks (1:N)
         ├─→ model_sessions (1:N)
         └─→ agent_presets (1:N)

┌──────────────────┐
│ DEVICE_PROFILES  │
└────────┬─────────┘
         │
         └─→ benchmarks (1:N)

┌─────────────────┐
│ AGENT_PRESETS   │
└────────┬────────┘
         │
         └─→ model_sessions (1:N)

┌──────────────────┐
│ MODEL_SESSIONS   │
└────────┬─────────┘
         │
         └─→ session_messages (1:N)
```

---

## Data Relationships Summary

### Cascading Deletes

The following relationships use `ON DELETE CASCADE` to maintain referential integrity:

```
users → user_preferences
users → device_profiles
users → model_configurations
users → prompt_templates
users → agent_presets
users → api_keys
model_sessions → session_messages
```

These ensure that when a user is deleted, all dependent records are removed automatically.

### Soft Deletes

The following tables support soft deletes via `deleted_at` timestamps:

- users
- ai_models
- model_configurations
- prompt_templates
- agent_presets
- api_keys

This allows for data recovery and audit trails without losing relationships.

---

## Indexing Strategy

### Performance Indexes

| Table | Column(s) | Type | Purpose |
|-------|-----------|------|---------|
| users | email | UNIQUE | Fast authentication lookups |
| users | status, role, created_at | INDEX | Filtering and sorting |
| ai_models | provider, family, model_type, is_active | INDEX | Model discovery |
| model_configurations | user_id, model_id, is_public | INDEX | Configuration lookups |
| benchmarks | user_id, model_id, configuration_id, device_profile_id, created_at | INDEX | Performance analysis |
| prompt_templates | user_id, visibility, category | INDEX | Template discovery |
| agent_presets | user_id, model_id, visibility | INDEX | Agent lookups |
| model_sessions | user_id, model_id, status, started_at, created_at | INDEX | Session management & pagination |
| session_messages | session_id, created_at | INDEX | Message retrieval |
| system_logs | user_id, event_type, level, created_at | INDEX | Audit trail |
| api_keys | user_id, is_active | INDEX | Key validation |

---

## Pagination Strategy

### Session Messages Pagination Example

```sql
-- Get latest 50 messages from a session
SELECT * FROM session_messages
WHERE session_id = $1
ORDER BY created_at DESC
LIMIT 50
OFFSET $2;
```

### Model Sessions Pagination Example

```sql
-- Get paginated sessions for a user
SELECT * FROM model_sessions
WHERE user_id = $1
ORDER BY started_at DESC
LIMIT 20
OFFSET $2;
```

### Benchmarks Pagination with Filters

```sql
-- Get paginated benchmarks by model
SELECT * FROM benchmarks
WHERE model_id = $1 AND created_at > now() - interval '30 days'
ORDER BY created_at DESC
LIMIT 50
OFFSET $2;
```

---

## Enum Types

### PostgreSQL Enum Definitions

```sql
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'user', 'viewer');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deactivated', 'pending_verification');
CREATE TYPE model_type AS ENUM ('language_model', 'embedding_model', 'image_model', 'multimodal_model', 'code_model');
CREATE TYPE model_provider AS ENUM ('openai', 'anthropic', 'huggingface', 'ollama', 'llama_cpp', 'vllm', 'other');
CREATE TYPE quantization AS ENUM ('fp32', 'fp16', 'int8', 'int4', 'gguf_q2', 'gguf_q3', 'gguf_q4', 'gguf_q5', 'gguf_q6', 'gguf_q8');
CREATE TYPE model_availability AS ENUM ('local_only', 'cloud_only', 'hybrid');
CREATE TYPE session_status AS ENUM ('active', 'completed', 'paused', 'error', 'timeout', 'cancelled');
CREATE TYPE visibility AS ENUM ('private', 'public', 'shared');
CREATE TYPE log_level AS ENUM ('debug', 'info', 'warning', 'error', 'critical');
CREATE TYPE log_event_type AS ENUM ('model_execution', 'benchmark_execution', 'authentication', 'admin_action', 'system_error', 'configuration_change', 'session_event');
```

---

## Seed Data Strategy

### Record Distribution

The schema includes a comprehensive seed script (`src/db/seed.ts`) that generates:

- **100 Users** with varied roles and statuses
- **100 User Preferences** (1 per user)
- **20 AI Models** (mixture of local and cloud providers)
- **150 Device Profiles** (across users)
- **500 Model Configurations** (user-created configs)
- **1,500 Benchmarks** (performance test results)
- **300 Prompt Templates** (reusable prompts)
- **200 Agent Presets** (configured agents)
- **2,000 Model Sessions** (interactive sessions)
- **5,000 Session Messages** (conversation history)
- **3,000 System Logs** (audit trail)
- **50 API Keys** (programmatic access)

**Total: 13,520 records**

### Running the Seed

```bash
# Install dependencies
npm install

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

---

## Drizzle ORM Migration Recommendations

### Initial Schema Generation

```bash
npm run db:generate
```

This command:
1. Generates SQL migrations in `src/db/migrations/`
2. Creates zero-based numbered files (0001_*.sql)
3. Includes proper ALTER TABLE statements

### Applying Migrations

```bash
npm run db:migrate
```

This:
1. Reads all pending migrations
2. Applies them in order
3. Tracks applied migrations in drizzle metadata table
4. Supports rollback via custom scripts

### Zero-Downtime Migrations

For production deployments:

```sql
-- Add column without default (fast)
ALTER TABLE model_sessions ADD COLUMN new_field VARCHAR(255);

-- Backfill in batches (in application code)
-- Update 1000 rows at a time

-- Add NOT NULL constraint only after backfill
ALTER TABLE model_sessions ALTER COLUMN new_field SET NOT NULL;
```

### Viewing Schema Changes

```bash
npm run db:push  # Preview changes (Neon-specific)
```

---

## Performance Optimization Tips

### 1. **Connection Pooling**

```typescript
// Already configured in db/index.ts
import postgres from 'postgres';
const sql = postgres(DATABASE_URL);
const db = drizzle(sql, { schema });
```

### 2. **Batch Operations**

```typescript
// Insert many records efficiently
await db.insert(schema.users).values(userData).returning();
```

### 3. **Selective Queries**

```typescript
// Only select needed columns
const sessions = await db
  .select({
    id: model_sessions.id,
    name: model_sessions.sessionName,
    status: model_sessions.status
  })
  .from(model_sessions)
  .where(eq(model_sessions.userId, userId));
```

### 4. **Index Utilization**

Always use indexed columns in WHERE clauses:

```typescript
// Good: uses index on user_id
await db.query.modelSessions.findMany({
  where: eq(model_sessions.userId, userId)
});

// Also indexes: status, created_at
```

### 5. **EXPLAIN ANALYZE for Slow Queries**

```sql
EXPLAIN ANALYZE
SELECT * FROM benchmarks
WHERE model_id = 5
AND created_at > now() - interval '30 days'
ORDER BY tokens_per_second DESC
LIMIT 50;
```

---

## Disaster Recovery

### Backup Strategy

```bash
# Full backup
pg_dump DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql DATABASE_URL < backup_20240523.sql
```

### Point-in-Time Recovery (PITR)

Neon provides automatic daily backups. Access through the console for recovery.

### Migration Rollback

```bash
# Revert last migration (requires custom script)
npm run db:rollback
```

---

## Security Considerations

1. **Password Hashing**: Store bcrypt hashes in `password_hash` field
2. **API Key Hashing**: Store hashed keys in `key_hash`, never plain text
3. **Soft Deletes**: Prevents accidental data loss
4. **Role-Based Access**: Use `user_role` enum for authorization
5. **Audit Logging**: `system_logs` table tracks all actions
6. **SQL Injection**: Drizzle ORM parameterizes all queries

---

## Migration Checklist

- [ ] Install dependencies: `npm install`
- [ ] Set up `.env` with `DATABASE_URL`
- [ ] Generate migrations: `npm run db:generate`
- [ ] Review migration files in `src/db/migrations/`
- [ ] Apply migrations: `npm run db:migrate`
- [ ] Seed data: `npm run db:seed`
- [ ] Verify schema: Check Neon console or `psql`
- [ ] Test queries: Run sample queries from this doc
- [ ] Set up monitoring: Monitor slow queries

---

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL JSON Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Neon Database Console](https://console.neon.tech/)
- [Query Optimization Guide](https://www.postgresql.org/docs/current/sql-explain.html)
