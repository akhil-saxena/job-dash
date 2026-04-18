export type UrgencyLevel =
	| "interview-today"
	| "interview-tomorrow"
	| "interview-week"
	| "offer-expiring"
	| "stale"
	| "rejected"
	| "normal";

interface UrgencyInput {
	status: string;
	updatedAt: number; // unix epoch seconds from D1
	deadlines?: Array<{
		deadlineType: string;
		dueAt: number; // unix epoch seconds
		isCompleted: number;
	}>;
	nextInterviewAt?: number; // unix epoch seconds, from interview_round.scheduled_at
}

/**
 * Calculate days until a future epoch (positive = future, negative = past).
 */
export function daysUntil(epochSeconds: number): number {
	const nowSec = Math.floor(Date.now() / 1000);
	return Math.floor((epochSeconds - nowSec) / 86400);
}

/**
 * Calculate days since the last update.
 * updatedAt is a unix epoch in seconds (from D1).
 */
export function getDaysSinceUpdate(updatedAt: number | string | null | undefined): number {
	if (!updatedAt) return 0;
	// Could be epoch seconds (number) or ISO string or Date object
	const epochSec = typeof updatedAt === "number"
		? updatedAt
		: Math.floor(new Date(updatedAt).getTime() / 1000);
	if (Number.isNaN(epochSec)) return 0;
	return Math.max(0, Math.floor((Date.now() / 1000 - epochSec) / 86400));
}

/**
 * Determine the urgency level for a kanban card.
 * Priority order (first match wins):
 * 1. rejected status -> "rejected"
 * 2. nextInterviewAt is today -> "interview-today"
 * 3. nextInterviewAt is tomorrow -> "interview-tomorrow"
 * 4. nextInterviewAt is within 7 days -> "interview-week"
 * 5. offer_expiry deadline within 3 days -> "offer-expiring"
 * 6. No update in 7+ days (non-terminal) -> "stale"
 * 7. Otherwise "normal"
 */
export function calculateUrgency(app: UrgencyInput): UrgencyLevel {
	if (app.status === "rejected") return "rejected";

	// Check interview proximity
	if (app.nextInterviewAt) {
		const interviewDays = daysUntil(app.nextInterviewAt);
		if (interviewDays === 0) return "interview-today";
		if (interviewDays === 1) return "interview-tomorrow";
		if (interviewDays > 0 && interviewDays <= 7) return "interview-week";
	}

	// Check offer expiry deadlines
	if (app.deadlines) {
		const activeOfferDeadlines = app.deadlines.filter(
			(d) => d.deadlineType === "offer_expiry" && !d.isCompleted,
		);
		for (const deadline of activeOfferDeadlines) {
			const days = daysUntil(deadline.dueAt);
			if (days >= 0 && days <= 3) return "offer-expiring";
		}
	}

	// Stale: no update in 7+ days, excluding terminal/accepted statuses
	const daysSinceUpdate = getDaysSinceUpdate(app.updatedAt);
	if (
		daysSinceUpdate >= 7 &&
		!["rejected", "withdrawn", "accepted"].includes(app.status)
	) {
		return "stale";
	}

	return "normal";
}

/**
 * CSS classes for urgency tints applied to card wrapper.
 * Per UI-SPEC: tint IS the signal, no redundant text labels.
 * Includes dark mode variants.
 */
export const URGENCY_STYLES: Record<UrgencyLevel, string> = {
	"interview-today":
		"!bg-amber-50/95 !border-amber-200/60 dark:!bg-amber-500/10 dark:!border-amber-500/20",
	"interview-tomorrow":
		"!bg-amber-50/95 !border-amber-200/60 dark:!bg-amber-500/10 dark:!border-amber-500/20",
	"interview-week": "",
	"offer-expiring":
		"!bg-green-50/95 !border-green-200/60 dark:!bg-green-500/10 dark:!border-green-500/20",
	stale: "!bg-red-50/95 !border-red-200/60 dark:!bg-red-500/10 dark:!border-red-500/20",
	rejected: "opacity-40",
	normal: "",
};
