import { eq } from "drizzle-orm";
import { userSettings } from "@/db/schema";
import type { Database } from "@/server/lib/db";
import {
	ANALYTICS_THRESHOLD_DEFAULTS,
	type AnalyticsThresholds,
} from "@/shared/validators/analytics";

/**
 * Return the user's stored analytics thresholds, or the app defaults if no
 * row exists (or the column is null, or the JSON is corrupt). Defaults are the
 * canonical source of truth — the server returns them verbatim so the client
 * never has to maintain a parallel fallback.
 */
export async function getAnalyticsThresholds(
	db: Database,
	userId: string,
): Promise<AnalyticsThresholds> {
	const row = await db
		.select()
		.from(userSettings)
		.where(eq(userSettings.userId, userId))
		.get();

	if (!row || !row.analyticsThresholds) {
		return ANALYTICS_THRESHOLD_DEFAULTS as unknown as AnalyticsThresholds;
	}
	try {
		return JSON.parse(row.analyticsThresholds) as AnalyticsThresholds;
	} catch {
		return ANALYTICS_THRESHOLD_DEFAULTS as unknown as AnalyticsThresholds;
	}
}

/**
 * Upsert the user's thresholds. Uses ON CONFLICT DO UPDATE so two rapid
 * debounced PATCHes never collide (Pitfall 8). Returns the thresholds as
 * stored (echoes the input).
 */
export async function upsertAnalyticsThresholds(
	db: Database,
	userId: string,
	thresholds: AnalyticsThresholds,
): Promise<AnalyticsThresholds> {
	const json = JSON.stringify(thresholds);
	await db
		.insert(userSettings)
		.values({ userId, analyticsThresholds: json })
		.onConflictDoUpdate({
			target: userSettings.userId,
			set: { analyticsThresholds: json, updatedAt: new Date() },
		});
	return thresholds;
}

/**
 * Delete the user's row so the next GET falls back to defaults.
 * Backs the "Reset defaults" Settings button.
 */
export async function resetAnalyticsThresholds(
	db: Database,
	userId: string,
): Promise<AnalyticsThresholds> {
	await db.delete(userSettings).where(eq(userSettings.userId, userId));
	return ANALYTICS_THRESHOLD_DEFAULTS as unknown as AnalyticsThresholds;
}
