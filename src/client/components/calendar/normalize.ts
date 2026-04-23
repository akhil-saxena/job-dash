import { format, isBefore, startOfDay } from "date-fns";
import { DEADLINE_TYPE_LABELS, ROUND_TYPE_LABELS } from "@/shared/constants";
import type {
	CalendarDeadlineEvent,
	CalendarInterviewEvent,
} from "@/client/hooks/useCalendarMonth";
import type { CalendarEvent } from "./types";

// D1 returns integer ("timestamp") columns as unix-seconds numbers; better-auth
// / Drizzle occasionally serialises them as ISO strings. Handle both.
function toDate(value: string | number | null | undefined): Date | null {
	if (value == null) return null;
	if (typeof value === "number") return new Date(value * 1000);
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeInterview(
	iv: CalendarInterviewEvent,
	now: Date,
): CalendarEvent | null {
	const date = toDate(iv.scheduledAt);
	if (!date) return null;
	const roundLabel =
		ROUND_TYPE_LABELS[iv.roundType as keyof typeof ROUND_TYPE_LABELS] ??
		iv.roundType;
	return {
		id: iv.id,
		kind: "interview",
		applicationId: iv.applicationId,
		applicationSlug: iv.applicationSlug,
		companyName: iv.companyName,
		roleTitle: iv.roleTitle,
		label: `${roundLabel} · ${iv.companyName}`,
		time: format(date, "h:mm a"),
		date,
		isPast: isBefore(date, startOfDay(now)),
	};
}

export function normalizeDeadline(
	d: CalendarDeadlineEvent,
	now: Date,
): CalendarEvent | null {
	const date = toDate(d.dueDate);
	if (!date) return null;
	const typeLabel =
		DEADLINE_TYPE_LABELS[
			d.deadlineType as keyof typeof DEADLINE_TYPE_LABELS
		] ?? d.deadlineType;
	const label = d.label
		? `${typeLabel} · ${d.label}`
		: `${typeLabel} · ${d.companyName}`;
	return {
		id: d.id,
		kind: "deadline",
		applicationId: d.applicationId,
		applicationSlug: d.applicationSlug,
		companyName: d.companyName,
		roleTitle: d.roleTitle,
		label,
		date,
		isPast: isBefore(date, startOfDay(now)),
		deadlineType: d.deadlineType,
	};
}

export function normalizeAll(
	interviews: CalendarInterviewEvent[],
	deadlines: CalendarDeadlineEvent[],
	now: Date,
): CalendarEvent[] {
	const out: CalendarEvent[] = [];
	for (const iv of interviews) {
		const n = normalizeInterview(iv, now);
		if (n) out.push(n);
	}
	for (const d of deadlines) {
		const n = normalizeDeadline(d, now);
		if (n) out.push(n);
	}
	return out;
}
