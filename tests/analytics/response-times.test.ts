import { describe, it, expect, beforeAll } from "vitest";
import { SELF, env } from "cloudflare:test";

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
	return loginRes.headers.get("set-cookie") || "";
}

async function getUserId(email: string): Promise<string> {
	const row = await env.DB.prepare(
		"SELECT id FROM `user` WHERE `email` = ?",
	)
		.bind(email)
		.first<{ id: string }>();
	return row!.id;
}

async function createApp(
	cookie: string,
	body: Record<string, unknown>,
): Promise<{ id: string }> {
	const res = await SELF.fetch("http://localhost/api/applications", {
		method: "POST",
		headers: { "Content-Type": "application/json", Cookie: cookie },
		body: JSON.stringify(body),
	});
	const json = (await res.json()) as any;
	return { id: json.data.id };
}

async function seedStatusChange(
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

let cookieA: string;
let cookieB: string;
let userAId: string;
let userBId: string;

beforeAll(async () => {
	cookieA = await signUpAndGetCookie(
		"ResponseTime User A",
		"rt-a@test.com",
		"password-rt-a-123",
	);
	cookieB = await signUpAndGetCookie(
		"ResponseTime User B",
		"rt-b@test.com",
		"password-rt-b-123",
	);
	userAId = await getUserId("rt-a@test.com");
	userBId = await getUserId("rt-b@test.com");
});

describe("GET /api/analytics/response-times", () => {
	it("LAG() averages per adjacent transition", async () => {
		// Create one app that walks applied (t=0d) → screening (t=5d) → interviewing (t=12d)
		const app = await createApp(cookieA, {
			companyName: "RT-LAG-Co",
			roleTitle: "Eng",
		});
		const t0 = Date.UTC(2030, 0, 1);
		await seedStatusChange(userAId, app.id, "wishlist", "applied", t0);
		await seedStatusChange(
			userAId,
			app.id,
			"applied",
			"screening",
			t0 + 5 * 86400000,
		);
		await seedStatusChange(
			userAId,
			app.id,
			"screening",
			"interviewing",
			t0 + 12 * 86400000,
		);

		const res = await SELF.fetch(
			`http://localhost/api/analytics/response-times?from=2030-01-01&to=2030-03-01`,
			{ headers: { Cookie: cookieA } },
		);
		expect(res.status).toBe(200);
		const body = (await res.json()) as any;
		expect(body.data.applied_screening).toBeDefined();
		expect(body.data.applied_screening.avgDays).toBeCloseTo(5, 0);
		expect(body.data.screening_interviewing).toBeDefined();
		// (12 - 5) = 7 days
		expect(body.data.screening_interviewing.avgDays).toBeCloseTo(7, 0);
	});

	it("skipped stages contribute 0 samples to skipped rows", async () => {
		// App jumps applied → interviewing directly
		const app = await createApp(cookieA, {
			companyName: "RT-Skip-Co",
			roleTitle: "Eng",
		});
		const t0 = Date.UTC(2031, 0, 1);
		await seedStatusChange(userAId, app.id, "wishlist", "applied", t0);
		await seedStatusChange(
			userAId,
			app.id,
			"applied",
			"interviewing",
			t0 + 4 * 86400000,
		);

		const res = await SELF.fetch(
			`http://localhost/api/analytics/response-times?from=2031-01-01&to=2031-02-01`,
			{ headers: { Cookie: cookieA } },
		);
		const body = (await res.json()) as any;
		// applied→screening should NOT include this app (skipped) — zero samples
		// in this window specifically (no other apps seeded in this window for A)
		expect(body.data.applied_screening).toBeNull();
		expect(body.data.screening_interviewing).toBeNull();
		// applied→interviewing is NOT one of the 3 canonical transitions
		// (spec is applied→screening, screening→interviewing, interviewing→offer).
		// So this app contributes nothing.
		expect(body.data.interviewing_offer).toBeNull();
	});

	it("zero samples returned as null for absent transitions", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/analytics/response-times?from=2099-01-01&to=2099-01-31`,
			{ headers: { Cookie: cookieA } },
		);
		const body = (await res.json()) as any;
		expect(body.data.applied_screening).toBeNull();
		expect(body.data.screening_interviewing).toBeNull();
		expect(body.data.interviewing_offer).toBeNull();
	});

	it("enforces tenant isolation", async () => {
		const app = await createApp(cookieB, {
			companyName: "RT-Tenant-Co",
			roleTitle: "Secret",
		});
		const t0 = Date.UTC(2032, 0, 1);
		await seedStatusChange(userBId, app.id, "wishlist", "applied", t0);
		await seedStatusChange(
			userBId,
			app.id,
			"applied",
			"screening",
			t0 + 5 * 86400000,
		);

		const resA = await SELF.fetch(
			`http://localhost/api/analytics/response-times?from=2032-01-01&to=2032-02-01`,
			{ headers: { Cookie: cookieA } },
		);
		const bodyA = (await resA.json()) as any;
		// User A has no events in this window → all null
		expect(bodyA.data.applied_screening).toBeNull();

		const resB = await SELF.fetch(
			`http://localhost/api/analytics/response-times?from=2032-01-01&to=2032-02-01`,
			{ headers: { Cookie: cookieB } },
		);
		const bodyB = (await resB.json()) as any;
		expect(bodyB.data.applied_screening).not.toBeNull();
		expect(bodyB.data.applied_screening!.avgDays).toBeCloseTo(5, 0);
	});
});
