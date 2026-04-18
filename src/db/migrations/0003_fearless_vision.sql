CREATE TABLE `interview_qa` (
	`id` text PRIMARY KEY NOT NULL,
	`round_id` text NOT NULL,
	`user_id` text NOT NULL,
	`question` text NOT NULL,
	`answer` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`round_id`) REFERENCES `interview_round`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_interview_qa_round` ON `interview_qa` (`round_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `interview_round` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`user_id` text NOT NULL,
	`round_type` text NOT NULL,
	`custom_type_name` text,
	`scheduled_at` integer,
	`duration_minutes` integer DEFAULT 60,
	`interviewer_name` text,
	`interviewer_role` text,
	`meeting_link` text,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`rating` integer,
	`experience_notes` text,
	`feedback` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_interview_round_app` ON `interview_round` (`application_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_interview_round_user` ON `interview_round` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_interview_round_scheduled` ON `interview_round` (`application_id`,`scheduled_at`);