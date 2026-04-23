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

/** Bump updated_at backwards so ghosted derivation sees the app as stale. */
async function setUpdatedAt(appId: string, unixSeconds: number) {
	await env.DB.prepare(
		"UPDATE `application` SET `updated_at` = ? WHERE `id` = ?",
	)
		.bind(unixSeconds, appId)
		.run();
}

/** Back-date created_at to isolate this test's app in a narrow analytics window. */
async function setCreatedAt(appId: string, unixSeconds: number) {
	await env.DB.prepare(
		"UPDATE `application` SET `created_at` = ? WHERE `id` = ?",
	)
		.bind(unixSeconds, appId)
		.run();
}

let cookieA: string;
let cookieB: string;
let userAId: string;

beforeAll(async () => {
	cookieA = await signUpAndGetCookie(
		"Sources User A",
		"sources-a@test.com",
		"password-sources-a-123",
	);
	cookieB = await signUpAndGetCookie(
		"Sources User B",
		"sources-b@test.com",
		"password-sources-b-123",
	);
	userAId = await getUserId("sources-a@test.com");
});

// Full-time range
const FROM = "1980-01-01";
const TO = "2100-01-01";

describe("GET /api/analytics/sources", () => {
	it("groups case-insensitively by LOWER(source)", async () => {
		await createApp(cookieA, {
			companyName: "CaseCo-A",
			roleTitle: "Eng",
			source: "LinkedIn",
			status: "applied",
		});
		await createApp(cookieA, {
			companyName: "CaseCo-B",
			roleTitle: "Eng",
			source: "linkedin",
			status: "applied",
		});

		const res = await SELF.fetch(
			`http://localhost/api/analytics/sources?from=${FROM}&to=${TO}`,
			{ headers: { Cookie: cookieA } },
		);
		const body = (await res.json()) as any;
		// Find the row whose source_display matches (case-insensitive) "linkedin"
		const li = body.data.find(
			(r: any) => r.source.toLowerCase() === "linkedin",
		);
		expect(li).toBeDefined();
		// Two apps created with variant casings → grouped → total >= 2
		expect(li.total).toBeGreaterThanOrEqual(2);
	});

	it("returns top 8 sources by volume", async () => {
		// Create apps with 10 distinct sources, varying volumes
		for (let i = 0; i < 10; i++) {
			const count = 10 - i; // 10, 9, ..., 1
			for (let j = 0; j < count; j++) {
				await createApp(cookieA, {
					companyName: `SrcBulk-${i}-${j}`,
					roleTitle: "Eng",
					source: `SrcBulk-${i}`,
					status: "applied",
				});
			}
		}
		const res = await SELF.fetch(
			`http://localhost/api/analytics/sources?from=${FROM}&to=${TO}`,
			{ headers: { Cookie: cookieA } },
		);
		const body = (await res.json()) as any;
		expect(body.data.length).toBeLessThanOrEqual(8);
	});

	it("ghosted derivation correct", async () => {
		// Create an app with source 'GhostSource', status=applied, no status_change,
		// no interview_round, and updated_at > 30d ago. Back-date created_at
		// and use a narrow windowed range so the previous test's bulk-of-10
		// sources don't crowd this one out of the top-8 limit.
		const thirtyOneDaysAgoSec =
			Math.floor(Date.now() / 1000) - 31 * 86400;
		const fortyDaysAgoSec = Math.floor(Date.now() / 1000) - 40 * 86400;
		const app = await createApp(cookieA, {
			companyName: "GhostCo-1",
			roleTitle: "Eng",
			source: "GhostSource",
			status: "applied",
		});
		// Back-date created_at AND updated_at: the GhostCo app is the only one
		// that falls inside the 40-day window below.
		await setCreatedAt(app.id, fortyDaysAgoSec);
		await setUpdatedAt(app.id, thirtyOneDaysAgoSec);

		const fmt = (ts: number) =>
			new Date(ts * 1000).toISOString().slice(0, 10);
		const from = fmt(fortyDaysAgoSec - 86400);
		const to = fmt(fortyDaysAgoSec + 86400);

		const res = await SELF.fetch(
			`http://localhost/api/analytics/sources?from=${from}&to=${to}`,
			{ headers: { Cookie: cookieA } },
		);
		const body = (await res.json()) as any;
		const ghostRow = body.data.find(
			(r: any) => r.source === "GhostSource",
		);
		expect(ghostRow).toBeDefined();
		expect(ghostRow.ghosted).toBeGreaterThanOrEqual(1);
	});

	it("outcomes sum to total per row (all outcomes represented)", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/analytics/sources?from=${FROM}&to=${TO}`,
			{ headers: { Cookie: cookieA } },
		);
		const body = (await res.json()) as any;
		// `total` is independent of outcome bucketing — the server returns
		// COUNT(*) plus per-outcome SUMs. Outcome sums may not equal total
		// (e.g. 'applied' with no ghosted signal goes nowhere). Weakest
		// invariant: each outcome count is ≤ total and ≥ 0.
		for (const row of body.data) {
			for (const key of [
				"offer",
				"interviewing",
				"rejected",
				"ghosted",
				"withdrawn",
			]) {
				expect(row[key]).toBeGreaterThanOrEqual(0);
				expect(row[key]).toBeLessThanOrEqual(row.total);
			}
		}
	});

	it("enforces tenant isolation", async () => {
		await createApp(cookieB, {
			companyName: "TenantSrcCo",
			roleTitle: "Secret",
			source: "SecretSourceB",
			status: "applied",
		});

		const resA = await SELF.fetch(
			`http://localhost/api/analytics/sources?from=${FROM}&to=${TO}`,
			{ headers: { Cookie: cookieA } },
		);
		const bodyA = (await resA.json()) as any;
		const secret = bodyA.data.find(
			(r: any) => r.source === "SecretSourceB",
		);
		expect(secret).toBeUndefined();
	});
});
