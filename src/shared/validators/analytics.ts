import { z } from "zod";

/**
 * D-19 defaults — per-transition threshold pairs (days).
 * - Applied → Screening: green < 7d, amber < 14d
 * - Screening → Interviewing: green < 5d, amber < 10d
 * - Interviewing → Offer: green < 3d, amber < 7d
 * Values at or beyond `amberBelow` render as red.
 */
export const ANALYTICS_THRESHOLD_DEFAULTS = {
	appliedScreening: { greenBelow: 7, amberBelow: 14 },
	screeningInterviewing: { greenBelow: 5, amberBelow: 10 },
	interviewingOffer: { greenBelow: 3, amberBelow: 7 },
} as const;

const thresholdPair = z.object({
	greenBelow: z.number().int().min(0).max(365),
	amberBelow: z.number().int().min(0).max(365),
});

/**
 * ANLY-03 / D-13 — per-transition color thresholds stored in `user_settings`.
 * Invariant: greenBelow < amberBelow (strict) on every transition.
 */
export const analyticsThresholdsSchema = z
	.object({
		appliedScreening: thresholdPair,
		screeningInterviewing: thresholdPair,
		interviewingOffer: thresholdPair,
	})
	.refine(
		(t) =>
			t.appliedScreening.greenBelow < t.appliedScreening.amberBelow &&
			t.screeningInterviewing.greenBelow <
				t.screeningInterviewing.amberBelow &&
			t.interviewingOffer.greenBelow < t.interviewingOffer.amberBelow,
		{ message: "green-below must be less than amber-below" },
	);

export type AnalyticsThresholds = z.infer<typeof analyticsThresholdsSchema>;

/**
 * ANLY-05 — global date range filter query params.
 * `from` and `to` are ISO dates (YYYY-MM-DD). Server converts to UTC
 * startOfDay / endOfDay in the route handler.
 */
export const analyticsRangeSchema = z.object({
	from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type AnalyticsRangeQuery = z.infer<typeof analyticsRangeSchema>;
