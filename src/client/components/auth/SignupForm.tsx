import { type FormEvent, useState } from "react";
import { authClient } from "../../lib/auth-client";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/Toast";

export function SignupForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const { showToast } = useToast();

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await authClient.signUp.email({
				email,
				password,
				name,
			});

			if (result.error) {
				const status = result.error.status;

				if (status && status >= 500) {
					showToast("Something went wrong. Please try again later.");
				} else {
					setError(
						result.error.message || "Email already registered",
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
					Check your email
				</h3>
				<p className="text-sm text-stone-500">
					We sent a verification link to <strong>{email}</strong>.
					Please verify your email to complete signup.
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
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="Name"
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Your name"
					required
					autoComplete="name"
				/>
				<Input
					label="Email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@example.com"
					required
					autoComplete="email"
				/>
				<Input
					label="Password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="At least 8 characters"
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
					Create account
				</Button>
			</form>

			<p className="text-center text-sm text-stone-500">
				Already have an account?{" "}
				<a
					href="/login"
					className="font-medium text-stone-700 hover:text-stone-900"
				>
					Log in
				</a>
			</p>
		</div>
	);
}
