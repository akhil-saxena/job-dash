import { env } from "cloudflare:test";

// Migration SQL from src/db/migrations/0000_tricky_leo.sql (auth tables)
// + src/db/migrations/0001_lively_goblin_queen.sql (application + timeline_event tables)
// Using env.DB.exec() which processes multiple semicolon-separated statements
const migrationSQL = `
CREATE TABLE IF NOT EXISTS \`account\` (\`id\` text PRIMARY KEY NOT NULL, \`user_id\` text NOT NULL, \`account_id\` text NOT NULL, \`provider_id\` text NOT NULL, \`access_token\` text, \`refresh_token\` text, \`access_token_expires_at\` integer, \`refresh_token_expires_at\` integer, \`scope\` text, \`id_token\` text, \`password\` text, \`created_at\` integer DEFAULT (unixepoch()) NOT NULL, \`updated_at\` integer DEFAULT (unixepoch()) NOT NULL, FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade);
CREATE TABLE IF NOT EXISTS \`session\` (\`id\` text PRIMARY KEY NOT NULL, \`user_id\` text NOT NULL, \`token\` text NOT NULL, \`expires_at\` integer NOT NULL, \`ip_address\` text, \`user_agent\` text, \`created_at\` integer DEFAULT (unixepoch()) NOT NULL, \`updated_at\` integer DEFAULT (unixepoch()) NOT NULL, FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade);
CREATE UNIQUE INDEX IF NOT EXISTS \`session_token_unique\` ON \`session\` (\`token\`);
CREATE TABLE IF NOT EXISTS \`user\` (\`id\` text PRIMARY KEY NOT NULL, \`name\` text NOT NULL, \`email\` text NOT NULL, \`email_verified\` integer DEFAULT false NOT NULL, \`image\` text, \`created_at\` integer DEFAULT (unixepoch()) NOT NULL, \`updated_at\` integer DEFAULT (unixepoch()) NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS \`user_email_unique\` ON \`user\` (\`email\`);
CREATE TABLE IF NOT EXISTS \`verification\` (\`id\` text PRIMARY KEY NOT NULL, \`identifier\` text NOT NULL, \`value\` text NOT NULL, \`expires_at\` integer NOT NULL, \`created_at\` integer DEFAULT (unixepoch()) NOT NULL, \`updated_at\` integer DEFAULT (unixepoch()) NOT NULL);
CREATE TABLE IF NOT EXISTS \`application\` (\`id\` text PRIMARY KEY NOT NULL, \`user_id\` text NOT NULL, \`company_name\` text NOT NULL, \`role_title\` text NOT NULL, \`job_posting_url\` text, \`location_type\` text, \`location_city\` text, \`salary_min\` integer, \`salary_max\` integer, \`salary_offered\` integer, \`salary_currency\` text DEFAULT 'INR', \`equity\` text, \`bonus\` text, \`status\` text DEFAULT 'wishlist' NOT NULL, \`priority\` text DEFAULT 'medium', \`source\` text, \`is_pinned\` integer DEFAULT false NOT NULL, \`is_archived\` integer DEFAULT false NOT NULL, \`notes\` text, \`slug\` text NOT NULL, \`applied_at\` integer, \`created_at\` integer DEFAULT (unixepoch()) NOT NULL, \`updated_at\` integer DEFAULT (unixepoch()) NOT NULL, \`deleted_at\` integer, FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade);
CREATE UNIQUE INDEX IF NOT EXISTS \`idx_application_user_slug\` ON \`application\` (\`user_id\`,\`slug\`);
CREATE INDEX IF NOT EXISTS \`idx_application_user_status\` ON \`application\` (\`user_id\`,\`status\`);
CREATE INDEX IF NOT EXISTS \`idx_application_user_created\` ON \`application\` (\`user_id\`,\`created_at\`);
CREATE INDEX IF NOT EXISTS \`idx_application_user_archived\` ON \`application\` (\`user_id\`,\`is_archived\`);
CREATE INDEX IF NOT EXISTS \`idx_application_user_pinned\` ON \`application\` (\`user_id\`,\`is_pinned\`);
CREATE TABLE IF NOT EXISTS \`timeline_event\` (\`id\` text PRIMARY KEY NOT NULL, \`application_id\` text NOT NULL, \`user_id\` text NOT NULL, \`event_type\` text NOT NULL, \`description\` text NOT NULL, \`metadata\` text, \`occurred_at\` integer DEFAULT (unixepoch()) NOT NULL, FOREIGN KEY (\`application_id\`) REFERENCES \`application\`(\`id\`) ON UPDATE no action ON DELETE cascade, FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade);
CREATE INDEX IF NOT EXISTS \`idx_timeline_event_app\` ON \`timeline_event\` (\`application_id\`,\`occurred_at\`);
CREATE TABLE IF NOT EXISTS \`interview_round\` (\`id\` text PRIMARY KEY NOT NULL, \`application_id\` text NOT NULL, \`user_id\` text NOT NULL, \`round_type\` text NOT NULL, \`custom_type_name\` text, \`scheduled_at\` integer, \`duration_minutes\` integer DEFAULT 60, \`interviewer_name\` text, \`interviewer_role\` text, \`meeting_link\` text, \`status\` text DEFAULT 'scheduled' NOT NULL, \`rating\` integer, \`experience_notes\` text, \`feedback\` text, \`sort_order\` integer DEFAULT 0 NOT NULL, \`created_at\` integer DEFAULT (unixepoch()) NOT NULL, \`updated_at\` integer DEFAULT (unixepoch()) NOT NULL, FOREIGN KEY (\`application_id\`) REFERENCES \`application\`(\`id\`) ON UPDATE no action ON DELETE cascade, FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade);
CREATE INDEX IF NOT EXISTS \`idx_interview_round_app\` ON \`interview_round\` (\`application_id\`,\`sort_order\`);
CREATE INDEX IF NOT EXISTS \`idx_interview_round_user\` ON \`interview_round\` (\`user_id\`);
CREATE INDEX IF NOT EXISTS \`idx_interview_round_scheduled\` ON \`interview_round\` (\`application_id\`,\`scheduled_at\`);
CREATE TABLE IF NOT EXISTS \`interview_qa\` (\`id\` text PRIMARY KEY NOT NULL, \`round_id\` text NOT NULL, \`user_id\` text NOT NULL, \`question\` text NOT NULL, \`answer\` text, \`sort_order\` integer DEFAULT 0 NOT NULL, \`created_at\` integer DEFAULT (unixepoch()) NOT NULL, \`updated_at\` integer DEFAULT (unixepoch()) NOT NULL, FOREIGN KEY (\`round_id\`) REFERENCES \`interview_round\`(\`id\`) ON UPDATE no action ON DELETE cascade, FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade);
CREATE INDEX IF NOT EXISTS \`idx_interview_qa_round\` ON \`interview_qa\` (\`round_id\`,\`sort_order\`);
`;

// D1 exec() handles multiple semicolon-separated statements
await env.DB.exec(migrationSQL);
