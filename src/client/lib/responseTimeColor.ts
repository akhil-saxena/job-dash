export type ResponseTimeZone = "green" | "amber" | "red" | "none";

export interface ResponseTimeThreshold {
	greenBelow: number;
	amberBelow: number;
}

/**
 * ANLY-03 / D-13 — map an average-days value to a color zone using the user's
 * per-transition thresholds (strict `<` boundaries). `null` → "none" (used for
 * the em-dash cell when a transition has zero samples).
 *
 * Boundary: `avgDays === greenBelow` is "amber" (not "green") because comparison
 * is strict `<`. UI-SPEC line ~167 documents this.
 */
export function getResponseTimeZone(
	avgDays: number | null,
	threshold: ResponseTimeThreshold,
): ResponseTimeZone {
	if (avgDays === null) return "none";
	if (avgDays < threshold.greenBelow) return "green";
	if (avgDays < threshold.amberBelow) return "amber";
	return "red";
}
