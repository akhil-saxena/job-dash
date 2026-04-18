import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "@/shared/types";
import { createDb } from "@/server/lib/db";
import { success, apiError } from "@/server/lib/response";
import { AppError } from "@/server/lib/errors";
import * as companyService from "@/server/services/company";
import {
	createCompanySchema,
	updateCompanySchema,
} from "@/shared/validators/company";

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
// POST /api/companies -- Find or create company (COMP-01)
// ---------------------------------------------------------------------------

app.post(
	"/api/companies",
	zValidator("json", createCompanySchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const input = c.req.valid("json");
		const result = await companyService.findOrCreate(db, userId, input);
		return c.json(success(result), result.created ? 201 : 200);
	},
);

// ---------------------------------------------------------------------------
// GET /api/companies -- List all companies for user
// ---------------------------------------------------------------------------

app.get("/api/companies", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const result = await companyService.list(db, userId);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// GET /api/companies/:companyId -- Get single company (COMP-02, COMP-03)
// ---------------------------------------------------------------------------

app.get("/api/companies/:companyId", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const companyId = c.req.param("companyId");
	const result = await companyService.getById(db, userId, companyId);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// PATCH /api/companies/:companyId -- Update company (notes, domain, etc.)
// ---------------------------------------------------------------------------

app.patch(
	"/api/companies/:companyId",
	zValidator("json", updateCompanySchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const companyId = c.req.param("companyId");
		const input = c.req.valid("json");
		const result = await companyService.update(db, userId, companyId, input);
		return c.json(success(result));
	},
);

// ---------------------------------------------------------------------------
// DELETE /api/companies/:companyId -- Delete company
// ---------------------------------------------------------------------------

app.delete("/api/companies/:companyId", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const companyId = c.req.param("companyId");
	const result = await companyService.remove(db, userId, companyId);
	return c.json(success(result));
});

export { app as companyRoutes };
