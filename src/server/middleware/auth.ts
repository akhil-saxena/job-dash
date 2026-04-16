import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../../shared/types";
import { createAuth } from "../lib/auth";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	c.set("userId", session.user.id);
	c.set("session", session as any);
	await next();
});
