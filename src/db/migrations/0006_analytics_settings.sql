CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`analytics_thresholds` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_timeline_event_user_occurred` ON `timeline_event` (`user_id`,`occurred_at`);
