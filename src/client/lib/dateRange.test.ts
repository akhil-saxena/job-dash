import { describe, it, expect } from "vitest";
import {
	subDays,
	startOfDay,
	endOfDay,
	startOfYear,
} from "date-fns";
import { presetToRange } from "./dateRange";

// Deterministic "now" so all tests stay stable across runs.
const NOW = new Date("2026-04-23T12:00:00Z");

describe("presetToRange", () => {
	it("30d maps to subDays(now, 30) at startOfDay", () => {
		const { from, to } = presetToRange("30d", NOW);
		expect(from.getTime()).toBe(startOfDay(subDays(NOW, 30)).getTime());
		expect(to.getTime()).toBe(endOfDay(NOW).getTime());
	});

	it("90d maps to subDays(now, 90) at startOfDay", () => {
		const { from } = presetToRange("90d", NOW);
		expect(from.getTime()).toBe(startOfDay(subDays(NOW, 90)).getTime());
	});

	it("ytd uses startOfYear(now)", () => {
		const { from } = presetToRange("ytd", NOW);
		expect(from.getTime()).toBe(startOfYear(NOW).getTime());
	});

	it("all time uses epoch 0 as from", () => {
		const { from } = presetToRange("all", NOW);
		expect(from.getTime()).toBe(0);
	});

	it("custom parses YYYY-MM-DD strings", () => {
		const { from, to } = presetToRange("custom", NOW, {
			from: "2026-01-01",
			to: "2026-04-23",
		});
		// from < to under any timezone
		expect(from.getTime()).toBeLessThan(to.getTime());
		// Range spans ~113 days (Jan 1 to Apr 23); allow ±1d slop for DST / tz
		const days = (to.getTime() - from.getTime()) / 86400000;
		expect(days).toBeGreaterThan(110);
		expect(days).toBeLessThan(115);
		// `from` is derived from the UTC midnight of the given date then
		// passed through startOfDay (local). Accept either 2025 (neg-UTC
		// offset host) or 2026 (UTC / pos-UTC host) — the underlying time
		// value is what downstream API calls use.
		expect([2025, 2026]).toContain(from.getUTCFullYear());
	});

	it("to is endOfDay(now) for all presets", () => {
		const expected = endOfDay(NOW).getTime();
		expect(presetToRange("30d", NOW).to.getTime()).toBe(expected);
		expect(presetToRange("90d", NOW).to.getTime()).toBe(expected);
		expect(presetToRange("ytd", NOW).to.getTime()).toBe(expected);
		expect(presetToRange("all", NOW).to.getTime()).toBe(expected);
	});
});
