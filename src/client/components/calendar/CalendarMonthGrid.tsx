import { useEffect, useMemo, useState } from "react";
import { format, isSameMonth, isToday } from "date-fns";
import { generateMonthGrid } from "@/client/lib/monthGrid";
import { CalendarDayCell } from "./CalendarDayCell";
import type { CalendarEvent } from "./types";

interface CalendarMonthGridProps {
	anchor: Date;
	events: CalendarEvent[];
	onOverflowClick: (date: Date, events: CalendarEvent[]) => void;
}

// Stable YYYY-MM-DD key derived from local calendar date (not UTC) so
// events and grid cells bucket together even across DST / timezone offsets.
function dayKey(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAY_LETTER = ["S", "M", "T", "W", "T", "F", "S"] as const;

function useIsMobile(breakpointPx = 640): boolean {
	const [isMobile, setIsMobile] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia(`(max-width: ${breakpointPx - 1}px)`).matches;
	});
	useEffect(() => {
		if (typeof window === "undefined") return;
		const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
		const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [breakpointPx]);
	return isMobile;
}

export function CalendarMonthGrid({
	anchor,
	events,
	onOverflowClick,
}: CalendarMonthGridProps) {
	const cells = useMemo(() => generateMonthGrid(anchor), [anchor]);
	const isMobile = useIsMobile();
	const maxChips: 2 | 3 = isMobile ? 2 : 3;

	// Pre-group events by YYYY-MM-DD to avoid O(42 × N) inside render.
	const eventsByDay = useMemo(() => {
		const map = new Map<string, CalendarEvent[]>();
		for (const ev of events) {
			const key = dayKey(ev.date);
			const bucket = map.get(key);
			if (bucket) {
				bucket.push(ev);
			} else {
				map.set(key, [ev]);
			}
		}
		// Sort each day's events chronologically so the top chip in each cell
		// is the earliest event of the day.
		for (const bucket of map.values()) {
			bucket.sort((a, b) => a.date.getTime() - b.date.getTime());
		}
		return map;
	}, [events]);

	return (
		<div className="flex flex-col gap-0">
			{/* Weekday strip */}
			<div
				className="grid grid-cols-7 py-2"
				aria-hidden="true"
			>
				{WEEKDAY_SHORT.map((label, i) => (
					<div
						key={label + i}
						className="text-center text-[12px] font-semibold uppercase tracking-wider text-text-secondary dark:text-dark-accent/60"
					>
						<span className="hidden sm:inline">{label}</span>
						<span className="sm:hidden">{WEEKDAY_LETTER[i]}</span>
					</div>
				))}
			</div>

			{/* Month grid — 7 × 6 = 42 cells */}
			<div
				role="grid"
				aria-label={`Calendar for ${format(anchor, "LLLL yyyy")}`}
				className="grid grid-cols-7 gap-px overflow-hidden rounded-[var(--radius-card)] bg-black/[0.06] dark:bg-white/[0.06]"
			>
				{cells.map((date) => {
					const key = dayKey(date);
					const dayEvents = eventsByDay.get(key) ?? [];
					return (
						<CalendarDayCell
							key={key}
							date={date}
							events={dayEvents}
							inMonth={isSameMonth(date, anchor)}
							isToday={isToday(date)}
							maxChips={maxChips}
							onOverflowClick={onOverflowClick}
						/>
					);
				})}
			</div>
		</div>
	);
}
