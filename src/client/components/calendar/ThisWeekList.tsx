import { Link } from "@tanstack/react-router";
import {
	addDays,
	format,
	isSameDay,
	isToday,
	isTomorrow,
	startOfDay,
} from "date-fns";
import { CalendarCheck, ChevronRight } from "lucide-react";
import { Card } from "@/client/components/design-system/Card";
import type { CalendarEvent } from "./types";

interface ThisWeekListProps {
	events: CalendarEvent[];
	now?: Date;
}

// UI-SPEC chip palette (must stay in sync with EventChip colours)
const INTERVIEW_HEX = "#3b82f6";
const DEADLINE_PAST_HEX = "#ef4444";
const DEADLINE_HEX: Record<string, string> = {
	application_close: "#f59e0b",
	offer_expiry: "#22c55e",
	follow_up: "#8b5cf6",
	custom: "#64748b",
};

function colorFor(ev: CalendarEvent): string {
	if (ev.kind === "interview") return INTERVIEW_HEX;
	if (ev.isPast) return DEADLINE_PAST_HEX;
	return (
		(ev.deadlineType && DEADLINE_HEX[ev.deadlineType]) ??
		DEADLINE_HEX.custom
	);
}

function dayHeading(d: Date): string {
	if (isToday(d)) return `Today · ${format(d, "EEE")}`;
	if (isTomorrow(d)) return `Tomorrow · ${format(d, "EEE")}`;
	return format(d, "EEE, MMM d");
}

export function ThisWeekList({ events, now = new Date() }: ThisWeekListProps) {
	const weekStart = startOfDay(now);
	const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

	const weekEvents = events.filter((ev) =>
		days.some((d) => isSameDay(d, ev.date)),
	);

	return (
		<Card padding="p-6">
			{/* Heading row */}
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-text-primary dark:text-dark-accent">
					This Week
				</h2>
				<div className="text-sm text-text-secondary dark:text-dark-accent/60">
					{format(days[0], "MMM d")} – {format(days[6], "MMM d")}
				</div>
			</div>

			{weekEvents.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
					<CalendarCheck
						className="text-text-muted dark:text-dark-accent/40"
						size={32}
					/>
					<div className="text-xl font-semibold text-text-primary dark:text-dark-accent">
						Clear week ahead
					</div>
					<div className="text-sm text-text-secondary dark:text-dark-accent/60">
						No interviews or deadlines in the next 7 days.
					</div>
				</div>
			) : (
				<div className="flex flex-col gap-5">
					{days.map((day) => {
						const bucket = weekEvents
							.filter((ev) => isSameDay(day, ev.date))
							.sort(
								(a, b) => a.date.getTime() - b.date.getTime(),
							);
						if (bucket.length === 0) return null;
						return (
							<div key={day.toISOString()}>
								<div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-text-secondary dark:text-dark-accent/60">
									{dayHeading(day)}
								</div>
								<div className="flex flex-col">
									{bucket.map((ev) => (
										<Link
											key={`${ev.kind}:${ev.id}`}
											to="/app/$slug"
											params={{ slug: ev.applicationSlug }}
											search={
												{
													tab:
														ev.kind === "interview"
															? "interviews"
															: "overview",
												} as any
											}
											className="flex items-center gap-3 rounded-[var(--radius-btn)] px-2 py-2 transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-accent/40 dark:hover:bg-white/[0.04] dark:focus-visible:ring-dark-accent/40"
										>
											<span
												className="inline-block h-2 w-2 flex-none rounded-full"
												style={{
													backgroundColor: colorFor(ev),
												}}
												aria-hidden="true"
											/>
											<span className="w-20 flex-none text-[14px] tabular-nums text-text-secondary dark:text-dark-accent/60">
												{ev.time ?? "—"}
											</span>
											<span className="truncate text-[13px] font-medium text-text-primary dark:text-dark-accent">
												{ev.companyName}
											</span>
											<span className="min-w-0 flex-1 truncate text-[14px] text-text-secondary dark:text-dark-accent/60">
												{ev.roleTitle}
											</span>
											<ChevronRight
												size={16}
												className="flex-none text-text-muted dark:text-dark-accent/40"
											/>
										</Link>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</Card>
	);
}
