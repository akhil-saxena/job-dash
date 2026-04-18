import { describe, it, expect, beforeAll } from "vitest";
import { SELF, env } from "cloudflare:test";
import { INTERVIEW_ROUND_TYPES } from "@/shared/constants";

// ---------------------------------------------------------------------------
// Test auth helper: use better-auth sign-up + sign-in to get a real session
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

	return loginRes.headers.get("set-cookie") || "";
}

let cookieA: string;
let cookieB: string;

function headersA(): Record<string, string> {
	return { "Content-Type": "application/json", Cookie: cookieA };
}

function headersB(): Record<string, string> {
	return { "Content-Type": "application/json", Cookie: cookieB };
}

/** Create a test application via API and return its data */
async function createTestApp(
	headers: Record<string, string>,
): Promise<any> {
	const res = await SELF.fetch("http://localhost/api/applications", {
		method: "POST",
		headers,
		body: JSON.stringify({
			companyName: "InterviewTestCo",
			roleTitle: "Engineer",
		}),
	});
	const json = (await res.json()) as any;
	return json.data;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let appIdA: string;

beforeAll(async () => {
	cookieA = await signUpAndGetCookie(
		"IntCrudA",
		"intv-crud-a@test.com",
		"Password123!",
	);
	cookieB = await signUpAndGetCookie(
		"IntCrudB",
		"intv-crud-b@test.com",
		"Password123!",
	);

	const app = await createTestApp(headersA());
	appIdA = app.id;
});

// ---------------------------------------------------------------------------
// Interview Round CRUD
// ---------------------------------------------------------------------------

describe("Interview Round CRUD", () => {
	let roundId: string;

	it("creates a round with minimal fields", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/interviews`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({ roundType: "technical" }),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(201);
		expect(json.data).toBeDefined();
		expect(json.data.id).toBeDefined();
		expect(json.data.applicationId).toBe(appIdA);
		expect(json.data.roundType).toBe("technical");
		expect(json.data.status).toBe("scheduled");

		roundId = json.data.id;
	});

	it("creates a round with all optional fields", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/interviews`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({
					roundType: "system_design",
					scheduledAt: "2026-05-01T10:00:00Z",
					durationMinutes: 90,
					interviewerName: "Jane Doe",
					interviewerRole: "Staff Engineer",
					meetingLink: "https://meet.google.com/abc-def-ghi",
					experienceNotes: "Prepare system design patterns",
					feedback: "Good conversation",
				}),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(201);
		expect(json.data.roundType).toBe("system_design");
		expect(json.data.durationMinutes).toBe(90);
		expect(json.data.interviewerName).toBe("Jane Doe");
		expect(json.data.interviewerRole).toBe("Staff Engineer");
		expect(json.data.meetingLink).toBe("https://meet.google.com/abc-def-ghi");
		expect(json.data.experienceNotes).toBe("Prepare system design patterns");
		expect(json.data.feedback).toBe("Good conversation");
		expect(json.data.scheduledAt).toBeTruthy();
	});

	it("lists rounds ordered by sortOrder with empty qaPairs", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/interviews`,
			{ headers: headersA() },
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(Array.isArray(json.data)).toBe(true);
		expect(json.data.length).toBeGreaterThanOrEqual(2);

		// Verify ordering
		for (let i = 1; i < json.data.length; i++) {
			expect(json.data[i].sortOrder).toBeGreaterThanOrEqual(
				json.data[i - 1].sortOrder,
			);
		}

		// Verify qaPairs array present
		for (const round of json.data) {
			expect(Array.isArray(round.qaPairs)).toBe(true);
		}
	});

	it("updates rating (INTV-04 star rating persistence)", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/interviews/${roundId}`,
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({ rating: 4 }),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.rating).toBe(4);
	});

	it("partial update only changes specified field", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/interviews/${roundId}`,
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({ experienceNotes: "Great discussion" }),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.experienceNotes).toBe("Great discussion");
		// rating should remain from previous test
		expect(json.data.rating).toBe(4);
		// roundType should remain unchanged
		expect(json.data.roundType).toBe("technical");
	});

	it("updates status to completed", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/interviews/${roundId}`,
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({ status: "completed" }),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.status).toBe("completed");
	});

	it("returns interview count", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/interview-count`,
			{ headers: headersA() },
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.count).toBeGreaterThanOrEqual(2);
	});

	it("deletes a round", async () => {
		// Create a round to delete
		const createRes = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/interviews`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({ roundType: "phone_screen" }),
			},
		);
		const created = (await createRes.json()) as any;
		const deleteId = created.data.id;

		const deleteRes = await SELF.fetch(
			`http://localhost/api/interviews/${deleteId}`,
			{ method: "DELETE", headers: headersA() },
		);
		const deleteJson = (await deleteRes.json()) as any;

		expect(deleteRes.status).toBe(200);
		expect(deleteJson.data.deleted).toBe(true);

		// Verify round no longer in list
		const listRes = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/interviews`,
			{ headers: headersA() },
		);
		const listJson = (await listRes.json()) as any;
		const found = listJson.data.find((r: any) => r.id === deleteId);
		expect(found).toBeUndefined();
	});

	it("rejects cross-tenant round update with 404", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/interviews/${roundId}`,
			{
				method: "PATCH",
				headers: headersB(),
				body: JSON.stringify({ rating: 1 }),
			},
		);
		expect(res.status).toBe(404);
	});

	it("rejects cross-tenant round delete with 404", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/interviews/${roundId}`,
			{ method: "DELETE", headers: headersB() },
		);
		expect(res.status).toBe(404);
	});

	it("rejects round creation for non-existent application with 404", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/applications/nonexistent-app-id/interviews",
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({ roundType: "technical" }),
			},
		);
		expect(res.status).toBe(404);
	});

	it("accepts all 10 round types", async () => {
		for (const roundType of INTERVIEW_ROUND_TYPES) {
			const res = await SELF.fetch(
				`http://localhost/api/applications/${appIdA}/interviews`,
				{
					method: "POST",
					headers: headersA(),
					body: JSON.stringify({ roundType }),
				},
			);
			expect(res.status).toBe(201);
			const json = (await res.json()) as any;
			expect(json.data.roundType).toBe(roundType);
		}
	});
});
