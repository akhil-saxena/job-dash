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
			companyName: "TagTestCo",
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
		"TagCrudA",
		"tag-crud-a@test.com",
		"Password123!",
	);
	cookieB = await signUpAndGetCookie(
		"TagCrudB",
		"tag-crud-b@test.com",
		"Password123!",
	);

	const app = await createTestApp(headersA());
	appIdA = app.id;
});

// ---------------------------------------------------------------------------
// Tag CRUD
// ---------------------------------------------------------------------------

describe("Tag CRUD", () => {
	let tagId: string;

	it("creates a tag with defaults", async () => {
		const res = await SELF.fetch("http://localhost/api/tags", {
			method: "POST",
			headers: headersA(),
			body: JSON.stringify({ name: "Frontend" }),
		});
		const json = (await res.json()) as any;

		expect(res.status).toBe(201);
		expect(json.data).toBeDefined();
		expect(json.data.id).toBeDefined();
		expect(json.data.name).toBe("Frontend");
		expect(json.data.color).toBe("#3b82f6");

		tagId = json.data.id;
	});

	it("creates a tag with custom color", async () => {
		const res = await SELF.fetch("http://localhost/api/tags", {
			method: "POST",
			headers: headersA(),
			body: JSON.stringify({ name: "Backend", color: "#22c55e" }),
		});
		const json = (await res.json()) as any;

		expect(res.status).toBe(201);
		expect(json.data.name).toBe("Backend");
		expect(json.data.color).toBe("#22c55e");
	});

	it("rejects duplicate tag name for same user", async () => {
		const res = await SELF.fetch("http://localhost/api/tags", {
			method: "POST",
			headers: headersA(),
			body: JSON.stringify({ name: "Frontend" }),
		});

		expect(res.status).toBe(409);
	});

	it("lists all tags ordered by name", async () => {
		const res = await SELF.fetch("http://localhost/api/tags", {
			headers: headersA(),
		});
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(Array.isArray(json.data)).toBe(true);
		expect(json.data.length).toBeGreaterThanOrEqual(2);

		// Verify ordering: Backend < Frontend
		const names = json.data.map((t: any) => t.name);
		expect(names.indexOf("Backend")).toBeLessThan(names.indexOf("Frontend"));
	});

	it("updates tag name and color", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/tags/${tagId}`,
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({ name: "UI/Frontend", color: "#f59e0b" }),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.name).toBe("UI/Frontend");
		expect(json.data.color).toBe("#f59e0b");
	});

	it("deletes a tag", async () => {
		// Create a tag to delete
		const createRes = await SELF.fetch("http://localhost/api/tags", {
			method: "POST",
			headers: headersA(),
			body: JSON.stringify({ name: "ToDelete" }),
		});
		const created = (await createRes.json()) as any;
		const deleteId = created.data.id;

		const deleteRes = await SELF.fetch(
			`http://localhost/api/tags/${deleteId}`,
			{ method: "DELETE", headers: headersA() },
		);
		const deleteJson = (await deleteRes.json()) as any;

		expect(deleteRes.status).toBe(200);
		expect(deleteJson.data.deleted).toBe(true);

		// Verify tag no longer in list
		const listRes = await SELF.fetch("http://localhost/api/tags", {
			headers: headersA(),
		});
		const listJson = (await listRes.json()) as any;
		const found = listJson.data.find((t: any) => t.id === deleteId);
		expect(found).toBeUndefined();
	});

	it("returns 404 for non-existent tag update", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/tags/nonexistent-tag-id",
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({ name: "Nope" }),
			},
		);
		expect(res.status).toBe(404);
	});

	it("rejects cross-tenant tag update", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/tags/${tagId}`,
			{
				method: "PATCH",
				headers: headersB(),
				body: JSON.stringify({ name: "Hacked" }),
			},
		);
		expect(res.status).toBe(404);
	});
});

// ---------------------------------------------------------------------------
// Tag Assignment
// ---------------------------------------------------------------------------

describe("Tag Assignment", () => {
	let assignTagId: string;

	beforeAll(async () => {
		// Create a tag specifically for assignment tests
		const res = await SELF.fetch("http://localhost/api/tags", {
			method: "POST",
			headers: headersA(),
			body: JSON.stringify({ name: "AssignTest", color: "#ef4444" }),
		});
		const json = (await res.json()) as any;
		assignTagId = json.data.id;
	});

	it("assigns a tag to an application", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/tags`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({ tagId: assignTagId }),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(201);
		expect(json.data).toBeDefined();
	});

	it("silently handles duplicate assignment", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/tags`,
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({ tagId: assignTagId }),
			},
		);

		expect(res.status).toBe(201);
	});

	it("gets tags for an application", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/tags`,
			{ headers: headersA() },
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(Array.isArray(json.data)).toBe(true);
		expect(json.data.length).toBeGreaterThanOrEqual(1);

		const assignedTag = json.data.find((t: any) => t.id === assignTagId);
		expect(assignedTag).toBeDefined();
		expect(assignedTag.name).toBe("AssignTest");
		expect(assignedTag.color).toBe("#ef4444");
	});

	it("unassigns a tag from an application", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/tags/${assignTagId}`,
			{ method: "DELETE", headers: headersA() },
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.deleted).toBe(true);

		// Verify tag is no longer assigned
		const getRes = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/tags`,
			{ headers: headersA() },
		);
		const getJson = (await getRes.json()) as any;
		const found = getJson.data.find((t: any) => t.id === assignTagId);
		expect(found).toBeUndefined();
	});

	it("rejects tag assignment to non-existent application", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/applications/nonexistent-app-id/tags",
			{
				method: "POST",
				headers: headersA(),
				body: JSON.stringify({ tagId: assignTagId }),
			},
		);
		expect(res.status).toBe(404);
	});

	it("rejects cross-tenant tag assignment", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/applications/${appIdA}/tags`,
			{
				method: "POST",
				headers: headersB(),
				body: JSON.stringify({ tagId: assignTagId }),
			},
		);
		expect(res.status).toBe(404);
	});
});
