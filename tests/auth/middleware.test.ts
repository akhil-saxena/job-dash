import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";

describe("Auth middleware", () => {
	it("GET /api/health returns 200 without auth (public endpoint)", async () => {
		const response = await SELF.fetch("http://localhost/api/health");
		expect(response.status).toBe(200);
		const body = (await response.json()) as { ok: boolean };
		expect(body).toHaveProperty("ok", true);
	});

	it("GET /api/me returns 401 without session cookie", async () => {
		const response = await SELF.fetch("http://localhost/api/me");
		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: string };
		expect(body).toHaveProperty("error", "Unauthorized");
	});
});
