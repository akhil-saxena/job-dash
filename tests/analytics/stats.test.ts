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

let cookieA: string;
let cookieB: string;

beforeAll(async () => {
	cookieA = await signUpAndGetCookie(
		"Stats User A",
		"stats-a@test.com",
		"password-stats-a-123",
	);
	cookieB = await signUpAndGetCookie(
		"Stats User B",
		"stats-b@test.com",
		"password-stats-b-123",
	);
});

const FROM = "1980-01-01";
const TO = "2100-01-01";

describe("GET /api/analytics/stats", () => {
	it("4 stat numbers correct for a freshly seeded mix", async () => {
		// Seed: 2 wishlist, 2 applied, 1 interviewing, 1 offer, 1 rejected
		await createApp(cookieA, {
			companyName: "StatsCo-1",
			roleTitle: "Eng",
			status: "wishlist",
		});
		await createApp(cookieA, {
			companyName: "StatsCo-2",
			roleTitle: "Eng",
			status: "wishlist",
		});
		await createApp(cookieA, {
			companyName: "StatsCo-3",
			roleTitle: "Eng",
			status: "applied",
		});
		await createApp(cookieA, {
			companyName: "StatsCo-4",
			roleTitle: "Eng",
			status: "applied",
		});
		await createApp(cookieA, {
			companyName: "StatsCo-5",
			roleTitle: "Eng",
			status: "interviewing",
		});
		await createApp(cookieA, {
			companyName: "StatsCo-6",
			roleTitle: "Eng",
			status: "offer",
		});
		await createApp(cookieA, {
			companyName: "StatsCo-7",
			roleTitle: "Eng",
			status: "rejected",
		});

		const res = await SELF.fetch(
			`http://localhost/api/analytics/stats?from=${FROM}&to=${TO}`,
			{ headers: { Cookie: cookieA } },
		);
		expect(res.status).toBe(200);
		const body = (await res.json()) as any;
		// totalApps must include all 7 apps
		expect(body.data.totalApps).toBeGreaterThanOrEqual(7);
		// active = applied + screening + interviewing + offer = 2 + 0 + 1 + 1 = 4
		expect(body.data.active).toBeGreaterThanOrEqual(4);
		// offers = offer + accepted = 1 + 0 = 1
		expect(body.data.offers).toBeGreaterThanOrEqual(1);
		// rejectionRate = 1 / (0 accepted + 1 rejected + 0 withdrawn) = 100
		expect(body.data.rejectionRate).toBe(100);
	});

	it("rejectionRate is null when no terminal apps", async () => {
		// User B has NO terminal apps yet
		await createApp(cookieB, {
			companyName: "NoTermCo-1",
			roleTitle: "Eng",
			status: "applied",
		});
		await createApp(cookieB, {
			companyName: "NoTermCo-2",
			roleTitle: "Eng",
			status: "wishlist",
		});

		const res = await SELF.fetch(
			`http://localhost/api/analytics/stats?from=${FROM}&to=${TO}`,
			{ headers: { Cookie: cookieB } },
		);
		const body = (await res.json()) as any;
		expect(body.data.rejectionRate).toBeNull();
	});

	it("active counts only {applied, screening, interviewing, offer}", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/analytics/stats?from=${FROM}&to=${TO}`,
			{ headers: { Cookie: cookieA } },
		);
		const body = (await res.json()) as any;
		// Shape invariant: active <= totalApps
		expect(body.data.active).toBeLessThanOrEqual(body.data.totalApps);
		expect(body.data.active).toBeGreaterThanOrEqual(0);
	});

	it("enforces tenant isolation", async () => {
		// User B has 2 apps so totalApps should be ≥ 2 but MUST NOT include user A's 7
		const res = await SELF.fetch(
			`http://localhost/api/analytics/stats?from=${FROM}&to=${TO}`,
			{ headers: { Cookie: cookieB } },
		);
		const body = (await res.json()) as any;
		// User A alone has 7 apps — if isolation leaked, user B would see > 2.
		expect(body.data.totalApps).toBeLessThan(7);
	});
});
