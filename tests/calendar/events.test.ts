import { describe, it, expect, beforeAll } from "vitest";
import { SELF, env } from "cloudflare:test";

// ---------------------------------------------------------------------------
// Test auth helper — better-auth sign-up + sign-in to get a real session
// ---------------------------------------------------------------------------

async function signUpAndGetCookie(
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

	const cookies = loginRes.headers.get("set-cookie") || "";
	return cookies;
}

let cookieA: string;
let cookieB: string;
let _userAId: string;

function headersA(): Record<string, string> {
	return { "Content-Type": "application/json", Cookie: cookieA };
}

function headersB(): Record<string, string> {
	return { "Content-Type": "application/json", Cookie: cookieB };
}

async function createApp(
	body: Record<string, unknown>,
	headers: Record<string, string> = headersA(),
): Promise<{ status: number; body: any }> {
	const res = await SELF.fetch("http://localhost/api/applications", {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	});
	return { status: res.status, body: await res.json() };
}

beforeAll(async () => {
	cookieA = await signUpAndGetCookie(
		"Calendar User A",
		"usera-calendar@test.com",
		"password-A-123",
	);
	cookieB = await signUpAndGetCookie(
		"Calendar User B",
		"userb-calendar@test.com",
		"password-B-123",
	);

	const userRow = await env.DB.prepare(
		"SELECT id FROM `user` WHERE `email` = ?",
	)
		.bind("usera-calendar@test.com")
		.first<{ id: string }>();
	_userAId = userRow!.id;
});

// ---------------------------------------------------------------------------
// GET /api/calendar/events — VIEW-03 stub tests (Wave 0)
// ---------------------------------------------------------------------------

describe("GET /api/calendar/events", () => {
	// Test 6: response shape
	it.todo(
		"returns { data: { interviews: [...], deadlines: [...] } } shape for a valid month",
	);

	// Test 7: range filter
	it.todo(
		"returns only events whose scheduledAt/dueDate falls within startOfWeek(startOfMonth) + 42 days range",
	);

	// Test 8: tenant isolation
	it.todo("enforces tenant isolation — user A cannot see user B's events");

	// Test 9: soft-delete exclusion
	it.todo("excludes events whose application.deletedAt IS NOT NULL");

	// Test 10: inline denormalisation
	it.todo(
		"returns applicationSlug, companyName, roleTitle inline on each event (single round-trip)",
	);

	// Test 11: validation
	it.todo(
		"rejects malformed month param (e.g. '2026-13', 'April', missing) with 400",
	);
});

// Silence unused-var linting until Wave 1 fills in assertions
void headersA;
void headersB;
void createApp;
