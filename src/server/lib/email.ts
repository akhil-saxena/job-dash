import { Resend } from "resend";

export function createEmailSender(apiKey: string) {
	const resend = new Resend(apiKey);
	const fromAddress = "JobDash <onboarding@resend.dev>";

	return {
		sendVerificationEmail(to: string, url: string) {
			resend.emails
				.send({
					from: fromAddress,
					to,
					subject: "Verify your email address",
					html: `<p>Click the link to verify your email: <a href="${url}">Verify Email</a></p>`,
				})
				.catch((err) =>
					console.error("Failed to send verification email:", err),
				);
		},
		sendPasswordResetEmail(to: string, url: string) {
			resend.emails
				.send({
					from: fromAddress,
					to,
					subject: "Reset your password",
					html: `<p>Click the link to reset your password: <a href="${url}">Reset Password</a></p>`,
				})
				.catch((err) =>
					console.error("Failed to send reset email:", err),
				);
		},
	};
}
