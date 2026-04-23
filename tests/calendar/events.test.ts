import { describe, it, expect, beforeAll } from "vitest";
import { SELF, env } from "cloudflare:test";
import { nanoid } from "nanoid";

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
let userAId: string;
let userBId: string;
let appAId: string;
let appASlug: string;
let appBId: string;

function headersA(): Record<string, string> {
	return { "Content-Type": "application/json", Cookie: cookieA };
}

function headersB(): Record<string, string> {
	return { "Content-Type": "application/json", Cookie: cookieB };
}

async function createApp(
	body: Record<string, unknown>,
	headers: Record<string, string> = headersA(),
): Promise<any> {
	const res = await SELF.fetch("http://localhost/api/applications", {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	});
	return (await res.json()) as any;
}

// Unix-epoch seconds for a given UTC date (matches D1 integer "timestamp" mode).
function unix(y: number, m0: number, d: number, h = 12): number {
	return Math.floor(Date.UTC(y, m0, d, h, 0, 0) / 1000);
}

async function insertInterview(
	applicationId: string,
	userId: string,
	scheduledAtUnix: number,
	roundType = "technical",
): Promise<string> {
	const id = nanoid();
	await env.DB.prepare(
		`INSERT INTO interview_round
		 (id, application_id, user_id, round_type, scheduled_at, status, sort_order, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, 'scheduled', 0, unixepoch(), unixepoch())`,
	)
		.bind(id, applicationId, userId, roundType, scheduledAtUnix)
		.run();
	return id;
}

async function insertDeadline(
	applicationId: string,
	userId: string,
	dueDateUnix: number,
	deadlineType = "application_close",
): Promise<string> {
	const id = nanoid();
	await env.DB.prepare(
		`INSERT INTO deadline
		 (id, application_id, user_id, deadline_type, label, due_date, is_completed, created_at, updated_at)
		 VALUES (?, ?, ?, ?, NULL, ?, 0, unixepoch(), unixepoch())`,
	)
		.bind(id, applicationId, userId, deadlineType, dueDateUnix)
		.run();
	return id;
}

// April 2026 grid window:
//   startOfWeek(startOfMonth(April 2026 UTC)) = Sun Mar 29, 2026 00:00 UTC
//   gridEnd = Sun May 10, 2026 00:00 UTC (exclusive)
const APR_IN_RANGE = unix(2026, 3, 15); // April 15, 2026 — in window
const APR_EARLY_OUT = unix(2026, 2, 1); // March 1, 2026 — before window
const APR_LATE_OUT = unix(2026, 5, 15); // June 15, 2026 — after window

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

	userAId = (
		await env.DB.prepare("SELECT id FROM `user` WHERE `email` = ?")
			.bind("usera-calendar@test.com")
			.first<{ id: string }>()
	)!.id;
	userBId = (
		await env.DB.prepare("SELECT id FROM `user` WHERE `email` = ?")
			.bind("userb-calendar@test.com")
			.first<{ id: string }>()
	)!.id;

	// User A's application: used for shape, range, soft-delete, inline-fields
	const appA = await createApp({
		companyName: "CalCorp",
		roleTitle: "Staff Engineer",
	});
	appAId = appA.data.id;
	appASlug = appA.data.slug;

	// User B's application — used for tenant isolation
	const appB = await createApp(
		{ companyName: "SecretCo", roleTitle: "PM" },
		headersB(),
	);
	appBId = appB.data.id;

	// Seed events for user A
	// In-range
	await insertInterview(appAId, userAId, APR_IN_RANGE, "technical");
	await insertDeadline(appAId, userAId, APR_IN_RANGE, "application_close");
	// Out-of-range (before)
	await insertInterview(appAId, userAId, APR_EARLY_OUT, "phone_screen");
	await insertDeadline(appAId, userAId, APR_EARLY_OUT, "follow_up");
	// Out-of-range (after)
	await insertInterview(appAId, userAId, APR_LATE_OUT, "behavioral");
	await insertDeadline(appAId, userAId, APR_LATE_OUT, "offer_expiry");

	// Seed events for user B (same April 2026 in-range date) — tenant isolation
	await insertInterview(appBId, userBId, APR_IN_RANGE, "technical");
	await insertDeadline(appBId, userBId, APR_IN_RANGE, "application_close");
});

// ---------------------------------------------------------------------------
// GET /api/calendar/events — VIEW-03 integration tests
// ---------------------------------------------------------------------------

describe("GET /api/calendar/events", () => {
	it("returns { data: { interviews: [...], deadlines: [...] } } shape for a valid month", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/calendar/events?month=2026-04",
			{ headers: headersA() },
		);
		expect(res.status).toBe(200);
		const body = (await res.json()) as any;
		expect(body.data).toBeDefined();
		expect(Array.isArray(body.data.interviews)).toBe(true);
		expect(Array.isArray(body.data.deadlines)).toBe(true);
	});

	it("returns only events whose scheduledAt/dueDate falls within startOfWeek(startOfMonth) + 42 days range", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/calendar/events?month=2026-04",
			{ headers: headersA() },
		);
		const body = (await res.json()) as any;

		// User A has exactly one in-range interview and one in-range deadline
		// (out-of-range events were seeded in March and June).
		expect(body.data.interviews).toHaveLength(1);
		expect(body.data.deadlines).toHaveLength(1);
	});

	it("enforces tenant isolation — user A cannot see user B's events", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/calendar/events?month=2026-04",
			{ headers: headersA() },
		);
		const body = (await res.json()) as any;
		for (const iv of body.data.interviews) {
			expect(iv.applicationId).toBe(appAId);
		}
		for (const d of body.data.deadlines) {
			expect(d.applicationId).toBe(appAId);
		}
	});

	it("excludes events whose application.deletedAt IS NOT NULL", async () => {
		// Create a throwaway application + event, then soft-delete the app.
		const throwaway = await createApp({
			companyName: "SoftDeletedCo",
			roleTitle: "Ghost",
		});
		const throwAppId = throwaway.data.id;
		await insertInterview(throwAppId, userAId, APR_IN_RANGE, "panel");

		// Sanity: before delete, calendar should show 2 interviews.
		const before = await SELF.fetch(
			"http://localhost/api/calendar/events?month=2026-04",
			{ headers: headersA() },
		);
		const bodyBefore = (await before.json()) as any;
		expect(bodyBefore.data.interviews.length).toBeGreaterThanOrEqual(2);

		// Soft-delete the application
		await SELF.fetch(`http://localhost/api/applications/${throwAppId}`, {
			method: "DELETE",
			headers: headersA(),
		});

		// After delete, the soft-deleted app's interview must NOT appear.
		const after = await SELF.fetch(
			"http://localhost/api/calendar/events?month=2026-04",
			{ headers: headersA() },
		);
		const bodyAfter = (await after.json()) as any;
		for (const iv of bodyAfter.data.interviews) {
			expect(iv.applicationId).not.toBe(throwAppId);
		}
	});

	it("returns applicationSlug, companyName, roleTitle inline on each event (single round-trip)", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/calendar/events?month=2026-04",
			{ headers: headersA() },
		);
		const body = (await res.json()) as any;
		for (const iv of body.data.interviews) {
			expect(iv.applicationSlug).toBeTruthy();
			expect(iv.companyName).toBeTruthy();
			expect(iv.roleTitle).toBeTruthy();
		}
		for (const d of body.data.deadlines) {
			expect(d.applicationSlug).toBeTruthy();
			expect(d.companyName).toBeTruthy();
			expect(d.roleTitle).toBeTruthy();
		}
		// Spot check: first user-A interview should point at the seeded app.
		const first = body.data.interviews.find(
			(x: any) => x.applicationId === appAId,
		);
		expect(first?.applicationSlug).toBe(appASlug);
		expect(first?.companyName).toBe("CalCorp");
		expect(first?.roleTitle).toBe("Staff Engineer");
	});

	it("rejects malformed month param (e.g. '2026-13', 'April', missing) with 400", async () => {
		for (const bad of ["2026-13", "April", "2026-00", "26-04", ""]) {
			const q = bad === "" ? "" : `?month=${encodeURIComponent(bad)}`;
			const res = await SELF.fetch(
				`http://localhost/api/calendar/events${q}`,
				{ headers: headersA() },
			);
			expect(res.status).toBe(400);
		}
	});
});
