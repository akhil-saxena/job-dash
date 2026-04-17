import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/list")({
	component: ListPage,
});

function ListPage() {
	return (
		<div className="p-6">
			<h1 className="text-xl font-semibold text-text-primary dark:text-dark-accent">
				List View
			</h1>
			<p className="mt-2 text-text-secondary">Table view coming in Phase 4</p>
		</div>
	);
}
