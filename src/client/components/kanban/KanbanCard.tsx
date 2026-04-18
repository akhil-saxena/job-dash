import { Draggable } from "@hello-pangea/dnd";
import { useRouter } from "@tanstack/react-router";
import type { Application } from "@/client/hooks/useApplications";
import { calculateUrgency, getDaysSinceUpdate, URGENCY_STYLES } from "@/client/lib/urgency";
import { CompanyBadge } from "./CompanyBadge";
import { Card } from "@/client/components/design-system/Card";

interface KanbanCardProps {
	app: Application;
	index: number;
}

export function KanbanCard({ app, index }: KanbanCardProps) {
	const router = useRouter();
	const urgency = calculateUrgency(app);
	const urgencyClass = URGENCY_STYLES[urgency];
	const days = getDaysSinceUpdate(app.updatedAt);
	const isStale = urgency === "stale";

	function handleClick() {
		router.navigate({ to: "/app/$slug", params: { slug: app.slug } });
	}

	return (
		<Draggable draggableId={app.id} index={index}>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					onClick={handleClick}
					className={`cursor-pointer rounded-[var(--radius-card)] focus:outline-none focus:ring-2 focus:ring-surface-accent/20 ${
						snapshot.isDragging ? "opacity-90 shadow-lg scale-[1.02]" : ""
					}`}
				>
					<Card
						hover
						padding="p-2.5"
						className={urgencyClass}
					>
						<div className="flex items-center gap-2">
							{/* Left: company badge */}
							<CompanyBadge companyName={app.companyName} size="sm" />

							{/* Middle: company + role */}
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium text-text-primary dark:text-dark-accent">
									{app.companyName}
								</p>
								<p className="truncate text-xs text-text-secondary dark:text-dark-accent/60">
									{app.roleTitle}
								</p>
							</div>

							{/* Right: days since update */}
							<span
								className={`shrink-0 text-xs ${
									isStale
										? "font-bold text-status-rejected"
										: "text-text-muted dark:text-dark-accent/40"
								}`}
							>
								{days}d
							</span>
						</div>

						{/* Hint bar -- structure ready for Phase 5/6 when interview dates exist */}
						{/* Per rendering rules: stale has NO hint bar (tint says it). */}
						{/* Hint bar will show for interview-today, interview-tomorrow, offer-expiring */}
					</Card>
				</div>
			)}
		</Draggable>
	);
}
