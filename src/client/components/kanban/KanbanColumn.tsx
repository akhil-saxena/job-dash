import { Droppable } from "@hello-pangea/dnd";
import type { ApplicationStatus } from "@/shared/constants";
import type { Application } from "@/client/hooks/useApplications";
import { ColumnHeader } from "@/client/components/design-system/ColumnHeader";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
	status: ApplicationStatus;
	apps: Application[];
	label?: string;
	count?: number;
	showHeader?: boolean;
}

export function KanbanColumn({ status, apps, label, count, showHeader = true }: KanbanColumnProps) {
	return (
		<div className="flex min-h-[200px] flex-col gap-2">
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
							<KanbanCard key={app.id} app={app} index={index} />
						))}
						{provided.placeholder}
					</div>
				)}
			</Droppable>

			{/* Empty columns just show the droppable area — no text needed */}
		</div>
	);
}
