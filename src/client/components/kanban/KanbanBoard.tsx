import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { APPLICATION_STATUSES } from "@/shared/constants";
import type { ApplicationStatus } from "@/shared/constants";
import {
	useApplicationsByStatus,
	useUpdateStatus,
} from "@/client/hooks/useApplications";
import { Button } from "@/client/components/design-system/Button";
import { KanbanColumn } from "./KanbanColumn";
import { MobileKanban } from "./MobileKanban";

/** Always-visible columns */
const CORE_STATUSES: ApplicationStatus[] = [
	"wishlist",
	"applied",
	"screening",
	"interviewing",
	"offer",
];

/** Grouped as "Closed" — show as one column if any have apps */
const CLOSED_STATUSES: ApplicationStatus[] = [
	"accepted",
	"rejected",
	"withdrawn",
];

export type VisibleColumn =
	| { type: "status"; status: ApplicationStatus }
	| { type: "closed"; statuses: ApplicationStatus[] };

function getVisibleColumns(
	grouped: Map<ApplicationStatus, unknown[]>,
): VisibleColumn[] {
	const columns: VisibleColumn[] = CORE_STATUSES.map((s) => ({
		type: "status" as const,
		status: s,
	}));

	const hasAnyClosed = CLOSED_STATUSES.some(
		(s) => (grouped.get(s)?.length ?? 0) > 0,
	);
	if (hasAnyClosed) {
		columns.push({ type: "closed", statuses: CLOSED_STATUSES });
	}

	return columns;
}

function BoardSkeleton() {
	return (
		<div className="flex gap-3 p-4 md:p-6">
			{Array.from({ length: 3 }).map((_, i) => (
				<div
					key={`skeleton-${i}`}
					className="flex min-w-0 flex-1 flex-col gap-2"
				>
					<div className="h-9 rounded-lg bg-black/[0.04] dark:bg-white/[0.06]" />
					<div className="h-20 rounded-lg bg-black/[0.03] dark:bg-white/[0.04]" />
					<div className="h-20 rounded-lg bg-black/[0.02] dark:bg-white/[0.03]" />
				</div>
			))}
		</div>
	);
}

export function KanbanBoard() {
	const { grouped, isLoading, isError, refetch } =
		useApplicationsByStatus();
	const updateStatus = useUpdateStatus();

	function handleDragEnd(result: DropResult) {
		const { destination, source, draggableId } = result;
		if (!destination) return;
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		)
			return;
		if (destination.droppableId !== source.droppableId) {
			updateStatus.mutate({
				id: draggableId,
				status: destination.droppableId as ApplicationStatus,
			});
		}
	}

	if (isLoading) return <BoardSkeleton />;

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

	const visibleColumns = getVisibleColumns(grouped);

	return (
		<>
			{/* Desktop: columns fill full width with DragDropContext */}
			<div className="hidden p-4 md:block md:p-6">
				<DragDropContext onDragEnd={handleDragEnd}>
					<div className="flex gap-3">
						{visibleColumns.map((col) => {
							if (col.type === "status") {
								return (
									<div key={col.status} className="min-w-0 flex-1">
										<KanbanColumn
											status={col.status}
											apps={grouped.get(col.status) ?? []}
										/>
									</div>
								);
							}
							// Closed group — merge accepted/rejected/withdrawn into one column
							const closedApps = col.statuses.flatMap(
								(s) => grouped.get(s) ?? [],
							);
							const closedCount = closedApps.length;
							return (
								<div key="closed" className="min-w-0 flex-1 opacity-60">
									<KanbanColumn
										status="rejected"
										label="Closed"
										count={closedCount}
										apps={closedApps}
									/>
								</div>
							);
						})}
					</div>
				</DragDropContext>
			</div>

			{/* Mobile: collapsible sections (no DnD) */}
			<div className="md:hidden">
				<MobileKanban grouped={grouped} />
			</div>
		</>
	);
}
