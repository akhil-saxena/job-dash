import { Droppable } from "@hello-pangea/dnd";
import type { ApplicationStatus } from "@/shared/constants";
import type { Application } from "@/client/hooks/useApplications";
import { ColumnHeader } from "@/client/components/design-system/ColumnHeader";
import { KanbanCard } from "./KanbanCard";

const COLUMN_GRADIENTS: Partial<Record<ApplicationStatus, string>> = {
	wishlist: "rgba(168,162,158,.06)",
	applied: "rgba(59,130,246,.06)",
	screening: "rgba(139,92,246,.06)",
	interviewing: "rgba(245,158,11,.06)",
	offer: "rgba(34,197,94,.06)",
};

interface KanbanColumnProps {
	status: ApplicationStatus;
	apps: Application[];
	label?: string;
	count?: number;
	showHeader?: boolean;
	onAddCard?: () => void;
	deadlineMap?: Map<string, Array<{ deadlineType: string; dueAt: number; isCompleted: number }>>;
}

export function KanbanColumn({ status, apps, label, count, showHeader = true, onAddCard, deadlineMap }: KanbanColumnProps) {
	const gradient = COLUMN_GRADIENTS[status] ?? "transparent";

	return (
		<div
			className="flex min-h-[200px] flex-col gap-2"
			style={{
				background: `linear-gradient(to bottom, ${gradient} 0%, transparent 120px)`,
			}}
		>
			{showHeader && (
				<ColumnHeader status={status} count={count ?? apps.length} label={label} />
			)}

			{/* Droppable card list */}
			<Droppable droppableId={status}>
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className={`flex flex-1 flex-col gap-2 rounded-lg p-1 transition-colors ${
							snapshot.isDraggingOver ? "bg-black/[0.03] dark:bg-white/[0.04]" : ""
						}`}
					>
						{apps.map((app, index) => (
							<KanbanCard key={app.id} app={app} index={index} deadlines={deadlineMap?.get(app.id)} />
						))}
						{provided.placeholder}

						{/* Add card placeholder button */}
						<button
							type="button"
							onClick={onAddCard}
							className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-black/[0.1] py-2 text-[11px] font-medium text-text-muted transition-colors hover:border-amber-400 hover:text-amber-600 dark:border-white/[0.1] dark:text-dark-accent/40 dark:hover:border-amber-500 dark:hover:text-amber-400"
						>
							<span className="text-sm">+</span> Add
						</button>
					</div>
				)}
			</Droppable>
		</div>
	);
}
