import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";

describe("Google OAuth flow (AUTH-02)", () => {
	it("POST /api/auth/sign-in/social with provider=google returns a redirect URL", async () => {
		// Initiate the OAuth flow -- better-auth should return a redirect to Google
		const response = await SELF.fetch(
			"http://localhost/api/auth/sign-in/social",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					provider: "google",
					callbackURL: "http://localhost/auth/callback",
				}),
				redirect: "manual",
			},
		);

		// better-auth returns a JSON body with url (redirect target) or a 302 redirect
		// Either way, the response should indicate a redirect to Google's OAuth consent
		if (response.status === 200) {
			const body = (await response.json()) as { url: string };
			// better-auth returns { url: "https://accounts.google.com/o/oauth2/..." }
			expect(body).toHaveProperty("url");
			expect(body.url).toContain("accounts.google.com");
		} else {
			// 302 redirect
			expect(response.status).toBe(302);
			const location = response.headers.get("location");
			expect(location).toContain("accounts.google.com");
		}
	});

	it("GET /api/auth/callback/google without valid code returns error (not crash)", async () => {
		// Simulate a callback with no valid code -- should fail gracefully, not 500
		const response = await SELF.fetch(
			"http://localhost/api/auth/callback/google?code=invalid&state=fake",
			{ redirect: "manual" },
		);

		// Should not be a 500 server error -- either a redirect to error page or 4xx
		expect(response.status).not.toBe(500);
	});
});
