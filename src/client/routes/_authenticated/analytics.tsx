import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/analytics")({
	component: AnalyticsPage,
});

function AnalyticsPage() {
	return (
		<div className="p-6">
			<h1 className="text-xl font-semibold text-text-primary dark:text-dark-accent">
				Analytics
			</h1>
			<p className="mt-2 text-text-secondary">
				Analytics dashboard coming in Phase 8
			</p>
		</div>
	);
}
