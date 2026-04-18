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
	deadlines?: Array<{
		deadlineType: string;
		dueAt: number;
		isCompleted: number;
	}>;
}

const PRIORITY_TINTS: Record<string, string> = {
	high: "border-l-[3px] border-l-red-400/40",
	medium: "",
	low: "",
};

export function KanbanCard({ app, index, deadlines }: KanbanCardProps) {
	const router = useRouter();
	const urgency = calculateUrgency({
		status: app.status,
		updatedAt: app.updatedAt,
		deadlines: deadlines ?? [],
	});
	const urgencyClass = URGENCY_STYLES[urgency];
	const days = getDaysSinceUpdate(app.appliedAt ?? app.createdAt);
	// Priority tint only if no urgency tint is active
	const priorityClass = urgency === "normal" ? (PRIORITY_TINTS[app.priority] ?? "") : "";

	const hasMetaRow =
		!!app.locationType || app.priority !== "low" || !!app.isPinned;

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
					<div
						className={[
							"rounded-[10px] border border-white/50 px-3 py-3",
							"bg-white/90 backdrop-blur-[10px]",
							"transition-all hover:bg-white hover:shadow-sm",
							"dark:border-white/10 dark:bg-zinc-800/90 dark:hover:bg-zinc-800",
							urgencyClass,
							priorityClass,
						].join(" ")}
					>
						{/* Row 1: badge + company/role + age badge */}
						<div className="flex items-center gap-2.5">
							<CompanyBadge companyName={app.companyName} size="kanban" />

							<div className="min-w-0 flex-1">
								<p className="truncate text-[13px] font-semibold text-text-primary dark:text-dark-accent">
									{app.companyName}
								</p>
								<p className="truncate text-[11.5px] text-text-secondary dark:text-dark-accent/60">
									{app.roleTitle}
								</p>
							</div>

							<span
								className="shrink-0 rounded bg-black/[0.04] px-1.5 py-0.5 text-[9.5px] tabular-nums text-text-muted dark:bg-white/[0.06] dark:text-dark-accent/40"
								style={{ fontFamily: "var(--mono, monospace)" }}
							>
								{days}d
							</span>
						</div>

						{/* Row 2: location chip + priority dot + pin star */}
						{hasMetaRow && (
							<div className="mt-2 flex items-center gap-1.5">
								{app.locationType && (
									<span className="rounded-full border border-black/[0.06] px-2 py-0.5 text-[10px] capitalize text-text-secondary dark:border-white/[0.1] dark:text-dark-accent/60">
										{app.locationType}{app.locationCity ? ` \u00b7 ${app.locationCity}` : ""}
									</span>
								)}
								{app.priority !== "low" && (
									<span
										className="inline-block h-1.5 w-1.5 rounded-full"
										style={{ backgroundColor: app.priority === "high" ? "#ef4444" : "#f59e0b" }}
									/>
								)}
								{!!app.isPinned && (
									<span className="ml-auto text-[11px]">{"\u2B50"}</span>
								)}
							</div>
						)}

						{/* Hint bar -- only when actionable (Phase 5/6 adds interview/deadline hints) */}
					</div>
				</div>
			)}
		</Draggable>
	);
}
