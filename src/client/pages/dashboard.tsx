import { authClient } from "../lib/auth-client";

export function DashboardPage() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-stone-50">
				<p className="text-stone-500">Loading...</p>
			</div>
		);
	}

	if (!session) {
		window.location.href = "/login";
		return null;
	}

	return (
		<div className="min-h-screen bg-stone-50 p-8">
			<div className="mx-auto max-w-2xl">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
						<p className="text-stone-500">Welcome, {session.user.name}</p>
					</div>
					<button
						type="button"
						onClick={() =>
							authClient.signOut().then(() => {
								window.location.href = "/login";
							})
						}
						className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100"
					>
						Sign out
					</button>
				</div>
				<div className="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
					<p className="text-stone-600">
						Your job tracking dashboard will appear here in Phase 3.
					</p>
				</div>
			</div>
		</div>
	);
}
