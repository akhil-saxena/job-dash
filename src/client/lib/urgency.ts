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
 * Per D-16, D-17, D-18: urgency is communicated via card background tint only.
 * Interview/offer urgency will be added in Phase 5/6 when those dates exist.
 */
export function calculateUrgency(app: UrgencyInput): UrgencyLevel {
	if (app.status === "rejected") return "rejected";

	const daysSinceUpdate = getDaysSinceUpdate(app.updatedAt);

	// Stale: no update in 7+ days, excluding terminal/accepted statuses
	if (
		daysSinceUpdate >= 7 &&
		!["rejected", "withdrawn", "accepted"].includes(app.status)
	) {
		return "stale";
	}

	// Interview and offer urgency will be added in Phase 5/6
	// when interview dates and deadlines are available
	return "normal";
}

/**
 * CSS classes for urgency tints applied to card wrapper.
 * Per UI-SPEC: tint IS the signal, no redundant text labels.
 */
export const URGENCY_STYLES: Record<UrgencyLevel, string> = {
	"interview-today":
		"bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)]",
	"interview-tomorrow":
		"bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)]",
	"interview-week": "",
	"offer-expiring":
		"bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.15)]",
	stale: "bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.12)]",
	rejected: "opacity-40",
	normal: "",
};
