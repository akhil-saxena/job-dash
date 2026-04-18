import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "@/shared/types";
import { createDb } from "@/server/lib/db";
import { success, apiError } from "@/server/lib/response";
import { AppError } from "@/server/lib/errors";
import * as interviewService from "@/server/services/interview";
import {
	createInterviewRoundSchema,
	updateInterviewRoundSchema,
	createQASchema,
	updateQASchema,
} from "@/shared/validators/interview";

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
// POST /api/applications/:appId/interviews -- Create round (INTV-01)
// ---------------------------------------------------------------------------

app.post(
	"/api/applications/:appId/interviews",
	zValidator("json", createInterviewRoundSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const appId = c.req.param("appId");
		const input = c.req.valid("json");
		const result = await interviewService.createRound(db, userId, appId, input);
		return c.json(success(result), 201);
	},
);

// ---------------------------------------------------------------------------
// GET /api/applications/:appId/interviews -- List rounds with QA (INTV-02)
// ---------------------------------------------------------------------------

app.get("/api/applications/:appId/interviews", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const appId = c.req.param("appId");
	const result = await interviewService.listRounds(db, userId, appId);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// GET /api/applications/:appId/interview-count -- Lightweight count (INTV-02)
// ---------------------------------------------------------------------------

app.get("/api/applications/:appId/interview-count", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const appId = c.req.param("appId");
	const result = await interviewService.countRounds(db, userId, appId);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// PATCH /api/interviews/:roundId -- Update round (INTV-03, INTV-04)
// ---------------------------------------------------------------------------

app.patch(
	"/api/interviews/:roundId",
	zValidator("json", updateInterviewRoundSchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const roundId = c.req.param("roundId");
		const input = c.req.valid("json");
		const result = await interviewService.updateRound(db, userId, roundId, input);
		return c.json(success(result));
	},
);

// ---------------------------------------------------------------------------
// DELETE /api/interviews/:roundId -- Delete round (INTV-03)
// ---------------------------------------------------------------------------

app.delete("/api/interviews/:roundId", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const roundId = c.req.param("roundId");
	const result = await interviewService.deleteRound(db, userId, roundId);
	return c.json(success(result));
});

// ---------------------------------------------------------------------------
// POST /api/interviews/:roundId/qa -- Create QA pair (NOTE-01)
// ---------------------------------------------------------------------------

app.post(
	"/api/interviews/:roundId/qa",
	zValidator("json", createQASchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const roundId = c.req.param("roundId");
		const input = c.req.valid("json");
		const result = await interviewService.createQA(db, userId, roundId, input);
		return c.json(success(result), 201);
	},
);

// ---------------------------------------------------------------------------
// PATCH /api/interview-qa/:qaId -- Update QA pair (NOTE-01)
// ---------------------------------------------------------------------------

app.patch(
	"/api/interview-qa/:qaId",
	zValidator("json", updateQASchema),
	async (c) => {
		const userId = c.get("userId");
		const db = createDb(c.env.DB);
		const qaId = c.req.param("qaId");
		const input = c.req.valid("json");
		const result = await interviewService.updateQA(db, userId, qaId, input);
		return c.json(success(result));
	},
);

// ---------------------------------------------------------------------------
// DELETE /api/interview-qa/:qaId -- Delete QA pair (NOTE-01)
// ---------------------------------------------------------------------------

app.delete("/api/interview-qa/:qaId", async (c) => {
	const userId = c.get("userId");
	const db = createDb(c.env.DB);
	const qaId = c.req.param("qaId");
	const result = await interviewService.deleteQA(db, userId, qaId);
	return c.json(success(result));
});

export { app as interviewRoutes };
