import { describe, it, expect, beforeAll } from "vitest";
import { SELF, env } from "cloudflare:test";

describe("GET /api/analytics/sources", () => {
	it.todo("groups case-insensitively by LOWER(source)");
	it.todo("returns top 8 sources by volume");
	it.todo("ghosted derivation correct (no status_change, no interview_round, stale)");
	it.todo("outcomes (offer + interviewing + rejected + ghosted + withdrawn) sum to total");
	it.todo("enforces tenant isolation");
});

beforeAll(async () => {
	// no-op; setup happens per-test in Task 2
});

it.skip("stub import guard", () => {
	expect(SELF).toBeDefined();
	expect(env).toBeDefined();
});
