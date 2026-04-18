import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "@/shared/types";
import { createDb } from "@/server/lib/db";
import { success, apiError } from "@/server/lib/response";
import { AppError } from "@/server/lib/errors";
import * as documentService from "@/server/services/document";
import { createDocumentSchema } from "@/shared/validators/document";

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
// POST /api/applications/:appId/documents -- Create document metadata (DOC-01)
// ---------------------------------------------------------------------------

app.post(
	"/api/applications/:appId/documents",
	zValidator("json", createDocumentSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const appId = c.req.param("appId");
		const input = c.req.valid("json");
		const result = await documentService.createDocument(db, userId, appId, input);
		return c.json(success(result), 201);
	},
);

// ---------------------------------------------------------------------------
// GET /api/applications/:appId/documents -- List documents (DOC-02)
// ---------------------------------------------------------------------------

app.get("/api/applications/:appId/documents", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const appId = c.req.param("appId");
	const result = await documentService.listDocuments(db, userId, appId);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// GET /api/applications/:appId/document-count -- Lightweight count (DOC-02)
// ---------------------------------------------------------------------------

app.get("/api/applications/:appId/document-count", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const appId = c.req.param("appId");
	const result = await documentService.countDocuments(db, userId, appId);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// DELETE /api/documents/:docId -- Delete document metadata (DOC-03)
// ---------------------------------------------------------------------------

app.delete("/api/documents/:docId", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const docId = c.req.param("docId");
	const result = await documentService.deleteDocument(db, userId, docId);
	// Note: Caller should also delete from R2 using result.r2Key
	return c.json(success(result));
});

export { app as documentRoutes };
