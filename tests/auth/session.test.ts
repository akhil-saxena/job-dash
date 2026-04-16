import { describe, it, expect } from "vitest";
import { SELF, env } from "cloudflare:test";

describe("Session persistence (AUTH-03)", () => {
	it("session cookie from sign-in allows access to protected endpoints", async () => {
		// Sign up first
		const signupResponse = await SELF.fetch(
			"http://localhost/api/auth/sign-up/email",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "Session User",
					email: "session@example.com",
					password: "password-123",
				}),
			},
		);

		expect(signupResponse.status).toBe(200);

		// D-16: Email verification is required before sign-in.
		// Programmatically verify the email via D1 to simulate clicking the verification link.
		await env.DB.prepare(
			"UPDATE `user` SET `email_verified` = 1 WHERE `email` = ?",
		)
			.bind("session@example.com")
			.run();

		// Sign in to get session cookie
		const loginResponse = await SELF.fetch(
			"http://localhost/api/auth/sign-in/email",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "session@example.com",
					password: "password-123",
				}),
			},
		);

		expect(loginResponse.status).toBe(200);
		const cookies = loginResponse.headers.get("set-cookie");
		expect(cookies).toBeTruthy();

		// Use cookie to access protected endpoint
		if (cookies) {
			const meResponse = await SELF.fetch("http://localhost/api/me", {
				headers: { Cookie: cookies },
			});
			expect(meResponse.status).toBe(200);
			const body = (await meResponse.json()) as { userId: string };
			expect(body).toHaveProperty("userId");
		}
	});
});
