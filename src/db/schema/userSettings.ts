import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

/**
 * User settings — one row per user, created lazily on first PATCH (ON CONFLICT DO UPDATE).
 *
 * `analyticsThresholds` stores JSON matching `analyticsThresholdsSchema` from
 * `@/shared/validators/analytics`. When the row is absent or the JSON column
 * is null, the server returns `ANALYTICS_THRESHOLD_DEFAULTS`.
 */
export const userSettings = sqliteTable("user_settings", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	analyticsThresholds: text("analytics_thresholds"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});
