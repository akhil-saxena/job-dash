import { Draggable } from "@hello-pangea/dnd";
import { useRouter } from "@tanstack/react-router";
import { MapPin, DollarSign } from "lucide-react";
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

function formatSalary(
	min: number | null,
	max: number | null,
	currency: string,
): string | null {
	if (!min && !max) return null;
	const fmt = (n: number) =>
		n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
	if (min && max) return `${fmt(min)}–${fmt(max)} ${currency}`;
	if (min) return `${fmt(min)}+ ${currency}`;
	return `${fmt(max!)} ${currency}`;
}

export function KanbanCard({ app, index }: KanbanCardProps) {
	const router = useRouter();
	const urgency = calculateUrgency(app);
	const urgencyClass = URGENCY_STYLES[urgency];
	const days = getDaysSinceUpdate(app.updatedAt);
	const isStale = urgency === "stale";
	const salary = formatSalary(
		app.salaryMin,
		app.salaryMax,
		app.salaryCurrency,
	);

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
					className={`cursor-pointer rounded-xl transition-all focus:outline-none ${
						snapshot.isDragging
							? "shadow-xl scale-[1.02] rotate-[1deg]"
							: ""
					}`}
				>
					<div
						className={`glass rounded-xl border border-white/40 p-4 transition-all hover:border-white/60 hover:shadow-md dark:border-white/10 dark:hover:border-white/20 ${urgencyClass}`}
					>
						{/* Top: Company badge + name */}
						<div className="flex items-center gap-3">
							<CompanyBadge
								companyName={app.companyName}
								size="md"
							/>
							<div className="min-w-0 flex-1">
								<p className="truncate text-[15px] font-semibold leading-tight text-text-primary dark:text-dark-accent">
									{app.companyName}
								</p>
								<p className="mt-0.5 truncate text-[13px] text-text-secondary dark:text-dark-accent/60">
									{app.roleTitle}
								</p>
							</div>
						</div>

						{/* Bottom: meta row */}
						<div className="mt-3 flex items-center gap-2 border-t border-black/[0.04] pt-3 text-xs text-text-muted dark:border-white/[0.06] dark:text-dark-accent/40">
							{app.locationType && (
								<span className="flex items-center gap-1">
									<MapPin size={12} strokeWidth={1.8} />
									<span className="truncate">
										{app.locationType}
										{app.locationCity
											? ` · ${app.locationCity}`
											: ""}
									</span>
								</span>
							)}

							{salary && (
								<span className="flex items-center gap-1">
									<DollarSign size={12} strokeWidth={1.8} />
									{salary}
								</span>
							)}

							{/* Days — pushed to the right */}
							<span
								className={`ml-auto tabular-nums ${
									isStale
										? "font-bold text-status-rejected"
										: ""
								}`}
							>
								{days}d
							</span>
						</div>
					</div>
				</div>
			)}
		</Draggable>
	);
}
