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
		"SoftDelete User",
		"softdelete-user@test.com",
		"password-sd-123",
	);
});

// ---------------------------------------------------------------------------
// DELETE /api/applications/:id -- soft-delete (TRACK-03)
// ---------------------------------------------------------------------------

describe("DELETE /api/applications/:id", () => {
	it("soft-deletes application (sets deleted_at)", async () => {
		const { body: created } = await createApp({
			companyName: "SoftDelCo",
			roleTitle: "Eng",
		});

		const res = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{ method: "DELETE", headers: headers() },
		);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.data.deletedAt).not.toBeNull();
	});

	it("soft-deleted app excluded from list", async () => {
		const { body: created } = await createApp({
			companyName: "ExcludedCo",
			roleTitle: "Eng",
		});

		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{ method: "DELETE", headers: headers() },
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

	it("soft-deleted app returns 404 on get by id", async () => {
		const { body: created } = await createApp({
			companyName: "NotFoundCo",
			roleTitle: "Eng",
		});

		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{ method: "DELETE", headers: headers() },
		);

		const getRes = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{ headers: headers() },
		);
		expect(getRes.status).toBe(404);
	});

	it("generates deleted timeline event", async () => {
		const { body: created } = await createApp({
			companyName: "TimelineDelCo",
			roleTitle: "Eng",
		});

		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{ method: "DELETE", headers: headers() },
		);

		// getTimeline uses the getTimeline service which checks userId ownership
		// but the app is now soft-deleted. Access timeline directly via DB.
		const events = await getTimeline(created.data.id);
		const deletedEvent = events.find(
			(e: any) => e.eventType === "deleted",
		);
		expect(deletedEvent).toBeDefined();
	});
});

// ---------------------------------------------------------------------------
// PATCH /api/applications/:id/restore -- restore (TRACK-03)
// ---------------------------------------------------------------------------

describe("PATCH /api/applications/:id/restore", () => {
	it("restores soft-deleted application", async () => {
		const { body: created } = await createApp({
			companyName: "RestoreCo",
			roleTitle: "Eng",
		});

		// Soft-delete
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{ method: "DELETE", headers: headers() },
		);

		// Restore
		const restoreRes = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/restore`,
			{ method: "PATCH", headers: headers() },
		);
		const restoreBody = (await restoreRes.json()) as any;
		expect(restoreRes.status).toBe(200);
		expect(restoreBody.data.deletedAt).toBeNull();
	});

	it("restored app appears in list again", async () => {
		const { body: created } = await createApp({
			companyName: "ReappearCo",
			roleTitle: "Eng",
		});

		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{ method: "DELETE", headers: headers() },
		);

		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/restore`,
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
		expect(found).toBeDefined();
	});

	it("generates restored timeline event", async () => {
		const { body: created } = await createApp({
			companyName: "TimelineRestoreCo",
			roleTitle: "Eng",
		});

		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{ method: "DELETE", headers: headers() },
		);

		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/restore`,
			{ method: "PATCH", headers: headers() },
		);

		const events = await getTimeline(created.data.id);
		const restoredEvent = events.find(
			(e: any) => e.eventType === "restored",
		);
		expect(restoredEvent).toBeDefined();
	});

	it("returns 404 when restoring non-deleted app", async () => {
		const { body: created } = await createApp({
			companyName: "NotDeletedCo",
			roleTitle: "Eng",
		});

		// Try to restore without deleting first
		const res = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/restore`,
			{ method: "PATCH", headers: headers() },
		);
		expect(res.status).toBe(404);
	});
});
