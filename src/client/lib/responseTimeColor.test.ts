import { describe, it } from "vitest";

// Stubs for Task 2 (Wave 1) — real assertions land when getResponseTimeZone is implemented.
describe("getResponseTimeZone", () => {
	it.todo("avgDays < greenBelow → 'green'");
	it.todo("greenBelow <= avgDays < amberBelow → 'amber'");
	it.todo("avgDays >= amberBelow → 'red'");
	it.todo("avgDays === null → 'none'");
	it.todo("boundary: avgDays exactly greenBelow → 'amber' (strict <)");
});
