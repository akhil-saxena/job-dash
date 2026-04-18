import { Draggable } from "@hello-pangea/dnd";
import { useRouter } from "@tanstack/react-router";
import type { Application } from "@/client/hooks/useApplications";
import {
	calculateUrgency,
	getDaysSinceUpdate,
	URGENCY_STYLES,
} from "@/client/lib/urgency";
import { CompanyBadge } from "./CompanyBadge";

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
					className={`cursor-pointer transition-all ${
						snapshot.isDragging ? "scale-[1.02] shadow-xl" : ""
					}`}
				>
					{/* BC2 card: glass surface, single main row, optional hint bar */}
					<div
						className={[
							"rounded-[10px] border border-white/50 px-3 py-2.5",
							"bg-white/[0.6] backdrop-blur-[10px]",
							"transition-all hover:bg-white/[0.8] hover:shadow-sm",
							"dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]",
							urgencyClass,
						].join(" ")}
					>
						{/* Row 1: badge + company/role + days */}
						<div className="flex items-center gap-2.5">
							<CompanyBadge companyName={app.companyName} size="sm" />

							<div className="min-w-0 flex-1">
								<p className="truncate text-[12px] font-semibold text-text-primary dark:text-dark-accent">
									{app.companyName}
								</p>
								<p className="truncate text-[11px] text-text-secondary dark:text-dark-accent/60">
									{app.roleTitle}
								</p>
							</div>

							<span
								className={`shrink-0 text-[11px] tabular-nums ${
									isStale
										? "font-bold text-status-rejected"
										: "text-text-muted dark:text-dark-accent/40"
								}`}
							>
								{days}d
							</span>
						</div>

						{/* Row 2: location */}
						{app.locationType && (
							<p className="mt-1.5 truncate text-[10px] capitalize text-text-muted dark:text-dark-accent/40">
								{app.locationType}{app.locationCity ? ` · ${app.locationCity}` : ""}
							</p>
						)}

						{/* Hint bar — only when actionable (Phase 5/6 adds interview/deadline hints) */}
					</div>
				</div>
			)}
		</Draggable>
	);
}
