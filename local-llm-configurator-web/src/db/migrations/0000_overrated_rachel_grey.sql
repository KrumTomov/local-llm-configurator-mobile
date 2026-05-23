CREATE TYPE "public"."log_event_type" AS ENUM('model_execution', 'benchmark_execution', 'authentication', 'admin_action', 'system_error', 'configuration_change', 'session_event');--> statement-breakpoint
CREATE TYPE "public"."log_level" AS ENUM('debug', 'info', 'warning', 'error', 'critical');--> statement-breakpoint
CREATE TYPE "public"."model_availability" AS ENUM('local_only', 'cloud_only', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."model_provider" AS ENUM('openai', 'anthropic', 'huggingface', 'ollama', 'llama_cpp', 'vllm', 'other');--> statement-breakpoint
CREATE TYPE "public"."model_type" AS ENUM('language_model', 'embedding_model', 'image_model', 'multimodal_model', 'code_model');--> statement-breakpoint
CREATE TYPE "public"."quantization" AS ENUM('fp32', 'fp16', 'int8', 'int4', 'gguf_q2', 'gguf_q3', 'gguf_q4', 'gguf_q5', 'gguf_q6', 'gguf_q8');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('active', 'completed', 'paused', 'error', 'timeout', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'moderator', 'user', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'deactivated', 'pending_verification');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('private', 'public', 'shared');--> statement-breakpoint
CREATE TABLE "agent_presets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"system_prompt" text,
	"model_id" integer NOT NULL,
	"configuration_id" integer,
	"category" varchar(100),
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"tool_permissions" jsonb,
	"max_context_tokens" integer,
	"temperature" numeric(3, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ai_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"family" varchar(255) NOT NULL,
	"provider" "model_provider" NOT NULL,
	"model_type" "model_type" NOT NULL,
	"parameter_count" bigint,
	"quantization" "quantization",
	"context_window" integer,
	"recommended_vram_mb" integer,
	"recommended_ram_mb" integer,
	"availability" "model_availability" NOT NULL,
	"description" text,
	"model_url" varchar(512),
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"key_hash" text NOT NULL,
	"key_name" varchar(255) NOT NULL,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "benchmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"model_id" integer NOT NULL,
	"configuration_id" integer,
	"device_profile_id" integer,
	"benchmark_name" varchar(255),
	"benchmark_prompt" text NOT NULL,
	"benchmark_result" text,
	"tokens_per_second" real,
	"latency_ms" real,
	"ttft_ms" real,
	"vram_used_mb" integer,
	"ram_used_mb" integer,
	"cpu_usage_percent" real,
	"completion_tokens" integer,
	"prompt_tokens" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"device_name" varchar(255) NOT NULL,
	"gpu_model" varchar(255),
	"gpu_vram_mb" integer,
	"cpu_cores" smallint,
	"total_ram_mb" integer,
	"os_name" varchar(100),
	"os_version" varchar(100),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_configurations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"model_id" integer NOT NULL,
	"config_name" varchar(255) NOT NULL,
	"description" text,
	"temperature" numeric(3, 2) DEFAULT '0.7',
	"top_p" numeric(3, 2) DEFAULT '1.0',
	"top_k" integer DEFAULT 40,
	"repeat_penalty" numeric(3, 2) DEFAULT '1.1',
	"context_size" integer,
	"max_tokens" integer,
	"gpu_layers" integer,
	"batch_size" integer DEFAULT 1,
	"system_prompt" text,
	"use_case_category" varchar(100),
	"is_public" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "model_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"model_id" integer NOT NULL,
	"configuration_id" integer NOT NULL,
	"agent_preset_id" integer,
	"session_name" varchar(255),
	"status" "session_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"total_tokens_used" integer DEFAULT 0,
	"prompt_tokens" integer DEFAULT 0,
	"completion_tokens" integer DEFAULT 0,
	"estimated_cost" numeric(10, 6),
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"category" varchar(100),
	"tags" text,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"version" integer DEFAULT 1,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "session_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"tokens_used" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"event_type" "log_event_type" NOT NULL,
	"level" "log_level" DEFAULT 'info' NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text,
	"metadata" jsonb,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"status_code" integer,
	"error_stack_trace" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"theme" varchar(50) DEFAULT 'light',
	"default_model_id" integer,
	"default_configuration_id" integer,
	"notifications_enabled" boolean DEFAULT true,
	"data_retention_days" integer DEFAULT 90,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"avatar_url" varchar(512),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"status" "user_status" DEFAULT 'pending_verification' NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "agent_presets" ADD CONSTRAINT "agent_presets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_presets" ADD CONSTRAINT "agent_presets_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_presets" ADD CONSTRAINT "agent_presets_configuration_id_model_configurations_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."model_configurations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmarks" ADD CONSTRAINT "benchmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmarks" ADD CONSTRAINT "benchmarks_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmarks" ADD CONSTRAINT "benchmarks_configuration_id_model_configurations_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."model_configurations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmarks" ADD CONSTRAINT "benchmarks_device_profile_id_device_profiles_id_fk" FOREIGN KEY ("device_profile_id") REFERENCES "public"."device_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_profiles" ADD CONSTRAINT "device_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_configurations" ADD CONSTRAINT "model_configurations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_configurations" ADD CONSTRAINT "model_configurations_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_sessions" ADD CONSTRAINT "model_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_sessions" ADD CONSTRAINT "model_sessions_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_sessions" ADD CONSTRAINT "model_sessions_configuration_id_model_configurations_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."model_configurations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_sessions" ADD CONSTRAINT "model_sessions_agent_preset_id_agent_presets_id_fk" FOREIGN KEY ("agent_preset_id") REFERENCES "public"."agent_presets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD CONSTRAINT "prompt_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_messages" ADD CONSTRAINT "session_messages_session_id_model_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."model_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agent_presets_user_id" ON "agent_presets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_agent_presets_model_id" ON "agent_presets" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_agent_presets_visibility" ON "agent_presets" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "idx_ai_models_provider" ON "ai_models" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_ai_models_family" ON "ai_models" USING btree ("family");--> statement-breakpoint
CREATE INDEX "idx_ai_models_model_type" ON "ai_models" USING btree ("model_type");--> statement-breakpoint
CREATE INDEX "idx_ai_models_is_active" ON "ai_models" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_api_keys_user_id" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_api_keys_is_active" ON "api_keys" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_benchmarks_user_id" ON "benchmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_benchmarks_model_id" ON "benchmarks" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_benchmarks_configuration_id" ON "benchmarks" USING btree ("configuration_id");--> statement-breakpoint
CREATE INDEX "idx_benchmarks_device_profile_id" ON "benchmarks" USING btree ("device_profile_id");--> statement-breakpoint
CREATE INDEX "idx_benchmarks_created_at" ON "benchmarks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_device_profiles_user_id" ON "device_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_model_configurations_user_id" ON "model_configurations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_model_configurations_model_id" ON "model_configurations" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_model_configurations_is_public" ON "model_configurations" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "idx_model_sessions_user_id" ON "model_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_model_sessions_model_id" ON "model_sessions" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_model_sessions_status" ON "model_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_model_sessions_started_at" ON "model_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "idx_model_sessions_created_at" ON "model_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_prompt_templates_user_id" ON "prompt_templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_prompt_templates_visibility" ON "prompt_templates" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "idx_prompt_templates_category" ON "prompt_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_session_messages_session_id" ON "session_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_session_messages_created_at" ON "session_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_system_logs_user_id" ON "system_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_system_logs_event_type" ON "system_logs" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_system_logs_level" ON "system_logs" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_system_logs_created_at" ON "system_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_preferences_user_id" ON "user_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_status" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at");