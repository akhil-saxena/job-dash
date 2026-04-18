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

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let appIdA: string;
let roundIdA: string;

beforeAll(async () => {
	cookieA = await signUpAndGetCookie(
		"QAUserA",
		"qa-user-a@test.com",
		"Password123!",
	);
	cookieB = await signUpAndGetCookie(
		"QAUserB",
		"qa-user-b@test.com",
		"Password123!",
	);

	// Create an application for user A
	const appRes = await SELF.fetch("http://localhost/api/applications", {
		method: "POST",
		headers: headersA(),
		body: JSON.stringify({
			companyName: "QATestCo",
			roleTitle: "Engineer",
		}),
	});
	const appJson = (await appRes.json()) as any;
	appIdA = appJson.data.id;

	// Create a round for user A
	const roundRes = await SELF.fetch(
		`http://localhost/api/applications/${appIdA}/interviews`,
		{
			method: "POST",
			headers: headersA(),
			body: JSON.stringify({ roundType: "technical" }),
		},
	);
	const roundJson = (await roundRes.json()) as any;
	roundIdA = roundJson.data.id;
});

// ---------------------------------------------------------------------------
// Interview QA CRUD
// ---------------------------------------------------------------------------

describe("Interview QA CRUD", () => {
	let qaId: string;

	it("creates a QA pair with question and answer", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/interviews/${roundIdA}/qa`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({
					question: "Tell me about yourself",
					answer: "I am a software engineer with 5 years of experience.",
				}),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(201);
		expect(json.data).toBeDefined();
		expect(json.data.id).toBeDefined();
		expect(json.data.roundId).toBe(roundIdA);
		expect(json.data.question).toBe("Tell me about yourself");
		expect(json.data.answer).toBe(
			"I am a software engineer with 5 years of experience.",
		);

		qaId = json.data.id;
	});

	it("creates a QA pair with question only (answer nullable)", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/interviews/${roundIdA}/qa`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({
					question: "What is your biggest weakness?",
				}),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(201);
		expect(json.data.question).toBe("What is your biggest weakness?");
		expect(json.data.answer).toBeNull();
	});

	it("auto-assigns sortOrder", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/interviews/${roundIdA}/qa`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({
					question: "Third question",
				}),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(201);
		// sortOrder should be 2 (0-indexed: first=0, second=1, third=2)
		expect(json.data.sortOrder).toBe(2);
	});

	it("QA pairs appear in round list response", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/interviews`,
			{ headers: headersA() },
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		const round = json.data.find((r: any) => r.id === roundIdA);
		expect(round).toBeDefined();
		expect(Array.isArray(round.qaPairs)).toBe(true);
		expect(round.qaPairs.length).toBeGreaterThanOrEqual(3);

		// Verify QA pairs are ordered by sortOrder
		for (let i = 1; i < round.qaPairs.length; i++) {
			expect(round.qaPairs[i].sortOrder).toBeGreaterThanOrEqual(
				round.qaPairs[i - 1].sortOrder,
			);
		}
	});

	it("updates answer via PATCH (auto-save pattern)", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/interview-qa/${qaId}`,
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({
					answer: "Updated answer with more details.",
				}),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.answer).toBe("Updated answer with more details.");
		// question should remain unchanged
		expect(json.data.question).toBe("Tell me about yourself");
	});

	it("updates question via PATCH", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/interview-qa/${qaId}`,
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({
					question: "Updated question?",
				}),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.question).toBe("Updated question?");
		// answer should remain from previous update
		expect(json.data.answer).toBe("Updated answer with more details.");
	});

	it("deletes a QA pair", async () => {
		// Create a QA to delete
		const createRes = await SELF.fetch(
			`http://localhost/api/interviews/${roundIdA}/qa`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({ question: "To be deleted" }),
			},
		);
		const created = (await createRes.json()) as any;
		const deleteQaId = created.data.id;

		const deleteRes = await SELF.fetch(
			`http://localhost/api/interview-qa/${deleteQaId}`,
			{ method: "DELETE", headers: headersA() },
		);
		const deleteJson = (await deleteRes.json()) as any;

		expect(deleteRes.status).toBe(200);
		expect(deleteJson.data.deleted).toBe(true);

		// Verify QA pair no longer in round list
		const listRes = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/interviews`,
			{ headers: headersA() },
		);
		const listJson = (await listRes.json()) as any;
		const round = listJson.data.find((r: any) => r.id === roundIdA);
		const found = round.qaPairs.find((qa: any) => qa.id === deleteQaId);
		expect(found).toBeUndefined();
	});

	it("cascade-deletes QA pairs when round is deleted", async () => {
		// Create a new round + QA pair
		const roundRes = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/interviews`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({ roundType: "behavioral" }),
			},
		);
		const roundJson = (await roundRes.json()) as any;
		const tempRoundId = roundJson.data.id;

		// Add a QA pair to this round
		const qaRes = await SELF.fetch(
			`http://localhost/api/interviews/${tempRoundId}/qa`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({ question: "Cascade test question" }),
			},
		);
		const qaJson = (await qaRes.json()) as any;
		const tempQaId = qaJson.data.id;

		// Delete the round
		await SELF.fetch(`http://localhost/api/interviews/${tempRoundId}`, {
			method: "DELETE",
			headers: headersA(),
		});

		// Verify QA pair was cascade-deleted by trying to update it
		const updateRes = await SELF.fetch(
			`http://localhost/api/interview-qa/${tempQaId}`,
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({ answer: "Should fail" }),
			},
		);
		expect(updateRes.status).toBe(404);
	});

	it("rejects cross-tenant QA creation with 404", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/interviews/${roundIdA}/qa`,
			{
				method: "POST",
				headers: headersB(),
				body: JSON.stringify({ question: "Hacker question" }),
			},
		);
		expect(res.status).toBe(404);
	});

	it("rejects cross-tenant QA modification with 404", async () => {
		const patchRes = await SELF.fetch(
			`http://localhost/api/interview-qa/${qaId}`,
			{
				method: "PATCH",
				headers: headersB(),
				body: JSON.stringify({ answer: "Hacked answer" }),
			},
		);
		expect(patchRes.status).toBe(404);

		const deleteRes = await SELF.fetch(
			`http://localhost/api/interview-qa/${qaId}`,
			{ method: "DELETE", headers: headersB() },
		);
		expect(deleteRes.status).toBe(404);
	});
});
