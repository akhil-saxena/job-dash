import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/$slug")({
	component: AppDetailPage,
});

function AppDetailPage() {
	const { slug } = Route.useParams();

	return (
		<div className="p-6">
			<h1 className="text-xl font-semibold text-text-primary dark:text-dark-accent">
				Application Detail
			</h1>
			<p className="mt-2 text-text-secondary">
				Application: {slug} — Detail page coming in Phase 4
			</p>
		</div>
	);
}
