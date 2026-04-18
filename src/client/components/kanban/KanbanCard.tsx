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
import { Card } from "@/client/components/design-system/Card";

interface KanbanCardProps {
	app: Application;
	index: number;
}

function formatSalary(min: number | null, max: number | null, currency: string): string | null {
	if (!min && !max) return null;
	const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
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
	const salary = formatSalary(app.salaryMin, app.salaryMax, app.salaryCurrency);

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
					className={`cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-surface-accent/20 ${
						snapshot.isDragging
							? "opacity-90 shadow-lg scale-[1.02]"
							: ""
					}`}
				>
					<Card hover padding="p-3" className={urgencyClass}>
						{/* Row 1: Badge + Company/Role + Days */}
						<div className="flex items-start gap-2.5">
							<CompanyBadge
								companyName={app.companyName}
								size="sm"
							/>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-semibold text-text-primary dark:text-dark-accent">
									{app.companyName}
								</p>
								<p className="truncate text-xs text-text-secondary dark:text-dark-accent/60">
									{app.roleTitle}
								</p>
							</div>
							<span
								className={`shrink-0 text-xs tabular-nums ${
									isStale
										? "font-bold text-status-rejected"
										: "text-text-muted dark:text-dark-accent/40"
								}`}
							>
								{days}d
							</span>
						</div>

						{/* Row 2: Meta details — location, salary, source */}
						{(app.locationType || salary || app.source) && (
							<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted dark:text-dark-accent/40">
								{app.locationType && (
									<span className="flex items-center gap-1">
										<MapPin size={10} />
										{app.locationType}
										{app.locationCity ? ` · ${app.locationCity}` : ""}
									</span>
								)}
								{salary && (
									<span className="flex items-center gap-1">
										<DollarSign size={10} />
										{salary}
									</span>
								)}
								{app.source && (
									<span className="capitalize">{app.source}</span>
								)}
							</div>
						)}
					</Card>
				</div>
			)}
		</Draggable>
	);
}
