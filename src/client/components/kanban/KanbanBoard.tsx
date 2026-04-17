import { APPLICATION_STATUSES } from "@/shared/constants";
import { useApplicationsByStatus } from "@/client/hooks/useApplications";
import { Button } from "@/client/components/design-system/Button";
import { KanbanColumn } from "./KanbanColumn";
import { MobileKanban } from "./MobileKanban";

function BoardSkeleton() {
	return (
		<div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2 p-4 md:p-6">
			{Array.from({ length: 8 }).map((_, i) => (
				<div key={`skeleton-${i}`} className="flex flex-col gap-2">
					{/* Header skeleton */}
					<div className="h-9 rounded-[var(--radius-card)] bg-black/[0.04] dark:bg-white/[0.06]" />
					{/* Card skeletons */}
					<div className="h-16 rounded-[var(--radius-card)] bg-black/[0.03] dark:bg-white/[0.04]" />
					<div className="h-16 rounded-[var(--radius-card)] bg-black/[0.02] dark:bg-white/[0.03]" />
				</div>
			))}
		</div>
	);
}

export function KanbanBoard() {
	const { grouped, isLoading, isError, refetch } = useApplicationsByStatus();

	if (isLoading) {
		return <BoardSkeleton />;
	}

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 p-12">
				<p className="text-sm text-text-secondary dark:text-dark-accent/60">
					Something went wrong. Try again.
				</p>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					Retry
				</Button>
			</div>
		);
	}

	return (
		<>
			{/* Desktop: CSS grid (D-13) -- hidden on mobile */}
			<div className="hidden p-4 md:block md:p-6">
				<div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2">
					{APPLICATION_STATUSES.map((status) => (
						<KanbanColumn
							key={status}
							status={status}
							apps={grouped.get(status) ?? []}
						/>
					))}
				</div>
			</div>

			{/* Mobile: collapsible sections (D-19) -- hidden on desktop */}
			<div className="md:hidden">
				<MobileKanban grouped={grouped} />
			</div>
		</>
	);
}
