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

beforeAll(async () => {
	cookieA = await signUpAndGetCookie(
		"CompCrudA",
		"comp-crud-a@test.com",
		"Password123!",
	);
	cookieB = await signUpAndGetCookie(
		"CompCrudB",
		"comp-crud-b@test.com",
		"Password123!",
	);
});

// ---------------------------------------------------------------------------
// Company CRUD
// ---------------------------------------------------------------------------

describe("Company CRUD", () => {
	let companyId: string;

	it("creates a new company", async () => {
		const res = await SELF.fetch("http://localhost/api/companies", {
			method: "POST",
			headers: headersA(),
			body: JSON.stringify({
				name: "Google",
				domain: "google.com",
				website: "https://google.com",
			}),
		});
		const json = (await res.json()) as any;

		expect(res.status).toBe(201);
		expect(json.data).toBeDefined();
		expect(json.data.company).toBeDefined();
		expect(json.data.company.name).toBe("Google");
		expect(json.data.company.domain).toBe("google.com");
		expect(json.data.created).toBe(true);

		companyId = json.data.company.id;
	});

	it("returns existing company when same domain (dedup)", async () => {
		const res = await SELF.fetch("http://localhost/api/companies", {
			method: "POST",
			headers: headersA(),
			body: JSON.stringify({
				name: "Google Inc",
				domain: "google.com",
			}),
		});
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.company.id).toBe(companyId);
		expect(json.data.created).toBe(false);
		// Name should be original, not the new one
		expect(json.data.company.name).toBe("Google");
	});

	it("creates company without domain (no dedup)", async () => {
		const res = await SELF.fetch("http://localhost/api/companies", {
			method: "POST",
			headers: headersA(),
			body: JSON.stringify({
				name: "Stealth Startup",
			}),
		});
		const json = (await res.json()) as any;

		expect(res.status).toBe(201);
		expect(json.data.created).toBe(true);
		expect(json.data.company.name).toBe("Stealth Startup");
		expect(json.data.company.domain).toBeNull();
	});

	it("lists all companies ordered by name", async () => {
		const res = await SELF.fetch("http://localhost/api/companies", {
			headers: headersA(),
		});
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(Array.isArray(json.data)).toBe(true);
		expect(json.data.length).toBeGreaterThanOrEqual(2);

		// Verify alphabetical ordering
		for (let i = 1; i < json.data.length; i++) {
			expect(
				json.data[i].name.localeCompare(json.data[i - 1].name),
			).toBeGreaterThanOrEqual(0);
		}
	});

	it("gets a single company by ID", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/companies/${companyId}`,
			{ headers: headersA() },
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.id).toBe(companyId);
		expect(json.data.name).toBe("Google");
	});

	it("updates company notes (COMP-02 research notes)", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/companies/${companyId}`,
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({
					notes: "# Google Research\n\nGreat culture, competitive compensation.",
				}),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.notes).toContain("Google Research");
	});

	it("updates company domain and website", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/companies/${companyId}`,
			{
				method: "PATCH",
				headers: headersA(),
				body: JSON.stringify({
					website: "https://about.google",
				}),
			},
		);
		const json = (await res.json()) as any;

		expect(res.status).toBe(200);
		expect(json.data.website).toBe("https://about.google");
		// Notes should persist from previous update
		expect(json.data.notes).toContain("Google Research");
	});

	it("deletes a company", async () => {
		// Create a company to delete
		const createRes = await SELF.fetch("http://localhost/api/companies", {
			method: "POST",
			headers: headersA(),
			body: JSON.stringify({ name: "ToDeleteCo" }),
		});
		const created = (await createRes.json()) as any;
		const deleteId = created.data.company.id;

		const deleteRes = await SELF.fetch(
			`http://localhost/api/companies/${deleteId}`,
			{ method: "DELETE", headers: headersA() },
		);
		const deleteJson = (await deleteRes.json()) as any;

		expect(deleteRes.status).toBe(200);
		expect(deleteJson.data.deleted).toBe(true);

		// Verify company no longer accessible
		const getRes = await SELF.fetch(
			`http://localhost/api/companies/${deleteId}`,
			{ headers: headersA() },
		);
		expect(getRes.status).toBe(404);
	});

	it("returns 404 for non-existent company", async () => {
		const res = await SELF.fetch(
			"http://localhost/api/companies/nonexistent-company-id",
			{ headers: headersA() },
		);
		expect(res.status).toBe(404);
	});

	it("rejects cross-tenant company access", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/companies/${companyId}`,
			{ headers: headersB() },
		);
		expect(res.status).toBe(404);
	});

	it("rejects cross-tenant company update", async () => {
		const res = await SELF.fetch(
			`http://localhost/api/companies/${companyId}`,
			{
				method: "PATCH",
				headers: headersB(),
				body: JSON.stringify({ notes: "Hacked" }),
			},
		);
		expect(res.status).toBe(404);
	});
});
