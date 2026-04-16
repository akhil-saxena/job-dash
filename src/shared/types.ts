export interface CloudflareBindings {
	DB: D1Database;
	BETTER_AUTH_URL: string;
	BETTER_AUTH_SECRET: string;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	RESEND_API_KEY: string;
}

export type AppEnv = {
	Bindings: CloudflareBindings;
	Variables: {
		userId: string;
		session: {
			user: { id: string; email: string; name: string };
			session: { id: string };
		};
	};
};
