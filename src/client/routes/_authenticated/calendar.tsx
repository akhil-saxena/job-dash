import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	addDays,
	addMonths,
	format,
	startOfDay,
	startOfMonth,
	subMonths,
} from "date-fns";
import { AlertCircle, CalendarDays } from "lucide-react";
import { Button } from "@/client/components/design-system/Button";
import { Card } from "@/client/components/design-system/Card";
import {
	CalendarMonthGrid,
	DayOverflowModal,
	ThisWeekList,
	normalizeAll,
	type CalendarEvent,
} from "@/client/components/calendar";
import { useCalendarMonth } from "@/client/hooks/useCalendarMonth";

export const Route = createFileRoute("/_authenticated/calendar")({
	component: CalendarPage,
});

const HINT_STORAGE_KEY = "jobdash:calendar:hintDismissed";
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAYS_LETTER = ["S", "M", "T", "W", "T", "F", "S"] as const;

function CalendarPage() {
	const [anchor, setAnchor] = useState<Date>(() =>
		startOfMonth(new Date()),
	);
	const [overflowDay, setOverflowDay] = useState<Date | null>(null);
	const [overflowEvents, setOverflowEvents] = useState<CalendarEvent[]>(
		[],
	);
	const [hintDismissed, setHintDismissed] = useState<boolean>(() => {
		if (typeof window === "undefined") return true;
		return window.localStorage.getItem(HINT_STORAGE_KEY) === "1";
	});

	const { data, isLoading, isError, refetch } = useCalendarMonth(anchor);

	// Keep `now` stable per render; re-derive once per render is fine.
	const now = useMemo(() => new Date(), []);

	// Normalise interviews + deadlines into a single CalendarEvent[] so the
	// grid + This Week list + overflow modal all speak the same shape.
	const allEvents = useMemo<CalendarEvent[]>(() => {
		if (!data) return [];
		return normalizeAll(data.interviews, data.deadlines, now);
	}, [data, now]);

	const dismissHint = useCallback(() => {
		if (hintDismissed) return;
		try {
			window.localStorage.setItem(HINT_STORAGE_KEY, "1");
		} catch {
			// ignore quota / private-mode errors
		}
		setHintDismissed(true);
	}, [hintDismissed]);

	const goPrev = useCallback(
		() => setAnchor((a) => startOfMonth(subMonths(a, 1))),
		[],
	);
	const goNext = useCallback(
		() => setAnchor((a) => startOfMonth(addMonths(a, 1))),
		[],
	);
	const goToday = useCallback(
		() => setAnchor(startOfMonth(new Date())),
		[],
	);

	// Keyboard shortcuts: ← → navigate months, T jumps to today. Ignore when
	// focus is inside an input / textarea / contenteditable so users can type.
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			const tag = target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA") return;
			if (target?.isContentEditable) return;
			if (e.metaKey || e.ctrlKey || e.altKey) return;

			if (e.key === "ArrowLeft") {
				e.preventDefault();
				goPrev();
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				goNext();
			} else if (e.key === "t" || e.key === "T") {
				e.preventDefault();
				goToday();
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [goPrev, goNext, goToday]);

	const handleOverflowClick = useCallback(
		(date: Date, events: CalendarEvent[]) => {
			setOverflowDay(date);
			setOverflowEvents(events);
		},
		[],
	);

	const closeOverflow = useCallback(() => {
		setOverflowDay(null);
		setOverflowEvents([]);
	}, []);

	// Next-7-day slice for This Week — computed on full dataset (so it doesn't
	// disappear when the user navigates months).
	const thisWeekEvents = useMemo<CalendarEvent[]>(() => {
		if (!data) return [];
		// We only have the current anchor month's data loaded. For the typical
		// case where the anchor is the current month, this covers This Week.
		// If the user navigates away, This Week still reads whatever week falls
		// inside the currently-loaded window.
		const weekStart = startOfDay(now);
		const weekEnd = addDays(weekStart, 7);
		return allEvents.filter(
			(ev) => ev.date >= weekStart && ev.date < weekEnd,
		);
	}, [data, allEvents, now]);

	return (
		<div
			className="flex flex-col gap-6 p-4 pb-16 lg:p-6"
			onClick={dismissHint}
			onKeyDown={dismissHint}
			role="presentation"
		>
			{/* Sub-header: month title + nav */}
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="text-[28px] font-semibold leading-tight text-text-primary dark:text-dark-accent">
						{format(anchor, "LLLL yyyy")}
					</h1>
					{!hintDismissed ? (
						<div className="mt-1 hidden text-xs text-text-muted dark:text-dark-accent/40 lg:block">
							Tip: ← → to navigate months, T for today
						</div>
					) : null}
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={goPrev}
						aria-label="Previous month"
					>
						‹
					</Button>
					<Button variant="ghost" size="sm" onClick={goToday}>
						Today
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={goNext}
						aria-label="Next month"
					>
						›
					</Button>
				</div>
			</div>

			{/* Body: loading / error / empty / data */}
			{isLoading ? (
				<CalendarSkeleton />
			) : isError ? (
				<CalendarErrorState onRetry={() => refetch()} />
			) : allEvents.length === 0 ? (
				<CalendarEmptyState />
			) : (
				<CalendarMonthGrid
					anchor={anchor}
					events={allEvents}
					onOverflowClick={handleOverflowClick}
				/>
			)}

			{/* This Week — always rendered below the grid (even in empty state
			    it shows "Clear week ahead"). */}
			{!isLoading && !isError ? (
				<ThisWeekList events={thisWeekEvents} now={now} />
			) : null}

			<DayOverflowModal
				open={overflowDay !== null}
				onClose={closeOverflow}
				date={overflowDay}
				events={overflowEvents}
			/>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Helpers — Skeleton / Error / Empty states
// ---------------------------------------------------------------------------

function CalendarSkeleton() {
	return (
		<div>
			<div
				className="grid grid-cols-7 py-2"
				aria-hidden="true"
			>
				{WEEKDAYS_SHORT.map((label, i) => (
					<div
						key={label + i}
						className="text-center text-[12px] font-semibold uppercase tracking-wider text-text-secondary dark:text-dark-accent/60"
					>
						<span className="hidden sm:inline">{label}</span>
						<span className="sm:hidden">{WEEKDAYS_LETTER[i]}</span>
					</div>
				))}
			</div>
			<div className="grid grid-cols-7 gap-px overflow-hidden rounded-[var(--radius-card)] bg-black/[0.06] dark:bg-white/[0.06]">
				{Array.from({ length: 42 }).map((_, i) => (
					<div
						key={i}
						className="glass min-h-[64px] md:min-h-[80px] lg:min-h-[96px] animate-pulse p-1"
					>
						<div className="flex justify-end">
							<div className="h-3 w-3 rounded bg-black/[0.08] dark:bg-white/[0.08]" />
						</div>
						<div className="mt-2 flex flex-col gap-1">
							<div className="h-3 w-3/4 rounded bg-black/[0.06] dark:bg-white/[0.06]" />
							<div className="h-3 w-1/2 rounded bg-black/[0.06] dark:bg-white/[0.06]" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function CalendarErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<Card padding="p-12">
			<div className="flex flex-col items-center justify-center gap-3 text-center">
				<AlertCircle size={32} className="text-status-rejected" />
				<div className="text-xl font-semibold text-text-primary dark:text-dark-accent">
					Couldn't load your calendar
				</div>
				<div className="max-w-md text-sm text-text-secondary dark:text-dark-accent/60">
					Something went wrong fetching interviews and deadlines.
					Check your connection and try again.
				</div>
				<Button variant="filled" size="sm" onClick={onRetry}>
					Retry
				</Button>
			</div>
		</Card>
	);
}

function CalendarEmptyState() {
	return (
		<Card padding="p-12">
			<div className="flex flex-col items-center justify-center gap-3 text-center">
				<CalendarDays
					size={32}
					className="text-text-muted dark:text-dark-accent/40"
				/>
				<div className="text-xl font-semibold text-text-primary dark:text-dark-accent">
					Nothing scheduled yet
				</div>
				<div className="max-w-md text-sm text-text-secondary dark:text-dark-accent/60">
					Interviews and deadlines from your applications will appear
					here automatically. Nothing to remember — we'll pull them
					in.
				</div>
				<Link to="/board">
					<Button variant="ghost" size="sm">
						Go to Board
					</Button>
				</Link>
			</div>
		</Card>
	);
}
