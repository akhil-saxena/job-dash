import { describe, it, expect, beforeAll } from "vitest";
import { SELF, env } from "cloudflare:test";

// ---------------------------------------------------------------------------
// Auth helper: use better-auth sign-up + sign-in to get a real session
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
		"Status User",
		"status-user@test.com",
		"password-status-123",
	);
});

// ---------------------------------------------------------------------------
// Status enum validation -- TRACK-06
// ---------------------------------------------------------------------------

describe("status enum validation", () => {
	const ALL_STATUSES = [
		"wishlist",
		"applied",
		"screening",
		"interviewing",
		"offer",
		"accepted",
		"rejected",
		"withdrawn",
	];

	it("accepts all valid status values", async () => {
		for (const status of ALL_STATUSES) {
			const { status: httpStatus, body } = await createApp({
				companyName: `StatusCo-${status}`,
				roleTitle: "Eng",
				status,
			});
			expect(httpStatus).toBe(201);
			expect(body.data.status).toBe(status);
		}
	});

	it("rejects invalid status value", async () => {
		const { status } = await createApp({
			companyName: "InvalidStatusCo",
			roleTitle: "Eng",
			status: "pending",
		});
		expect(status).toBe(400);
	});
});

// ---------------------------------------------------------------------------
// PATCH /api/applications/:id/status -- TRACK-07
// ---------------------------------------------------------------------------

describe("PATCH /api/applications/:id/status", () => {
	it("changes status and returns updated app", async () => {
		const { body: created } = await createApp({
			companyName: "StatusChangeCo",
			roleTitle: "Dev",
		});
		expect(created.data.status).toBe("wishlist");

		const res = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/status`,
			{
				method: "PATCH",
				headers: headers(),
				body: JSON.stringify({ status: "applied" }),
			},
		);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.data.status).toBe("applied");
	});

	it("any-to-any transition allowed", async () => {
		// Create with "offer" status
		const { body: created } = await createApp({
			companyName: "AnyToAnyCo",
			roleTitle: "Eng",
			status: "offer",
		});

		// Change directly to "wishlist" (backwards transition)
		const res = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/status`,
			{
				method: "PATCH",
				headers: headers(),
				body: JSON.stringify({ status: "wishlist" }),
			},
		);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.data.status).toBe("wishlist");
	});

	it("generates status_change timeline event", async () => {
		const { body: created } = await createApp({
			companyName: "TimelineStatusCo",
			roleTitle: "Eng",
		});

		// Change status
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/status`,
			{
				method: "PATCH",
				headers: headers(),
				body: JSON.stringify({ status: "applied" }),
			},
		);

		const events = await getTimeline(created.data.id);
		const statusEvent = events.find(
			(e: any) => e.eventType === "status_change",
		);
		expect(statusEvent).toBeDefined();
		const metadata = JSON.parse(statusEvent.metadata);
		expect(metadata.from).toBe("wishlist");
		expect(metadata.to).toBe("applied");
	});

	it("no-op when status unchanged", async () => {
		const { body: created } = await createApp({
			companyName: "NoOpStatusCo",
			roleTitle: "Eng",
			status: "applied",
		});

		// Change to same status
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/status`,
			{
				method: "PATCH",
				headers: headers(),
				body: JSON.stringify({ status: "applied" }),
			},
		);

		// Should only have the "created" event, no status_change
		const events = await getTimeline(created.data.id);
		expect(events).toHaveLength(1);
		expect(events[0].eventType).toBe("created");
	});

	it("returns 404 for soft-deleted app", async () => {
		const { body: created } = await createApp({
			companyName: "DeletedStatusCo",
			roleTitle: "Eng",
		});

		// Soft-delete it
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}`,
			{ method: "DELETE", headers: headers() },
		);

		// Try to change status -- should 404
		const res = await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/status`,
			{
				method: "PATCH",
				headers: headers(),
				body: JSON.stringify({ status: "applied" }),
			},
		);
		expect(res.status).toBe(404);
	});
});

// ---------------------------------------------------------------------------
// Timeline events -- TRACK-08, D-09
// ---------------------------------------------------------------------------

describe("timeline events", () => {
	it("create generates created event", async () => {
		const { body: created } = await createApp({
			companyName: "TimelineCreateCo",
			roleTitle: "Eng",
		});

		const events = await getTimeline(created.data.id);
		expect(events).toHaveLength(1);
		expect(events[0].eventType).toBe("created");
	});

	it("status change generates event with from/to metadata", async () => {
		const { body: created } = await createApp({
			companyName: "MetadataCo",
			roleTitle: "Eng",
		});

		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/status`,
			{
				method: "PATCH",
				headers: headers(),
				body: JSON.stringify({ status: "screening" }),
			},
		);

		const events = await getTimeline(created.data.id);
		const statusEvent = events.find(
			(e: any) => e.eventType === "status_change",
		);
		expect(statusEvent).toBeDefined();
		const metadata = JSON.parse(statusEvent.metadata);
		expect(metadata.from).toBe("wishlist");
		expect(metadata.to).toBe("screening");
	});

	it("multiple status changes generate multiple events", async () => {
		const { body: created } = await createApp({
			companyName: "MultiStatusCo",
			roleTitle: "Eng",
		});

		// First status change
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/status`,
			{
				method: "PATCH",
				headers: headers(),
				body: JSON.stringify({ status: "applied" }),
			},
		);

		// Second status change
		await SELF.fetch(
			`http://localhost/api/applications/${created.data.id}/status`,
			{
				method: "PATCH",
				headers: headers(),
				body: JSON.stringify({ status: "interviewing" }),
			},
		);

		const events = await getTimeline(created.data.id);
		// 1 created + 2 status_change = 3 events
		expect(events).toHaveLength(3);

		const statusChanges = events.filter(
			(e: any) => e.eventType === "status_change",
		);
		expect(statusChanges).toHaveLength(2);
	});
});
