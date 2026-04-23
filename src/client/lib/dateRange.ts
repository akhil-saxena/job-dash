import { subDays, startOfDay, endOfDay, startOfYear } from "date-fns";

export type DateRangePreset = "30d" | "90d" | "ytd" | "all" | "custom";
export type DateRange = { from: Date; to: Date };

/**
 * ANLY-05 / D-15..D-17 — map a preset chip (optionally with a custom range) to
 * a concrete { from, to } Date window. Uses date-fns for DST/leap-safe math.
 *
 * - 30d / 90d → startOfDay(subDays(now, N)) → endOfDay(now)
 * - ytd       → startOfYear(now) → endOfDay(now)
 * - all       → epoch 0 → endOfDay(now)
 * - custom    → requires `custom` arg; both dates parsed as UTC startOfDay/endOfDay
 */
export function presetToRange(
	preset: DateRangePreset,
	now: Date = new Date(),
	custom?: { from: string; to: string },
): DateRange {
	const today = endOfDay(now);
	switch (preset) {
		case "30d":
			return { from: startOfDay(subDays(now, 30)), to: today };
		case "90d":
			return { from: startOfDay(subDays(now, 90)), to: today };
		case "ytd":
			return { from: startOfYear(now), to: today };
		case "all":
			return { from: new Date(0), to: today };
		case "custom":
			if (!custom) throw new Error("custom preset requires { from, to }");
			return {
				from: startOfDay(new Date(`${custom.from}T00:00:00Z`)),
				to: endOfDay(new Date(`${custom.to}T00:00:00Z`)),
			};
	}
}
