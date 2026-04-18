import { Hono } from "hono";
import type { AppEnv } from "../src/shared/types";
import { authRoutes } from "../src/server/routes/auth";
import { applicationRoutes } from "../src/server/routes/applications";
import { interviewRoutes } from "../src/server/routes/interviews";
import { tagRoutes } from "../src/server/routes/tags";
import { deadlineRoutes } from "../src/server/routes/deadlines";
import { companyRoutes } from "../src/server/routes/companies";
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

// Interview routes (protected by middleware above)
app.route("/", interviewRoutes);

// Tag routes (protected by middleware above)
app.route("/", tagRoutes);

// Deadline routes (protected by middleware above)
app.route("/", deadlineRoutes);

// Company routes (protected by middleware above)
app.route("/", companyRoutes);

export default app;
