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

/** Core statuses — the main pipeline most people use */
const CORE_STATUSES: ApplicationStatus[] = [
	"applied",
	"interviewing",
	"offer",
];

/** Secondary statuses — only show if they have applications */
const SECONDARY_STATUSES: ApplicationStatus[] = [
	"wishlist",
	"screening",
	"accepted",
	"rejected",
	"withdrawn",
];

function getVisibleStatuses(
	grouped: Map<ApplicationStatus, unknown[]>,
): ApplicationStatus[] {
	const visible: ApplicationStatus[] = [...CORE_STATUSES];
	for (const status of SECONDARY_STATUSES) {
		if ((grouped.get(status)?.length ?? 0) > 0) {
			visible.push(status);
		}
	}
	return visible;
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

	const visibleStatuses = getVisibleStatuses(grouped);

	return (
		<>
			{/* Desktop: horizontal scrollable columns with DragDropContext */}
			<div className="hidden p-4 md:block md:p-6">
				<DragDropContext onDragEnd={handleDragEnd}>
					<div className="flex gap-3">
						{visibleStatuses.map((status) => (
							<div
								key={status}
								className="min-w-0 flex-1"
							>
								<KanbanColumn
									status={status}
									apps={grouped.get(status) ?? []}
								/>
							</div>
						))}
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
