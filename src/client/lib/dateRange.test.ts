import { describe, it } from "vitest";

// Stubs for Task 2 (Wave 1) — real assertions land when presetToRange is implemented.
describe("presetToRange", () => {
	it.todo("30d maps to subDays(now, 30) at startOfDay");
	it.todo("90d maps to subDays(now, 90) at startOfDay");
	it.todo("ytd uses startOfYear(now)");
	it.todo("all time uses epoch 0 as from");
	it.todo("custom parses YYYY-MM-DD strings");
	it.todo("to is endOfDay(now) for all presets");
});
