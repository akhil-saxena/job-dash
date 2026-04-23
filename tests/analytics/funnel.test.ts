import { describe, it, expect, beforeAll } from "vitest";
import { SELF, env } from "cloudflare:test";

// Reused helper: sign up + verify email + sign in, returns session cookie
export async function signUpAndGetCookie(
	name: string,
	email: string,
	password: string,
): Promise<string> {
	await SELF.fetch("http://localhost/api/auth/sign-up/email", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, password }),
	});
	await env.DB.prepare(
		"UPDATE `user` SET `email_verified` = 1 WHERE `email` = ?",
	)
		.bind(email)
		.run();
	const loginRes = await SELF.fetch(
		"http://localhost/api/auth/sign-in/email",
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		},
	);
	return loginRes.headers.get("set-cookie") || "";
}

// Seed helper used across analytics test files — mirrors timeline_event.metadata shape
// produced by the real status-change path: JSON.stringify({ from, to })
export async function seedStatusChange(
	userId: string,
	appId: string,
	from: string,
	to: string,
	occurredAtMs: number,
) {
	await env.DB.prepare(
		"INSERT INTO timeline_event (id, application_id, user_id, event_type, description, metadata, occurred_at) VALUES (?, ?, ?, 'status_change', ?, ?, ?)",
	)
		.bind(
			`te-${Date.now()}-${Math.random().toString(36).slice(2)}`,
			appId,
			userId,
			`changed status from ${from} to ${to}`,
			JSON.stringify({ from, to }),
			Math.floor(occurredAtMs / 1000),
		)
		.run();
}

// Suite scaffold — real assertions land in Task 2 (Wave 1)
describe("GET /api/analytics/funnel", () => {
	it.todo("returns correct counts per stage from timeline_event");
	it.todo("respects date-range filter (from/to)");
	it.todo("excludes soft-deleted apps (timeline events orphaned)");
	it.todo("enforces tenant isolation");
	it.todo("conversion percentages computed against previous stage");
});

// Placeholder to ensure beforeAll runs at least one await (vitest optimization)
beforeAll(async () => {
	// no-op; setup happens per-test in Task 2
});

// Keep `expect` import used so tsc doesn't complain in the stub state
// (trivial truthy assertion, will be removed or re-homed in Task 2)
it.skip("stub import guard", () => {
	expect(true).toBe(true);
});
