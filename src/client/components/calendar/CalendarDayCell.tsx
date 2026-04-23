import { format } from "date-fns";
import { EventChip } from "./EventChip";
import type { CalendarEvent } from "./types";

interface CalendarDayCellProps {
	date: Date;
	events: CalendarEvent[];
	inMonth: boolean;
	isToday: boolean;
	maxChips: 2 | 3;
	onOverflowClick: (date: Date, events: CalendarEvent[]) => void;
}

export function CalendarDayCell({
	date,
	events,
	inMonth,
	isToday,
	maxChips,
	onOverflowClick,
}: CalendarDayCellProps) {
	const visible = events.slice(0, maxChips);
	const overflow = events.length - visible.length;

	const surfaceClass = inMonth
		? "glass"
		: "bg-transparent opacity-40";

	// Responsive min-heights per UI-SPEC: 64 mobile, 80 md, 96 lg.
	const cellHeight = "min-h-[64px] md:min-h-[80px] lg:min-h-[96px]";

	return (
		<div
			role="gridcell"
			aria-label={`${format(date, "EEEE, MMMM d")}, ${events.length} events`}
			className={`relative ${cellHeight} ${surfaceClass} p-1`}
		>
			{/* Day number — top-right */}
			<div className="flex justify-end">
				{isToday ? (
					<span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-accent text-[11px] font-semibold text-white dark:bg-dark-accent dark:text-dark-dominant">
						{date.getDate()}
					</span>
				) : (
					<span className="px-1 text-[11px] font-semibold text-text-secondary dark:text-dark-accent/60">
						{date.getDate()}
					</span>
				)}
			</div>

			{/* Event chip stack */}
			<div className="mt-1 flex flex-col gap-1">
				{visible.map((ev) => (
					<EventChip
						key={`${ev.kind}:${ev.id}`}
						kind={ev.kind}
						deadlineType={ev.deadlineType}
						label={ev.label}
						time={ev.time}
						slug={ev.applicationSlug}
						isPast={ev.isPast}
					/>
				))}
				{overflow > 0 ? (
					<button
						type="button"
						onClick={() => onOverflowClick(date, events)}
						className="inline-flex h-5 items-center justify-center rounded-[var(--radius-pill)] bg-black/[0.04] px-2 text-xs font-medium text-text-secondary transition-colors hover:bg-black/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-surface-accent/40 dark:bg-white/[0.04] dark:text-dark-accent/70 dark:hover:bg-white/[0.08] dark:focus-visible:ring-dark-accent/40"
					>
						+{overflow} more
					</button>
				) : null}
			</div>
		</div>
	);
}
