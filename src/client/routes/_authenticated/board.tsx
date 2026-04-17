import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/board")({
	component: BoardPage,
});

function BoardPage() {
	return (
		<div className="p-6">
			<h1 className="text-xl font-semibold text-text-primary dark:text-dark-accent">
				Board
			</h1>
			<p className="mt-2 text-text-secondary">Kanban board coming in Plan 03</p>
		</div>
	);
}
