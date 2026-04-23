import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "@/shared/types";
import { createDb } from "@/server/lib/db";
import { apiError, success } from "@/server/lib/response";
import { AppError } from "@/server/lib/errors";
import { analyticsRangeSchema } from "@/shared/validators/analytics";
import * as analyticsService from "@/server/services/analytics";

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
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert ISO YYYY-MM-DD strings to a UTC-bounded Date range.
 * - `from` → UTC start-of-day (T00:00:00.000Z)
 * - `to`   → UTC end-of-day   (T23:59:59.999Z)
 * Pitfall 2: document UTC semantics so the user's local midnight can cross
 * day boundaries without silently losing rows.
 */
function parseRange(from: string, to: string): { from: Date; to: Date } {
	return {
		from: new Date(`${from}T00:00:00.000Z`),
		to: new Date(`${to}T23:59:59.999Z`),
	};
}

// ---------------------------------------------------------------------------
// Routes -- all require ?from=YYYY-MM-DD&to=YYYY-MM-DD
// ---------------------------------------------------------------------------

app.get(
	"/api/analytics/funnel",
	zValidator("query", analyticsRangeSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const { from, to } = c.req.valid("query");
		const range = parseRange(from, to);
		const result = await analyticsService.getFunnelCounts(db, userId, range);
		return c.json(success(result));
	},
);

app.get(
	"/api/analytics/response-times",
	zValidator("query", analyticsRangeSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const { from, to } = c.req.valid("query");
		const range = parseRange(from, to);
		const result = await analyticsService.getResponseTimeAverages(
			db,
			userId,
			range,
		);
		return c.json(success(result));
	},
);

app.get(
	"/api/analytics/sources",
	zValidator("query", analyticsRangeSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const { from, to } = c.req.valid("query");
		const range = parseRange(from, to);
		const result = await analyticsService.getSourceBreakdown(
			db,
			userId,
			range,
		);
		return c.json(success(result));
	},
);

app.get(
	"/api/analytics/stats",
	zValidator("query", analyticsRangeSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const { from, to } = c.req.valid("query");
		const range = parseRange(from, to);
		const result = await analyticsService.getStatCards(db, userId, range);
		return c.json(success(result));
	},
);

export { app as analyticsRoutes };
