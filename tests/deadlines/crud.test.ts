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

/** Create a test application via API and return its data */
async function createTestApp(
	headers: Record<string, string>,
): Promise<any> {
	const res = await SELF.fetch("http://localhost/api/applications", {
		method: "POST",
		headers,
		body: JSON.stringify({
			companyName: "DeadlineTestCo",
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
		"DeadCrudA",
		"dead-crud-a@test.com",
		"Password123!",
	);
	cookieB = await signUpAndGetCookie(
		"DeadCrudB",
		"dead-crud-b@test.com",
		"Password123!",
	);

	const app = await createTestApp(headersA());
	appIdA = app.id;
});

// ---------------------------------------------------------------------------
// Deadline CRUD
// ---------------------------------------------------------------------------

describe("Deadline CRUD", () => {
	let deadlineId: string;

	// Use a future date for testing
	const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
	const farFutureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

	it("creates a deadline with required fields", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/deadlines`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({
					deadlineType: "application_close",
					dueDate: futureDate,
				}),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(201);
		expect(json.data).toBeDefined();
		expect(json.data.id).toBeDefined();
		expect(json.data.deadlineType).toBe("application_close");
		expect(json.data.isCompleted).toBe(false);
		expect(json.data.applicationId).toBe(appIdA);

		deadlineId = json.data.id;
	});

	it("creates a deadline with optional label", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/deadlines`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({
					deadlineType: "follow_up",
					label: "Follow up with recruiter",
					dueDate: farFutureDate,
				}),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(201);
		expect(json.data.deadlineType).toBe("follow_up");
		expect(json.data.label).toBe("Follow up with recruiter");
	});

	it("lists deadlines for an application ordered by dueDate", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/deadlines`,
			{ headers: headersA() },
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(Array.isArray(json.data)).toBe(true);
		expect(json.data.length).toBeGreaterThanOrEqual(2);

		// Verify ordering by dueDate (compare as strings -- ISO format sorts correctly)
		for (let i = 1; i < json.data.length; i++) {
			const current = String(json.data[i].dueDate);
			const previous = String(json.data[i - 1].dueDate);
			expect(current >= previous).toBe(true);
		}
	});

	it("lists upcoming deadlines across all applications", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/deadlines/upcoming",
			{ headers: headersA() },
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(Array.isArray(json.data)).toBe(true);
		expect(json.data.length).toBeGreaterThanOrEqual(2);

		// All should be non-completed
		for (const d of json.data) {
			expect(d.isCompleted).toBe(false);
		}
	});

	it("updates a deadline", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/deadlines/${deadlineId}`,
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({
					label: "Updated label",
					deadlineType: "offer_expiry",
				}),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.label).toBe("Updated label");
		expect(json.data.deadlineType).toBe("offer_expiry");
	});

	it("marks a deadline as complete", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/deadlines/${deadlineId}/complete`,
			{ method: "PATCH", headers: headersA() },
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.isCompleted).toBe(true);
	});

	it("completed deadline not in upcoming list", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/deadlines/upcoming",
			{ headers: headersA() },
		);
		const json = (await res.json()) as any;

		const found = json.data.find((d: any) => d.id === deadlineId);
		expect(found).toBeUndefined();
	});

	it("deletes a deadline", async () => {
		// Create a deadline to delete
		const createRes = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/deadlines`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({
					deadlineType: "custom",
					label: "To delete",
					dueDate: futureDate,
				}),
			},
		);
		const created = (await createRes.json()) as any;
		const deleteId = created.data.id;

		const deleteRes = await SELF.fetch(
			`http://localhost/api/deadlines/${deleteId}`,
			{ method: "DELETE", headers: headersA() },
		);
		const deleteJson = (await deleteRes.json()) as any;

		expect(deleteRes.status).toBe(200);
		expect(deleteJson.data.deleted).toBe(true);
	});

	it("returns 404 for non-existent deadline update", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/deadlines/nonexistent-deadline-id",
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({ label: "Nope" }),
			},
		);
		expect(res.status).toBe(404);
	});

	it("rejects cross-tenant deadline update", async () => {
		// deadlineId belongs to user A
		const res = await SELF.fetch(
			`http://localhost/api/deadlines/${deadlineId}`,
			{
				method: "PATCH",
				headers: headersB(),
				body: JSON.stringify({ label: "Hacked" }),
			},
		);
		expect(res.status).toBe(404);
	});

	it("rejects deadline creation for non-existent application", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/applications/nonexistent-app-id/deadlines",
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({
					deadlineType: "follow_up",
					dueDate: futureDate,
				}),
			},
		);
		expect(res.status).toBe(404);
	});
});
