CREATE TABLE `application` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`company_name` text NOT NULL,
	`role_title` text NOT NULL,
	`job_posting_url` text,
	`location_type` text,
	`location_city` text,
	`salary_min` integer,
	`salary_max` integer,
	`salary_offered` integer,
	`salary_currency` text DEFAULT 'INR',
	`equity` text,
	`bonus` text,
	`status` text DEFAULT 'wishlist' NOT NULL,
	`priority` text DEFAULT 'medium',
	`source` text,
	`is_pinned` integer DEFAULT false NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`notes` text,
	`slug` text NOT NULL,
	`applied_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_application_user_slug` ON `application` (`user_id`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_application_user_status` ON `application` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_application_user_created` ON `application` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_application_user_archived` ON `application` (`user_id`,`is_archived`);--> statement-breakpoint
CREATE INDEX `idx_application_user_pinned` ON `application` (`user_id`,`is_pinned`);--> statement-breakpoint
CREATE TABLE `timeline_event` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`user_id` text NOT NULL,
	`event_type` text NOT NULL,
	`description` text NOT NULL,
	`metadata` text,
	`occurred_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_timeline_event_app` ON `timeline_event` (`application_id`,`occurred_at`);