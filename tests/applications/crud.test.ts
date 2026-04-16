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
let userAId: string;

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
		"User A",
		"usera-crud@test.com",
		"password-A-123",
	);
	cookieB = await signUpAndGetCookie(
		"User B",
		"userb-crud@test.com",
		"password-B-123",
	);

	// Get user A's ID for assertions
	const userRow = await env.DB.prepare(
		"SELECT id FROM `user` WHERE `email` = ?",
	)
		.bind("usera-crud@test.com")
		.first<{ id: string }>();
	userAId = userRow!.id;
});

// ---------------------------------------------------------------------------
// POST /api/applications -- TRACK-01: Create
// ---------------------------------------------------------------------------

describe("POST /api/applications", () => {
	it("creates application with required fields", async () => {
		const { status, body } = await createApp({
			companyName: "Google",
			roleTitle: "Senior SDE",
		});

		expect(status).toBe(201);
		expect(body.data).toBeDefined();
		expect(body.data.id).toBeDefined();
		expect(body.data.slug).toBe("google-senior-sde");
		expect(body.data.status).toBe("wishlist");
		expect(body.data.isPinned).toBe(false);
		expect(body.data.isArchived).toBe(false);
		expect(body.data.companyName).toBe("Google");
		expect(body.data.roleTitle).toBe("Senior SDE");
	});

	it("creates application with all optional fields", async () => {
		const { status, body } = await createApp({
			companyName: "Meta",
			roleTitle: "Staff Engineer",
			jobPostingUrl: "https://meta.com/jobs/123",
			locationType: "hybrid",
			locationCity: "Menlo Park",
			salaryMin: 200000,
			salaryMax: 350000,
			salaryCurrency: "USD",
			source: "referral",
			priority: "high",
			notes: "Great opportunity",
			appliedAt: "2026-04-01T00:00:00.000Z",
		});

		expect(status).toBe(201);
		expect(body.data.companyName).toBe("Meta");
		expect(body.data.roleTitle).toBe("Staff Engineer");
		expect(body.data.jobPostingUrl).toBe("https://meta.com/jobs/123");
		expect(body.data.locationType).toBe("hybrid");
		expect(body.data.locationCity).toBe("Menlo Park");
		expect(body.data.salaryMin).toBe(200000);
		expect(body.data.salaryMax).toBe(350000);
		expect(body.data.salaryCurrency).toBe("USD");
		expect(body.data.source).toBe("referral");
		expect(body.data.priority).toBe("high");
		expect(body.data.notes).toBe("Great opportunity");
		expect(body.data.appliedAt).toBeTruthy();
	});

	it("generates unique slug on collision", async () => {
		// First app with this company+role
		const { body: first } = await createApp({
			companyName: "Amazon",
			roleTitle: "SDE II",
		});
		expect(first.data.slug).toBe("amazon-sde-ii");

		// Second app with same company+role -- slug should get suffix
		const { body: second } = await createApp({
			companyName: "Amazon",
			roleTitle: "SDE II",
		});
		expect(second.data.slug).toBe("amazon-sde-ii-2");
	});

	it("rejects missing required fields", async () => {
		const res = await SELF.fetch("http://localhost/api/applications", {
			method: "POST",
			headers: headersA(),
			body: JSON.stringify({}),
		});
		expect(res.status).toBe(400);
	});

	it("rejects invalid status value", async () => {
		const { status } = await createApp({
			companyName: "X Corp",
			roleTitle: "Engineer",
			status: "invalid",
		});
		expect(status).toBe(400);
	});

	it("auto-generates created timeline event", async () => {
		const { body: created } = await createApp({
			companyName: "Apple",
			roleTitle: "iOS Engineer",
		});

		const timelineRes = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/timeline`,
			{ headers: headersA() },
		);
		const timeline = (await timelineRes.json()) as any;
		expect(timeline.data).toHaveLength(1);
		expect(timeline.data[0].eventType).toBe("created");
	});
});

// ---------------------------------------------------------------------------
// GET /api/applications -- List with filtering/search/pagination
// ---------------------------------------------------------------------------

describe("GET /api/applications", () => {
	it("returns paginated list", async () => {
		const res = await SELF.fetch("http://localhost/api/applications", {
			headers: headersA(),
		});
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(Array.isArray(body.data)).toBe(true);
		expect(body.pagination).toBeDefined();
		expect(body.pagination.total).toBeGreaterThanOrEqual(1);
	});

	it("filters by status", async () => {
		await createApp({
			companyName: "FilterCo",
			roleTitle: "PM",
			status: "applied",
		});

		const res = await SELF.fetch(
			"http://localhost/api/applications?status=applied",
			{ headers: headersA() },
		);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		for (const app of body.data) {
			expect(app.status).toBe("applied");
		}
	});

	it("filters by priority", async () => {
		await createApp({
			companyName: "PriorityCo",
			roleTitle: "Eng",
			priority: "high",
		});

		const res = await SELF.fetch(
			"http://localhost/api/applications?priority=high",
			{ headers: headersA() },
		);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		for (const app of body.data) {
			expect(app.priority).toBe("high");
		}
	});

	it("searches by company name", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/applications?search=Google",
			{ headers: headersA() },
		);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.data.length).toBeGreaterThanOrEqual(1);
		for (const app of body.data) {
			const matchesCompany = app.companyName
				.toLowerCase()
				.includes("google");
			const matchesRole = app.roleTitle.toLowerCase().includes("google");
			expect(matchesCompany || matchesRole).toBe(true);
		}
	});

	it("searches by role title", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/applications?search=Senior",
			{ headers: headersA() },
		);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.data.length).toBeGreaterThanOrEqual(1);
	});

	it("paginates correctly", async () => {
		// Create additional apps to ensure enough for pagination
		await createApp({ companyName: "Paginate1", roleTitle: "Eng" });
		await createApp({ companyName: "Paginate2", roleTitle: "Eng" });

		const res = await SELF.fetch(
			"http://localhost/api/applications?page=1&limit=2",
			{ headers: headersA() },
		);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.data).toHaveLength(2);
		expect(body.pagination.limit).toBe(2);
		expect(body.pagination.page).toBe(1);
		expect(body.pagination.total).toBeGreaterThanOrEqual(5);
		expect(body.pagination.totalPages).toBeGreaterThanOrEqual(3);
	});

	it("excludes soft-deleted by default", async () => {
		const { body: created } = await createApp({
			companyName: "SoftDeletedCo",
			roleTitle: "Ghost",
		});

		// Soft-delete it
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{ method: "DELETE", headers: headersA() },
		);

		// List should not include the deleted app
		const res = await SELF.fetch("http://localhost/api/applications", {
			headers: headersA(),
		});
		const body = (await res.json()) as any;
		const found = body.data.find(
			(a: any) => a.id === created.data.id,
		);
		expect(found).toBeUndefined();
	});

	it("excludes archived by default", async () => {
		const { body: created } = await createApp({
			companyName: "ArchivedCo",
			roleTitle: "Hidden",
		});

		// Archive it
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/archive`,
			{ method: "PATCH", headers: headersA() },
		);

		// Default list should not include the archived app
		const res = await SELF.fetch("http://localhost/api/applications", {
			headers: headersA(),
		});
		const body = (await res.json()) as any;
		const found = body.data.find(
			(a: any) => a.id === created.data.id,
		);
		expect(found).toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
// GET /api/applications/:id -- Get by ID
// ---------------------------------------------------------------------------

describe("GET /api/applications/:id", () => {
	it("returns application with timeline", async () => {
		const { body: created } = await createApp({
			companyName: "GetByIdCo",
			roleTitle: "Dev",
		});

		const res = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{ headers: headersA() },
		);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.data.id).toBe(created.data.id);
		expect(body.data.companyName).toBe("GetByIdCo");
		expect(Array.isArray(body.data.timeline)).toBe(true);
	});

	it("returns 404 for non-existent id", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/applications/nonexistent-id-12345",
			{ headers: headersA() },
		);
		expect(res.status).toBe(404);
	});
});

// ---------------------------------------------------------------------------
// PATCH /api/applications/:id -- Update (TRACK-02)
// ---------------------------------------------------------------------------

describe("PATCH /api/applications/:id", () => {
	it("updates single field", async () => {
		const { body: created } = await createApp({
			companyName: "UpdateCo",
			roleTitle: "Eng",
		});

		const res = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({ companyName: "Meta" }),
			},
		);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.data.companyName).toBe("Meta");
		expect(body.data.roleTitle).toBe("Eng"); // unchanged
	});

	it("updates multiple fields", async () => {
		const { body: created } = await createApp({
			companyName: "MultiUpdateCo",
			roleTitle: "Eng",
		});

		const res = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({
					companyName: "Updated Corp",
					priority: "high",
				}),
			},
		);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.data.companyName).toBe("Updated Corp");
		expect(body.data.priority).toBe("high");
	});

	it("returns 404 for non-existent id", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/applications/nonexistent-update-id",
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({ companyName: "Nowhere" }),
			},
		);
		expect(res.status).toBe(404);
	});
});

// ---------------------------------------------------------------------------
// Tenant isolation -- D-16
// ---------------------------------------------------------------------------

describe("tenant isolation", () => {
	let userBAppId: string;

	beforeAll(async () => {
		// Create an application for User B
		const { body } = await createApp(
			{ companyName: "UserBCo", roleTitle: "Secret Role" },
			headersB(),
		);
		userBAppId = body.data.id;
	});

	it("user A cannot read user B's application", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${userBAppId}`,
			{ headers: headersA() },
		);
		expect(res.status).toBe(404);
	});

	it("user A cannot update user B's application", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${userBAppId}`,
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({ companyName: "Hacked" }),
			},
		);
		expect(res.status).toBe(404);
	});

	it("user A list does not include user B's applications", async () => {
		const res = await SELF.fetch("http://localhost/api/applications", {
			headers: headersA(),
		});
		const body = (await res.json()) as any;
		const found = body.data.find((a: any) => a.id === userBAppId);
		expect(found).toBeUndefined();
	});
});
