import { type FormEvent, useState } from "react";
import { authClient } from "../../lib/auth-client";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/Toast";

export function RequestResetForm() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);
	const { showToast } = useToast();

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await authClient.forgetPassword({
				email,
				redirectTo: "/reset-password",
			});

			if (result.error) {
				const status = result.error.status;

				if (status && status >= 500) {
					showToast("Something went wrong. Please try again later.");
				} else {
					setError(result.error.message || "Unable to send reset email");
				}
			} else {
				setSent(true);
			}
		} catch {
			showToast("Network error. Please check your connection.");
		} finally {
			setLoading(false);
		}
	}

	if (sent) {
		return (
			<div className="space-y-4 text-center">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
					<svg
						className="h-6 w-6 text-stone-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-medium text-stone-800">Check your email</h3>
				<p className="text-sm text-stone-500">
					If an account exists for <strong>{email}</strong>, a password reset
					link has been sent.
				</p>
				<a
					href="/login"
					className="inline-block text-sm font-medium text-stone-700 hover:text-stone-900"
				>
					Back to login
				</a>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<p className="text-sm text-stone-500">
				Enter your email address and we'll send you a link to reset your
				password.
			</p>

			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="Email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@example.com"
					required
					autoComplete="email"
				/>

				{error && (
					<p className="text-sm text-red-600">{error}</p>
				)}

				<Button
					type="submit"
					size="lg"
					className="w-full"
					loading={loading}
				>
					Send reset link
				</Button>
			</form>

			<p className="text-center text-sm text-stone-500">
				<a
					href="/login"
					className="font-medium text-stone-700 hover:text-stone-900"
				>
					Back to login
				</a>
			</p>
		</div>
	);
}
