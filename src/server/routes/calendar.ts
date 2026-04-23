import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "@/shared/types";
import { createDb } from "@/server/lib/db";
import { apiError, success } from "@/server/lib/response";
import { AppError } from "@/server/lib/errors";
import { calendarMonthSchema } from "@/shared/validators/calendar";
import * as calendarService from "@/server/services/calendar";

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
// GET /api/calendar/events?month=YYYY-MM -- VIEW-03
// ---------------------------------------------------------------------------

app.get(
	"/api/calendar/events",
	zValidator("query", calendarMonthSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const { month } = c.req.valid("query");
		const [year, monthNum] = month.split("-").map(Number);
		// Anchor at UTC start of month. getMonthEvents derives the 42-cell
		// window from this anchor.
		const anchor = new Date(Date.UTC(year, monthNum - 1, 1));
		const result = await calendarService.getMonthEvents(db, userId, anchor);
		return c.json(success(result));
	},
);

export { app as calendarRoutes };
