import { Hono } from "hono";
import type { AppEnv } from "../../shared/types";
import { createAuth } from "../lib/auth";

const authRoutes = new Hono<AppEnv>();

authRoutes.on(["GET", "POST"], "/api/auth/**", (c) => {
	const auth = createAuth(c.env);
	return auth.handler(c.req.raw);
});

export { authRoutes };
