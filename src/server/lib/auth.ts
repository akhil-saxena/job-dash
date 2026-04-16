import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import crypto from "node:crypto";
import * as schema from "../../db/schema";
import { nanoid } from "nanoid";
import type { CloudflareBindings } from "../../shared/types";
import { createEmailSender } from "./email";

const SCRYPT_PARAMS = { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 };

async function hashPassword(password: string): Promise<string> {
	const salt = crypto.randomBytes(16);
	const key = crypto.scryptSync(
		password.normalize("NFKC"),
		salt,
		64,
		SCRYPT_PARAMS,
	);
	return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function verifyPassword({
	hash,
	password,
}: { hash: string; password: string }): Promise<boolean> {
	const [saltHex, keyHex] = hash.split(":");
	if (!saltHex || !keyHex) return false;
	const key = crypto.scryptSync(
		password.normalize("NFKC"),
		Buffer.from(saltHex, "hex"),
		64,
		SCRYPT_PARAMS,
	);
	return crypto.timingSafeEqual(key, Buffer.from(keyHex, "hex"));
}

export function createAuth(env: CloudflareBindings) {
	const db = drizzle(env.DB, { schema });
	const emailSender = createEmailSender(env.RESEND_API_KEY);

	return betterAuth({
		baseURL: env.BETTER_AUTH_URL,
		basePath: "/api/auth",
		secret: env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema,
		}),
		advanced: {
			database: {
				generateId: () => nanoid(),
			},
			defaultCookieAttributes: {
				httpOnly: true,
				secure: true,
				sameSite: "lax" as const,
			},
		},
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
			password: {
				hash: hashPassword,
				verify: verifyPassword,
			},
			sendResetPassword: async ({ user, url }) => {
				emailSender.sendPasswordResetEmail(user.email, url);
			},
		},
		emailVerification: {
			sendVerificationEmail: async ({ user, url }) => {
				emailSender.sendVerificationEmail(user.email, url);
			},
		},
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
				prompt: "select_account",
			},
		},
		session: {
			expiresIn: 60 * 60 * 24 * 7, // 7 days
			updateAge: 60 * 60 * 24, // Refresh after 1 day
		},
		trustedOrigins: [env.BETTER_AUTH_URL],
	});
}

export type Auth = ReturnType<typeof createAuth>;
