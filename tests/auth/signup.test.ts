import { describe, it, expect } from "vitest";
import { SELF, env } from "cloudflare:test";

describe("Email/password signup (AUTH-01)", () => {
	it("POST /api/auth/sign-up/email creates a new user", async () => {
		const response = await SELF.fetch(
			"http://localhost/api/auth/sign-up/email",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "Test User",
					email: "test@example.com",
					password: "secure-password-123",
				}),
			},
		);

		// better-auth returns 200 on successful signup
		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			user: { email: string; name: string };
		};
		expect(body).toHaveProperty("user");
		expect(body.user).toHaveProperty("email", "test@example.com");
		expect(body.user).toHaveProperty("name", "Test User");
	});

	it("POST /api/auth/sign-up/email rejects duplicate email", async () => {
		// First signup
		await SELF.fetch("http://localhost/api/auth/sign-up/email", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "First User",
				email: "duplicate@example.com",
				password: "password-123",
			}),
		});

		// Count users with this email before second signup attempt
		const beforeCount = await env.DB.prepare(
			"SELECT COUNT(*) as cnt FROM `user` WHERE `email` = ?",
		)
			.bind("duplicate@example.com")
			.first<{ cnt: number }>();

		// Second signup with same email
		await SELF.fetch("http://localhost/api/auth/sign-up/email", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Second User",
				email: "duplicate@example.com",
				password: "password-456",
			}),
		});

		// Verify at the database level: only one user with this email should exist
		// better-auth enforces uniqueness via the UNIQUE index on user.email
		const afterCount = await env.DB.prepare(
			"SELECT COUNT(*) as cnt FROM `user` WHERE `email` = ?",
		)
			.bind("duplicate@example.com")
			.first<{ cnt: number }>();

		expect(beforeCount?.cnt).toBe(1);
		expect(afterCount?.cnt).toBe(1);
	});
});
