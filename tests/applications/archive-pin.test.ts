import { describe, it, expect, beforeAll } from "vitest";
import { SELF, env } from "cloudflare:test";

// ---------------------------------------------------------------------------
// Auth helper
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

let cookie: string;

function headers(): Record<string, string> {
	return { "Content-Type": "application/json", Cookie: cookie };
}

async function createApp(
	body: Record<string, unknown>,
): Promise<{ status: number; body: any }> {
	const res = await SELF.fetch("http://localhost/api/applications", {
		method: "POST",
		headers: headers(),
		body: JSON.stringify(body),
	});
	return { status: res.status, body: await res.json() };
}

async function getTimeline(appId: string): Promise<any[]> {
	const res = await SELF.fetch(
		`http://localhost/api/applications/${appId}/timeline`,
		{ headers: headers() },
	);
	const body = (await res.json()) as any;
	return body.data;
}

beforeAll(async () => {
	cookie = await signUpAndGetCookie(
		"ArchivePin User",
		"archivepin-user@test.com",
		"password-ap-123",
	);
});

// ---------------------------------------------------------------------------
// PATCH /api/applications/:id/archive -- TRACK-04
// ---------------------------------------------------------------------------

describe("PATCH /api/applications/:id/archive", () => {
	it("archives application", async () => {
		const { body: created } = await createApp({
			companyName: "ArchiveCo",
			roleTitle: "Eng",
		});

		const res = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/archive`,
			{ method: "PATCH", headers: headers() },
		);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.data.isArchived).toBe(true);
	});

	it("archived app excluded from default list", async () => {
		const { body: created } = await createApp({
			companyName: "ExcludeArchiveCo",
			roleTitle: "Eng",
		});

		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/archive`,
			{ method: "PATCH", headers: headers() },
		);

		const listRes = await SELF.fetch(
			"http://localhost/api/applications",
			{ headers: headers() },
		);
		const listBody = (await listRes.json()) as any;
		const found = listBody.data.find(
			(a: any) => a.id === created.data.id,
		);
		expect(found).toBeUndefined();
	});

	it("archived app appears with ?archived=true", async () => {
		const { body: created } = await createApp({
			companyName: "ShowArchivedCo",
			roleTitle: "Eng",
		});

		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/archive`,
			{ method: "PATCH", headers: headers() },
		);

		const listRes = await SELF.fetch(
			"http://localhost/api/applications?archived=true",
			{ headers: headers() },
		);
		const listBody = (await listRes.json()) as any;
		const found = listBody.data.find(
			(a: any) => a.id === created.data.id,
		);
		expect(found).toBeDefined();
		expect(found.isArchived).toBe(true);
	});

	it("unarchives on second toggle", async () => {
		const { body: created } = await createApp({
			companyName: "UnarchiveCo",
			roleTitle: "Eng",
		});

		// First toggle: archive
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/archive`,
			{ method: "PATCH", headers: headers() },
		);

		// Second toggle: unarchive
		const res = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/archive`,
			{ method: "PATCH", headers: headers() },
		);
		const body = (await res.json()) as any;
		expect(body.data.isArchived).toBe(false);
	});

	it("generates archived/unarchived timeline events", async () => {
		const { body: created } = await createApp({
			companyName: "ArchiveEventsCo",
			roleTitle: "Eng",
		});

		// Archive
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/archive`,
			{ method: "PATCH", headers: headers() },
		);

		// Unarchive
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/archive`,
			{ method: "PATCH", headers: headers() },
		);

		const events = await getTimeline(created.data.id);
		const archivedEvent = events.find(
			(e: any) => e.eventType === "archived",
		);
		const unarchivedEvent = events.find(
			(e: any) => e.eventType === "unarchived",
		);
		expect(archivedEvent).toBeDefined();
		expect(unarchivedEvent).toBeDefined();
	});

	it("archive and soft-delete are independent", async () => {
		const { body: created } = await createApp({
			companyName: "IndependentCo",
			roleTitle: "Eng",
		});

		// Archive first
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/archive`,
			{ method: "PATCH", headers: headers() },
		);

		// Then soft-delete
		const deleteRes = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{ method: "DELETE", headers: headers() },
		);
		const deleteBody = (await deleteRes.json()) as any;

		// Both flags should be set independently (D-19)
		expect(deleteBody.data.isArchived).toBe(true);
		expect(deleteBody.data.deletedAt).not.toBeNull();
	});
});

// ---------------------------------------------------------------------------
// PATCH /api/applications/:id/pin -- TRACK-05
// ---------------------------------------------------------------------------

describe("PATCH /api/applications/:id/pin", () => {
	it("pins application", async () => {
		const { body: created } = await createApp({
			companyName: "PinCo",
			roleTitle: "Eng",
		});

		const res = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/pin`,
			{ method: "PATCH", headers: headers() },
		);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.data.isPinned).toBe(true);
	});

	it("unpins on second toggle", async () => {
		const { body: created } = await createApp({
			companyName: "UnpinCo",
			roleTitle: "Eng",
		});

		// First toggle: pin
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/pin`,
			{ method: "PATCH", headers: headers() },
		);

		// Second toggle: unpin
		const res = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/pin`,
			{ method: "PATCH", headers: headers() },
		);
		const body = (await res.json()) as any;
		expect(body.data.isPinned).toBe(false);
	});

	it("pin persists across requests", async () => {
		const { body: created } = await createApp({
			companyName: "PersistPinCo",
			roleTitle: "Eng",
		});

		// Pin it
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/pin`,
			{ method: "PATCH", headers: headers() },
		);

		// Fetch it again via GET
		const getRes = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{ headers: headers() },
		);
		const getBody = (await getRes.json()) as any;
		expect(getBody.data.isPinned).toBe(true);
	});

	it("generates pinned/unpinned timeline events", async () => {
		const { body: created } = await createApp({
			companyName: "PinEventsCo",
			roleTitle: "Eng",
		});

		// Pin
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/pin`,
			{ method: "PATCH", headers: headers() },
		);

		// Unpin
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/pin`,
			{ method: "PATCH", headers: headers() },
		);

		const events = await getTimeline(created.data.id);
		const pinnedEvent = events.find(
			(e: any) => e.eventType === "pinned",
		);
		const unpinnedEvent = events.find(
			(e: any) => e.eventType === "unpinned",
		);
		expect(pinnedEvent).toBeDefined();
		expect(unpinnedEvent).toBeDefined();
	});
});
