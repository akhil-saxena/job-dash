import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { APPLICATION_STATUSES } from "@/shared/constants";
import type { ApplicationStatus } from "@/shared/constants";
import {
	useApplicationsByStatus,
	useUpdateStatus,
} from "@/client/hooks/useApplications";
import { Button } from "@/client/components/design-system/Button";
import { ColumnHeader } from "@/client/components/design-system/ColumnHeader";
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

	// Build flat list of { status, label, apps, dimmed } for rendering
	const columns = visibleColumns.map((col) => {
		if (col.type === "status") {
			return {
				key: col.status,
				status: col.status as ApplicationStatus,
				label: undefined as string | undefined,
				apps: grouped.get(col.status) ?? [],
				dimmed: false,
			};
		}
		const closedApps = col.statuses.flatMap((s) => grouped.get(s) ?? []);
		return {
			key: "closed",
			status: "rejected" as ApplicationStatus,
			label: "Closed",
			apps: closedApps,
			dimmed: true,
		};
	});

	return (
		<>
			{/* Desktop */}
			<div className="relative hidden min-h-[calc(100vh-64px)] overflow-hidden md:block"
				style={{
					backgroundColor: "#f5f3f0",
					backgroundImage: "radial-gradient(circle, rgba(41,37,36,0.13) 1px, transparent 1.2px)",
					backgroundSize: "16px 16px",
				}}
			>
				{/* SVG arc rings from bottom-right */}
				<svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
					<defs>
						<radialGradient id="arcFade" cx="100%" cy="100%" r="120%">
							<stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
							<stop offset="60%" stopColor="#f59e0b" stopOpacity="0.10" />
							<stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
						</radialGradient>
					</defs>
					<g fill="none" stroke="url(#arcFade)" strokeWidth="1.5">
						<circle cx="1600" cy="900" r="260" />
						<circle cx="1600" cy="900" r="420" />
						<circle cx="1600" cy="900" r="600" />
						<circle cx="1600" cy="900" r="800" />
						<circle cx="1600" cy="900" r="1020" />
						<circle cx="1600" cy="900" r="1260" />
					</g>
				</svg>

				<div className="relative z-10">
				<DragDropContext onDragEnd={handleDragEnd}>
					{/* Header row — all status labels inline */}
					<div className="flex gap-3 px-6 py-3">
						{columns.map((col) => (
							<div key={col.key} className={`min-w-0 flex-1 ${col.dimmed ? "opacity-50" : ""}`}>
								<ColumnHeader
									status={col.status}
									count={col.apps.length}
									label={col.label}
								/>
							</div>
						))}
					</div>

					{/* Card columns */}
					<div className="flex gap-3 px-6 pt-3 pb-6">
						{columns.map((col) => (
							<div key={col.key} className={`min-w-0 flex-1 ${col.dimmed ? "opacity-50" : ""}`}>
								<KanbanColumn
									status={col.status}
									apps={col.apps}
									showHeader={false}
								/>
							</div>
						))}
					</div>
				</DragDropContext>
				</div>
			</div>

			{/* Mobile: collapsible sections (no DnD) */}
			<div className="md:hidden">
				<MobileKanban grouped={grouped} />
			</div>
		</>
	);
}
