import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/calendar")({
	component: CalendarPage,
});

function CalendarPage() {
	return (
		<div className="p-6">
			<h1 className="text-xl font-semibold text-text-primary dark:text-dark-accent">
				Calendar
			</h1>
			<p className="mt-2 text-text-secondary">Calendar view coming in Phase 8</p>
		</div>
	);
}
