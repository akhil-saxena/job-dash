import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "@/shared/types";
import { createDb } from "@/server/lib/db";
import { success, paginated, apiError } from "@/server/lib/response";
import { AppError } from "@/server/lib/errors";
import * as applicationService from "@/server/services/application";
import {
	createApplicationSchema,
	updateApplicationSchema,
	statusChangeSchema,
	listApplicationsSchema,
} from "@/shared/validators/application";

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
// POST /api/applications -- Create a new application (TRACK-01)
// ---------------------------------------------------------------------------

app.post(
	"/api/applications",
	zValidator("json", createApplicationSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const input = c.req.valid("json");
		const result = await applicationService.create(db, userId, input);
		return c.json(success(result), 201);
	},
);

// ---------------------------------------------------------------------------
// GET /api/applications -- List with filtering/search/pagination (TRACK-02)
// ---------------------------------------------------------------------------

app.get(
	"/api/applications",
	zValidator("query", listApplicationsSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const params = c.req.valid("query");
		const result = await applicationService.list(db, userId, params);
		return c.json(paginated(result.items, result.page, result.limit, result.total));
	},
);

// ---------------------------------------------------------------------------
// GET /api/application-by-slug/:slug -- Get single application by slug
// NOTE: Separate path to avoid Hono trie router conflict with /:id
// ---------------------------------------------------------------------------

app.get("/api/application-by-slug/:slug", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const slug = c.req.param("slug");
	const result = await applicationService.getBySlug(db, userId, slug);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// GET /api/applications/:id -- Get single application with timeline
// ---------------------------------------------------------------------------

app.get("/api/applications/:id", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const id = c.req.param("id");
	const result = await applicationService.getById(db, userId, id);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// PATCH /api/applications/:id -- Update any fields (TRACK-02)
// ---------------------------------------------------------------------------

app.patch(
	"/api/applications/:id",
	zValidator("json", updateApplicationSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const id = c.req.param("id");
		const input = c.req.valid("json");
		const result = await applicationService.update(db, userId, id, input);
		return c.json(success(result));
	},
);

// ---------------------------------------------------------------------------
// PATCH /api/applications/:id/status -- Dedicated status change (TRACK-07)
// ---------------------------------------------------------------------------

app.patch(
	"/api/applications/:id/status",
	zValidator("json", statusChangeSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const id = c.req.param("id");
		const { status } = c.req.valid("json");
		const result = await applicationService.changeStatus(db, userId, id, status);
		return c.json(success(result));
	},
);

// ---------------------------------------------------------------------------
// PATCH /api/applications/:id/pin -- Toggle pin (TRACK-05)
// ---------------------------------------------------------------------------

app.patch("/api/applications/:id/pin", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const id = c.req.param("id");
	const result = await applicationService.togglePin(db, userId, id);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// PATCH /api/applications/:id/archive -- Toggle archive (TRACK-04)
// ---------------------------------------------------------------------------

app.patch("/api/applications/:id/archive", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const id = c.req.param("id");
	const result = await applicationService.toggleArchive(db, userId, id);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// DELETE /api/applications/:id -- Soft-delete (TRACK-03)
// ---------------------------------------------------------------------------

app.delete("/api/applications/:id", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const id = c.req.param("id");
	const result = await applicationService.softDelete(db, userId, id);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// PATCH /api/applications/:id/restore -- Restore soft-deleted (TRACK-03)
// ---------------------------------------------------------------------------

app.patch("/api/applications/:id/restore", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const id = c.req.param("id");
	const result = await applicationService.restore(db, userId, id);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// GET /api/applications/:id/timeline -- Timeline events for an application
// ---------------------------------------------------------------------------

app.get("/api/applications/:id/timeline", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const id = c.req.param("id");
	const events = await applicationService.getTimeline(db, userId, id);
	return c.json(success(events));
});

export { app as applicationRoutes };
