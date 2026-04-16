import { Hono } from "hono";
import type { AppEnv } from "../src/shared/types";
import { authRoutes } from "../src/server/routes/auth";
import { applicationRoutes } from "../src/server/routes/applications";
import { requireAuth } from "../src/server/middleware/auth";

const app = new Hono<AppEnv>();

// Health check (public)
app.get("/api/health", (c) => {
	return c.json({ ok: true, timestamp: Date.now() });
});

// Auth routes (public -- better-auth handles internally)
app.route("/", authRoutes);

// Protected routes -- all other /api/* routes require auth
app.use("/api/*", requireAuth);

// Application routes (protected by middleware above)
app.route("/", applicationRoutes);

export default app;
