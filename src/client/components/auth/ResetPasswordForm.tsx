import { type FormEvent, useState } from "react";
import { authClient } from "../../lib/auth-client";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/Toast";

export function ResetPasswordForm() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const { showToast } = useToast();

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setLoading(true);

		try {
			const result = await authClient.resetPassword({
				newPassword: password,
			});

			if (result.error) {
				const status = result.error.status;

				if (status && status >= 500) {
					showToast("Something went wrong. Please try again later.");
				} else {
					setError(
						result.error.message ||
							"Reset link is invalid or expired. Please request a new one.",
					);
				}
			} else {
				setSuccess(true);
			}
		} catch {
			showToast("Network error. Please check your connection.");
		} finally {
			setLoading(false);
		}
	}

	if (success) {
		return (
			<div className="space-y-4 text-center">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
					<svg
						className="h-6 w-6 text-green-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-medium text-stone-800">
					Password reset!
				</h3>
				<p className="text-sm text-stone-500">
					Your password has been updated. You can now log in with your new
					password.
				</p>
				<a
					href="/login"
					className="inline-block rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
				>
					Go to login
				</a>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="New password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="At least 8 characters"
					required
					minLength={8}
					autoComplete="new-password"
				/>
				<Input
					label="Confirm password"
					type="password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					placeholder="Repeat your password"
					required
					minLength={8}
					autoComplete="new-password"
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
					Reset password
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
