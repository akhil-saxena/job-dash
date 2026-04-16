import { Hono } from "hono";

type Env = {
	Bindings: {
		DB: D1Database;
		BETTER_AUTH_URL: string;
		BETTER_AUTH_SECRET: string;
		GOOGLE_CLIENT_ID: string;
		GOOGLE_CLIENT_SECRET: string;
		RESEND_API_KEY: string;
	};
};

const app = new Hono<Env>();

app.get("/api/health", (c) => {
	return c.json({ ok: true, timestamp: Date.now() });
});

export default app;
