import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "@/shared/types";
import { createDb } from "@/server/lib/db";
import { apiError, success } from "@/server/lib/response";
import { AppError } from "@/server/lib/errors";
import { analyticsThresholdsSchema } from "@/shared/validators/analytics";
import * as userSettingsService from "@/server/services/userSettings";

const app = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Error handler -- catches AppError instances and formats per D-03
// ---------------------------------------------------------------------------

app.onError((err, c) => {
	if (err instanceof AppError) {
		return c.json(apiError(err.code, err.message), err.statusCode as any);
	}
	console.error("Unhandled error:", err);
	return c.json(
		apiError("INTERNAL_ERROR", "An unexpected error occurred"),
		500,
	);
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** GET → stored thresholds, or ANALYTICS_THRESHOLD_DEFAULTS when no row. */
app.get("/api/settings/analytics-thresholds", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const result = await userSettingsService.getAnalyticsThresholds(db, userId);
	return c.json(success(result));
});

/** PATCH → upsert via ON CONFLICT DO UPDATE. Validates with analyticsThresholdsSchema. */
app.patch(
	"/api/settings/analytics-thresholds",
	zValidator("json", analyticsThresholdsSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const input = c.req.valid("json");
		const result = await userSettingsService.upsertAnalyticsThresholds(
			db,
			userId,
			input,
		);
		return c.json(success(result));
	},
);

/** POST reset → delete row; return defaults. */
app.post("/api/settings/analytics-thresholds/reset", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const result = await userSettingsService.resetAnalyticsThresholds(
		db,
		userId,
	);
	return c.json(success(result));
});

export { app as userSettingsRoutes };
