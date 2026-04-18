import { describe, it, expect, beforeAll } from "vitest";
import { SELF, env } from "cloudflare:test";

// ---------------------------------------------------------------------------
// Test auth helper: use better-auth sign-up + sign-in to get a real session
// ---------------------------------------------------------------------------

async function signUpAndGetCookie(
	name: string,
	email: string,
	password: string,
): Promise<string> {
	// 1. Sign up
	await SELF.fetch("http://localhost/api/auth/sign-up/email", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, password }),
	});

	// 2. Verify email directly in DB
	await env.DB.prepare(
		"UPDATE `user` SET `email_verified` = 1 WHERE `email` = ?",
	)
		.bind(email)
		.run();

	// 3. Sign in to get session cookie
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

function headersA(): Record<string, string> {
	return { "Content-Type": "application/json", Cookie: cookieA };
}

function headersB(): Record<string, string> {
	return { "Content-Type": "application/json", Cookie: cookieB };
}

// Helper to create an application via API
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

// ---------------------------------------------------------------------------
// Setup: create test users via better-auth before all tests
// ---------------------------------------------------------------------------

beforeAll(async () => {
	cookieA = await signUpAndGetCookie(
		"Slug User A",
		"slug-usera@test.com",
		"password-A-123",
	);
	cookieB = await signUpAndGetCookie(
		"Slug User B",
		"slug-userb@test.com",
		"password-B-123",
	);
});

// ---------------------------------------------------------------------------
// GET /api/application-by-slug/:slug -- VIEW-04: Slug lookup
// ---------------------------------------------------------------------------

describe("GET /api/application-by-slug/:slug", () => {
	it("returns application with timeline when slug exists", async () => {
		const { body: created } = await createApp({
			companyName: "SlugTestCo",
			roleTitle: "Engineer",
		});

		const slug = created.data.slug;
		expect(slug).toBe("slugtestco-engineer");

		const res = await SELF.fetch(
			`http://localhost/api/application-by-slug/${slug}`,
			{ headers: headersA() },
		);
		expect(res.status).toBe(200);

		const body = (await res.json()) as any;
		expect(body.data.id).toBe(created.data.id);
		expect(body.data.companyName).toBe("SlugTestCo");
		expect(body.data.roleTitle).toBe("Engineer");
		expect(body.data.slug).toBe(slug);
		expect(Array.isArray(body.data.timeline)).toBe(true);
		expect(body.data.timeline.length).toBeGreaterThanOrEqual(1);
		expect(body.data.timeline[0].eventType).toBe("created");
	});

	it("returns 404 for non-existent slug", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/application-by-slug/nonexistent-slug-xyz",
			{ headers: headersA() },
		);
		expect(res.status).toBe(404);
	});

	it("returns 404 when user B tries to access user A's application by slug (tenant isolation)", async () => {
		const { body: created } = await createApp({
			companyName: "TenantIsolationCo",
			roleTitle: "Secret Role",
		});

		const slug = created.data.slug;

		// User B should NOT be able to access user A's application
		const res = await SELF.fetch(
			`http://localhost/api/application-by-slug/${slug}`,
			{ headers: headersB() },
		);
		expect(res.status).toBe(404);
	});
});
