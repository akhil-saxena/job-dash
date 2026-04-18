import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "@/shared/types";
import { createDb } from "@/server/lib/db";
import { success, apiError } from "@/server/lib/response";
import { AppError } from "@/server/lib/errors";
import * as tagService from "@/server/services/tag";
import {
	createTagSchema,
	updateTagSchema,
	assignTagSchema,
} from "@/shared/validators/tag";

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
// POST /api/tags -- Create a new tag (TAG-01)
// ---------------------------------------------------------------------------

app.post(
	"/api/tags",
	zValidator("json", createTagSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const input = c.req.valid("json");
		const result = await tagService.create(db, userId, input);
		return c.json(success(result), 201);
	},
);

// ---------------------------------------------------------------------------
// GET /api/tags -- List all tags for the user
// ---------------------------------------------------------------------------

app.get("/api/tags", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const result = await tagService.list(db, userId);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// PATCH /api/tags/:tagId -- Update a tag
// ---------------------------------------------------------------------------

app.patch(
	"/api/tags/:tagId",
	zValidator("json", updateTagSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const tagId = c.req.param("tagId");
		const input = c.req.valid("json");
		const result = await tagService.update(db, userId, tagId, input);
		return c.json(success(result));
	},
);

// ---------------------------------------------------------------------------
// DELETE /api/tags/:tagId -- Delete a tag
// ---------------------------------------------------------------------------

app.delete("/api/tags/:tagId", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const tagId = c.req.param("tagId");
	const result = await tagService.remove(db, userId, tagId);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// POST /api/applications/:appId/tags -- Assign tag to application (TAG-02)
// ---------------------------------------------------------------------------

app.post(
	"/api/applications/:appId/tags",
	zValidator("json", assignTagSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const appId = c.req.param("appId");
		const { tagId } = c.req.valid("json");
		const result = await tagService.assignTag(db, userId, appId, tagId);
		return c.json(success(result), 201);
	},
);

// ---------------------------------------------------------------------------
// DELETE /api/applications/:appId/tags/:tagId -- Unassign tag from application
// ---------------------------------------------------------------------------

app.delete("/api/applications/:appId/tags/:tagId", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const appId = c.req.param("appId");
	const tagId = c.req.param("tagId");
	const result = await tagService.unassignTag(db, userId, appId, tagId);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// GET /api/applications/:appId/tags -- Get tags for an application
// ---------------------------------------------------------------------------

app.get("/api/applications/:appId/tags", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const appId = c.req.param("appId");
	const result = await tagService.getTagsForApplication(db, userId, appId);
	return c.json(success(result));
});

export { app as tagRoutes };
