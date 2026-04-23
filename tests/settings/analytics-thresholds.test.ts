import { describe, it, expect, beforeAll } from "vitest";
import { SELF, env } from "cloudflare:test";
import { ANALYTICS_THRESHOLD_DEFAULTS } from "@/shared/validators/analytics";

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

let cookie: string;
const PATH = "http://localhost/api/settings/analytics-thresholds";
const RESET_PATH = `${PATH}/reset`;

beforeAll(async () => {
	cookie = await signUpAndGetCookie(
		"Thresholds User",
		"thresholds@test.com",
		"password-thresholds-123",
	);
});

function headers(): Record<string, string> {
	return { "Content-Type": "application/json", Cookie: cookie };
}

const VALID_PATCH_A = {
	appliedScreening: { greenBelow: 3, amberBelow: 10 },
	screeningInterviewing: { greenBelow: 2, amberBelow: 8 },
	interviewingOffer: { greenBelow: 1, amberBelow: 5 },
};

const VALID_PATCH_B = {
	appliedScreening: { greenBelow: 4, amberBelow: 12 },
	screeningInterviewing: { greenBelow: 3, amberBelow: 9 },
	interviewingOffer: { greenBelow: 2, amberBelow: 6 },
};

describe("Settings > Analytics thresholds", () => {
	it("GET returns defaults when row absent", async () => {
		const res = await SELF.fetch(PATH, { headers: headers() });
		expect(res.status).toBe(200);
		const body = (await res.json()) as any;
		expect(body.data).toEqual(ANALYTICS_THRESHOLD_DEFAULTS);
	});

	it("PATCH upserts — GET after returns the patched values", async () => {
		const patchRes = await SELF.fetch(PATH, {
			method: "PATCH",
			headers: headers(),
			body: JSON.stringify(VALID_PATCH_A),
		});
		expect(patchRes.status).toBe(200);
		const patchBody = (await patchRes.json()) as any;
		expect(patchBody.data).toEqual(VALID_PATCH_A);

		const getRes = await SELF.fetch(PATH, { headers: headers() });
		expect(getRes.status).toBe(200);
		const getBody = (await getRes.json()) as any;
		expect(getBody.data).toEqual(VALID_PATCH_A);
	});

	it("POST /reset deletes row — GET after returns defaults again", async () => {
		// Start from the previous test's patched state; reset
		const resetRes = await SELF.fetch(RESET_PATH, {
			method: "POST",
			headers: headers(),
		});
		expect(resetRes.status).toBe(200);
		const resetBody = (await resetRes.json()) as any;
		expect(resetBody.data).toEqual(ANALYTICS_THRESHOLD_DEFAULTS);

		const getRes = await SELF.fetch(PATH, { headers: headers() });
		const getBody = (await getRes.json()) as any;
		expect(getBody.data).toEqual(ANALYTICS_THRESHOLD_DEFAULTS);
	});

	it("PATCH rejects invalid body (green-below >= amber-below)", async () => {
		const res = await SELF.fetch(PATH, {
			method: "PATCH",
			headers: headers(),
			body: JSON.stringify({
				appliedScreening: { greenBelow: 14, amberBelow: 7 },
				screeningInterviewing: { greenBelow: 5, amberBelow: 10 },
				interviewingOffer: { greenBelow: 3, amberBelow: 7 },
			}),
		});
		expect(res.status).toBe(400);
	});

	it("two near-concurrent PATCHes both succeed (ON CONFLICT DO UPDATE)", async () => {
		const p1 = SELF.fetch(PATH, {
			method: "PATCH",
			headers: headers(),
			body: JSON.stringify(VALID_PATCH_A),
		});
		const p2 = SELF.fetch(PATH, {
			method: "PATCH",
			headers: headers(),
			body: JSON.stringify(VALID_PATCH_B),
		});
		const [r1, r2] = await Promise.all([p1, p2]);
		expect(r1.status).toBe(200);
		expect(r2.status).toBe(200);

		const getRes = await SELF.fetch(PATH, { headers: headers() });
		const body = (await getRes.json()) as any;
		// Final state must be one of the two — we don't assume ordering, only
		// that no error was raised and one of them is persisted.
		const isA =
			JSON.stringify(body.data) === JSON.stringify(VALID_PATCH_A);
		const isB =
			JSON.stringify(body.data) === JSON.stringify(VALID_PATCH_B);
		expect(isA || isB).toBe(true);
	});
});
