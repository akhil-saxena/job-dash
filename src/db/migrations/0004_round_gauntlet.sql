CREATE TABLE `application_tag` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tag`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_application_tag_unique` ON `application_tag` (`application_id`,`tag_id`);--> statement-breakpoint
CREATE INDEX `idx_application_tag_tag` ON `application_tag` (`tag_id`);--> statement-breakpoint
CREATE TABLE `tag` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT 'blue' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_tag_user_name` ON `tag` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `deadline` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`user_id` text NOT NULL,
	`deadline_type` text NOT NULL,
	`label` text,
	`due_date` integer NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_deadline_app` ON `deadline` (`application_id`);--> statement-breakpoint
CREATE INDEX `idx_deadline_user_due` ON `deadline` (`user_id`,`due_date`);--> statement-breakpoint
CREATE TABLE `company` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`domain` text,
	`website` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_company_user_domain` ON `company` (`user_id`,`domain`);--> statement-breakpoint
CREATE INDEX `idx_company_user_name` ON `company` (`user_id`,`name`);