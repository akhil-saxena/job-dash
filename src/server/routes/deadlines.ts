import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "@/shared/types";
import { createDb } from "@/server/lib/db";
import { success, apiError } from "@/server/lib/response";
import { AppError } from "@/server/lib/errors";
import * as deadlineService from "@/server/services/deadline";
import {
	createDeadlineSchema,
	updateDeadlineSchema,
} from "@/shared/validators/deadline";

const app = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Error handler -- catches AppError instances and formats per D-03
// ---------------------------------------------------------------------------

app.onError((err, c) => {
	if (err instanceof AppError) {
		return c.json(apiError(err.code, err.message), err.statusCode as any);
	}
	console.error("Unhandled error:", err);
	return c.json(apiError("INTERNAL_ERROR", "An unexpected error occurred"), 500);
});

// ---------------------------------------------------------------------------
// POST /api/applications/:appId/deadlines -- Create deadline (DEAD-01)
// ---------------------------------------------------------------------------

app.post(
	"/api/applications/:appId/deadlines",
	zValidator("json", createDeadlineSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const appId = c.req.param("appId");
		const input = c.req.valid("json");
		const result = await deadlineService.create(db, userId, appId, input);
		return c.json(success(result), 201);
	},
);

// ---------------------------------------------------------------------------
// GET /api/applications/:appId/deadlines -- List deadlines for app
// ---------------------------------------------------------------------------

app.get("/api/applications/:appId/deadlines", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const appId = c.req.param("appId");
	const result = await deadlineService.listForApplication(db, userId, appId);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// GET /api/deadlines/upcoming -- List all upcoming deadlines for user
// ---------------------------------------------------------------------------

app.get("/api/deadlines/upcoming", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const result = await deadlineService.listUpcoming(db, userId);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// PATCH /api/deadlines/:deadlineId -- Update deadline
// ---------------------------------------------------------------------------

app.patch(
	"/api/deadlines/:deadlineId",
	zValidator("json", updateDeadlineSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const deadlineId = c.req.param("deadlineId");
		const input = c.req.valid("json");
		const result = await deadlineService.update(db, userId, deadlineId, input);
		return c.json(success(result));
	},
);

// ---------------------------------------------------------------------------
// PATCH /api/deadlines/:deadlineId/complete -- Mark deadline complete
// ---------------------------------------------------------------------------

app.patch("/api/deadlines/:deadlineId/complete", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const deadlineId = c.req.param("deadlineId");
	const result = await deadlineService.complete(db, userId, deadlineId);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// DELETE /api/deadlines/:deadlineId -- Delete deadline
// ---------------------------------------------------------------------------

app.delete("/api/deadlines/:deadlineId", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const deadlineId = c.req.param("deadlineId");
	const result = await deadlineService.remove(db, userId, deadlineId);
	return c.json(success(result));
});

export { app as deadlineRoutes };
