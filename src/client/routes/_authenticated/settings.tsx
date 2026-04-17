import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	return (
		<div className="p-6">
			<h1 className="text-xl font-semibold text-text-primary dark:text-dark-accent">
				Settings
			</h1>
			<p className="mt-2 text-text-secondary">Settings coming in Phase 9</p>
		</div>
	);
}
