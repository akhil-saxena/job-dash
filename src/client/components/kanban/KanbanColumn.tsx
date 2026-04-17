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
			{/* Column header (filled variant with status dot + name + count badge) */}
			<ColumnHeader status={status} count={apps.length} variant="filled" />

			{/* Card list */}
			<div className="flex flex-col gap-2">
				{apps.map((app) => (
					<KanbanCard key={app.id} app={app} />
				))}
			</div>

			{/* Empty state */}
			{apps.length === 0 && (
				<p className="py-6 text-center text-xs text-text-muted dark:text-dark-accent/40">
					No applications
				</p>
			)}
		</div>
	);
}
