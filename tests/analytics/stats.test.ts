import { describe, it, expect, beforeAll } from "vitest";
import { SELF, env } from "cloudflare:test";

describe("GET /api/analytics/stats", () => {
	it.todo("4 stat numbers correct (totalApps, active, offers, rejectionRate)");
	it.todo("rejectionRate is null when no terminal apps (denominator 0)");
	it.todo("active = count of apps in {applied, screening, interviewing, offer}");
	it.todo("enforces tenant isolation");
});

beforeAll(async () => {
	// no-op; setup happens per-test in Task 2
});

it.skip("stub import guard", () => {
	expect(SELF).toBeDefined();
	expect(env).toBeDefined();
});
