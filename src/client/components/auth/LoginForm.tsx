import { type FormEvent, useState } from "react";
import { authClient } from "../../lib/auth-client";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/Toast";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
	const { showToast } = useToast();

	async function handleEmailLogin(e: FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await authClient.signIn.email({ email, password });

			if (result.error) {
				const status = result.error.status;

				if (status === 429) {
					const retryAfter = 30;
					setRateLimitSeconds(retryAfter);
					const interval = setInterval(() => {
						setRateLimitSeconds((prev) => {
							if (prev <= 1) {
								clearInterval(interval);
								return 0;
							}
							return prev - 1;
						});
					}, 1000);
				} else if (status && status >= 500) {
					showToast("Something went wrong. Please try again later.");
				} else {
					setError(result.error.message || "Invalid email or password");
				}
			} else {
				window.location.href = "/dashboard";
			}
		} catch {
			showToast("Network error. Please check your connection.");
		} finally {
			setLoading(false);
		}
	}

	function handleGoogleLogin() {
		authClient.signIn.social({ provider: "google" });
	}

	return (
		<div className="space-y-6">
			<Button
				variant="google"
				size="lg"
				className="w-full"
				onClick={handleGoogleLogin}
				type="button"
			>
				<svg width="20" height="20" viewBox="0 0 24 24">
					<path
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
						fill="#4285F4"
					/>
					<path
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						fill="#34A853"
					/>
					<path
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						fill="#FBBC05"
					/>
					<path
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						fill="#EA4335"
					/>
				</svg>
				Continue with Google
			</Button>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-stone-200" />
				</div>
				<div className="relative flex justify-center text-sm">
					<span className="bg-white px-2 text-stone-400">or</span>
				</div>
			</div>

			<form onSubmit={handleEmailLogin} className="space-y-4">
				<Input
					label="Email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@example.com"
					required
					autoComplete="email"
				/>
				<div>
					<Input
						label="Password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter your password"
						required
						autoComplete="current-password"
					/>
					<div className="mt-1 text-right">
						<a
							href="/reset-password"
							className="text-sm text-stone-500 hover:text-stone-700"
						>
							Forgot password?
						</a>
					</div>
				</div>

				{error && (
					<p className="text-sm text-red-600">{error}</p>
				)}

				{rateLimitSeconds > 0 && (
					<p className="text-sm text-amber-600">
						Too many attempts. Try again in {rateLimitSeconds}s
					</p>
				)}

				<Button
					type="submit"
					size="lg"
					className="w-full"
					loading={loading}
					disabled={rateLimitSeconds > 0}
				>
					Sign in
				</Button>
			</form>

			<p className="text-center text-sm text-stone-500">
				Don't have an account?{" "}
				<a href="/signup" className="font-medium text-stone-700 hover:text-stone-900">
					Sign up
				</a>
			</p>
		</div>
	);
}
