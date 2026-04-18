import { Droppable } from "@hello-pangea/dnd";
import type { ApplicationStatus } from "@/shared/constants";
import type { Application } from "@/client/hooks/useApplications";
import { ColumnHeader } from "@/client/components/design-system/ColumnHeader";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
	status: ApplicationStatus;
	apps: Application[];
}

export function KanbanColumn({ status, apps }: KanbanColumnProps) {
	return (
		<div className="flex min-h-[200px] flex-col gap-2">
			{/* Column header stays OUTSIDE the Droppable */}
			<ColumnHeader status={status} count={apps.length} variant="filled" />

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

			{/* Empty state */}
			{apps.length === 0 && (
				<p className="py-6 text-center text-xs text-text-muted dark:text-dark-accent/40">
					No applications
				</p>
			)}
		</div>
	);
}
