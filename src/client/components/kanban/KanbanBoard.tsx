import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { APPLICATION_STATUSES } from "@/shared/constants";
import type { ApplicationStatus } from "@/shared/constants";
import { useApplicationsByStatus, useUpdateStatus } from "@/client/hooks/useApplications";
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
	const updateStatus = useUpdateStatus();

	function handleDragEnd(result: DropResult) {
		const { destination, source, draggableId } = result;
		// No destination = dropped outside any droppable
		if (!destination) return;
		// Same column, same index = no change
		if (destination.droppableId === source.droppableId && destination.index === source.index) return;
		// Different column = status change (optimistic)
		if (destination.droppableId !== source.droppableId) {
			updateStatus.mutate({
				id: draggableId,
				status: destination.droppableId as ApplicationStatus,
			});
		}
	}

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
			{/* Desktop: CSS grid with DragDropContext -- hidden on mobile */}
			<div className="hidden p-4 md:block md:p-6">
				<DragDropContext onDragEnd={handleDragEnd}>
					<div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2">
						{APPLICATION_STATUSES.map((status) => (
							<KanbanColumn
								key={status}
								status={status}
								apps={grouped.get(status) ?? []}
							/>
						))}
					</div>
				</DragDropContext>
			</div>

			{/* Mobile: collapsible sections (no DnD) -- hidden on desktop */}
			<div className="md:hidden">
				<MobileKanban grouped={grouped} />
			</div>
		</>
	);
}
