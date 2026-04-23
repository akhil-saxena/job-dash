import { describe, it, expect } from "vitest";
import {
	analyticsThresholdsSchema,
	analyticsRangeSchema,
	ANALYTICS_THRESHOLD_DEFAULTS,
} from "./analytics";

describe("analyticsThresholdsSchema", () => {
	it("accepts ANALYTICS_THRESHOLD_DEFAULTS", () => {
		expect(
			analyticsThresholdsSchema.safeParse(ANALYTICS_THRESHOLD_DEFAULTS).success,
		).toBe(true);
	});

	it("rejects green-below >= amber-below (swapped)", () => {
		const swapped = {
			appliedScreening: { greenBelow: 14, amberBelow: 7 },
			screeningInterviewing: { greenBelow: 5, amberBelow: 10 },
			interviewingOffer: { greenBelow: 3, amberBelow: 7 },
		};
		expect(analyticsThresholdsSchema.safeParse(swapped).success).toBe(false);
	});

	it("rejects green-below === amber-below (equal is not strictly less)", () => {
		const equal = {
			appliedScreening: { greenBelow: 7, amberBelow: 7 },
			screeningInterviewing: { greenBelow: 5, amberBelow: 10 },
			interviewingOffer: { greenBelow: 3, amberBelow: 7 },
		};
		expect(analyticsThresholdsSchema.safeParse(equal).success).toBe(false);
	});

	it("rejects negative numbers", () => {
		const negative = {
			appliedScreening: { greenBelow: -1, amberBelow: 14 },
			screeningInterviewing: { greenBelow: 5, amberBelow: 10 },
			interviewingOffer: { greenBelow: 3, amberBelow: 7 },
		};
		expect(analyticsThresholdsSchema.safeParse(negative).success).toBe(false);
	});

	it("rejects non-integer values (5.5)", () => {
		const fractional = {
			appliedScreening: { greenBelow: 5.5, amberBelow: 14 },
			screeningInterviewing: { greenBelow: 5, amberBelow: 10 },
			interviewingOffer: { greenBelow: 3, amberBelow: 7 },
		};
		expect(analyticsThresholdsSchema.safeParse(fractional).success).toBe(false);
	});

	it("rejects values > 365", () => {
		const tooLarge = {
			appliedScreening: { greenBelow: 7, amberBelow: 400 },
			screeningInterviewing: { greenBelow: 5, amberBelow: 10 },
			interviewingOffer: { greenBelow: 3, amberBelow: 7 },
		};
		expect(analyticsThresholdsSchema.safeParse(tooLarge).success).toBe(false);
	});
});

describe("analyticsRangeSchema", () => {
	it("accepts ISO YYYY-MM-DD", () => {
		expect(
			analyticsRangeSchema.safeParse({ from: "2026-01-01", to: "2026-04-23" })
				.success,
		).toBe(true);
	});

	it("rejects slash-separated date format", () => {
		expect(
			analyticsRangeSchema.safeParse({ from: "2026/01/01", to: "2026-04-23" })
				.success,
		).toBe(false);
	});

	it("rejects missing fields", () => {
		expect(
			analyticsRangeSchema.safeParse({ from: "2026-01-01" }).success,
		).toBe(false);
		expect(
			analyticsRangeSchema.safeParse({ to: "2026-04-23" }).success,
		).toBe(false);
		expect(analyticsRangeSchema.safeParse({}).success).toBe(false);
	});

	it("rejects empty strings", () => {
		expect(
			analyticsRangeSchema.safeParse({ from: "", to: "" }).success,
		).toBe(false);
	});
});
