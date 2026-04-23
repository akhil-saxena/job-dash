import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { Modal } from "@/client/components/design-system/Modal";
import type { CalendarEvent } from "./types";

interface DayOverflowModalProps {
	open: boolean;
	onClose: () => void;
	date: Date | null;
	events: CalendarEvent[];
}

// Keep chip palette in sync with EventChip + ThisWeekList.
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

export function DayOverflowModal({
	open,
	onClose,
	date,
	events,
}: DayOverflowModalProps) {
	const title = date
		? `${format(date, "EEEE, MMMM d")} · ${events.length} events`
		: "";

	const sorted = [...events].sort(
		(a, b) => a.date.getTime() - b.date.getTime(),
	);

	return (
		<Modal open={open} onClose={onClose} title={title}>
			<div className="flex flex-col">
				{sorted.map((ev) => (
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
						onClick={onClose}
						className="flex items-center gap-3 rounded-[var(--radius-btn)] px-2 py-2 transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-accent/40 dark:hover:bg-white/[0.04] dark:focus-visible:ring-dark-accent/40"
					>
						<span
							className="inline-block h-2 w-2 flex-none rounded-full"
							style={{ backgroundColor: colorFor(ev) }}
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
		</Modal>
	);
}
