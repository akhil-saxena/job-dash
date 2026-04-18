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

						{/* Row 2: priority + location */}
						<div className="mt-1.5 flex items-center gap-2 text-[10px] text-text-muted dark:text-dark-accent/40">
							{/* Priority dot */}
							<span
								className="inline-block h-[6px] w-[6px] shrink-0 rounded-full"
								style={{
									backgroundColor:
										app.priority === "high"
											? "#ef4444"
											: app.priority === "medium"
												? "#f59e0b"
												: "#a8a29e",
								}}
							/>
							<span className="capitalize">{app.priority}</span>

							{app.locationType && (
								<>
									<span className="text-black/10 dark:text-white/10">·</span>
									<span className="capitalize">{app.locationType}</span>
									{app.locationCity && (
										<span className="truncate">{app.locationCity}</span>
									)}
								</>
							)}
						</div>

						{/* Hint bar — only when actionable (Phase 5/6 adds interview/deadline hints) */}
					</div>
				</div>
			)}
		</Draggable>
	);
}
