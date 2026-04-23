import { describe, it } from "vitest";

// Wave 0: stub tests — real assertions land in Wave 1 (Task 2) once
// generateMonthGrid is implemented in src/client/lib/monthGrid.ts.

describe("generateMonthGrid", () => {
	// Test 1
	it.todo("returns exactly 42 Date cells");

	// Test 2
	it.todo(
		"first cell is startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 }) for a Wednesday-starting month",
	);

	// Test 3
	it.todo("last cell is first cell + 41 days");

	// Test 4
	it.todo("handles DST boundary (e.g. March 2026 US)");

	// Test 5
	it.todo("returns same 42 cells for Feb 2024 (leap year)");
});
