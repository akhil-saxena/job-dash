import { defineConfig } from "vitest/config";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";

export default defineConfig({
	test: {
		globals: true,
		setupFiles: ["./tests/setup.ts"],
	},
	plugins: [
		cloudflareTest({
			main: "./worker/index.ts",
			wrangler: {
				configPath: "./wrangler.jsonc",
			},
			miniflare: {
				d1Databases: ["DB"],
				bindings: {
					BETTER_AUTH_SECRET: "test-secret-for-vitest-only-not-production",
					BETTER_AUTH_URL: "http://localhost",
					GOOGLE_CLIENT_ID: "test-google-client-id.apps.googleusercontent.com",
					GOOGLE_CLIENT_SECRET: "test-google-client-secret",
					RESEND_API_KEY: "re_test_fake_key_for_testing",
				},
			},
		}),
	],
});
