import { describe, it, expect, beforeAll } from "vitest";
import { SELF, env } from "cloudflare:test";

describe("GET /api/analytics/response-times", () => {
	it.todo("LAG() window function averages per adjacent transition");
	it.todo("skipped stages (applied → interviewing directly) contribute 0 samples to skipped adjacent rows");
	it.todo("zero samples returned as omitted/null");
	it.todo("enforces tenant isolation");
});

beforeAll(async () => {
	// no-op; setup happens per-test in Task 2
});

it.skip("stub import guard", () => {
	expect(SELF).toBeDefined();
	expect(env).toBeDefined();
});
