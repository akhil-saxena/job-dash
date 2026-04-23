import { describe, it, expect } from "vitest";
import { addDays, isSameDay } from "date-fns";
import { generateMonthGrid } from "./monthGrid";

describe("generateMonthGrid", () => {
	it("returns exactly 42 Date cells", () => {
		const cells = generateMonthGrid(new Date(2026, 3, 15)); // April 15, 2026
		expect(cells).toHaveLength(42);
		for (const c of cells) expect(c).toBeInstanceOf(Date);
	});

	it("first cell is startOfWeek(startOfMonth(anchor)) for a Wednesday-starting month", () => {
		// April 2026: April 1 is a Wednesday → grid start is Sunday March 29, 2026.
		const cells = generateMonthGrid(new Date(2026, 3, 15));
		expect(cells[0].getFullYear()).toBe(2026);
		expect(cells[0].getMonth()).toBe(2); // March (0-indexed)
		expect(cells[0].getDate()).toBe(29);
		expect(cells[0].getDay()).toBe(0); // Sunday
	});

	it("last cell is first cell + 41 days", () => {
		const cells = generateMonthGrid(new Date(2026, 3, 15));
		expect(isSameDay(cells[41], addDays(cells[0], 41))).toBe(true);
	});

	it("handles DST boundary (e.g. March 2026 US)", () => {
		// US DST in 2026 starts Sunday March 8. Grid for March 2026 must still
		// produce exactly 42 unique calendar dates (no duplicates, no gaps).
		const cells = generateMonthGrid(new Date(2026, 2, 15)); // March 15, 2026
		expect(cells).toHaveLength(42);
		const seen = new Set(
			cells.map(
				(c) => `${c.getFullYear()}-${c.getMonth()}-${c.getDate()}`,
			),
		);
		expect(seen.size).toBe(42);
		// Adjacent cells must be exactly one calendar day apart.
		for (let i = 1; i < cells.length; i++) {
			expect(isSameDay(cells[i], addDays(cells[i - 1], 1))).toBe(true);
		}
	});

	it("returns same 42 cells for Feb 2024 (leap year)", () => {
		// Feb 1, 2024 is a Thursday → grid start is Sunday Jan 28, 2024.
		const cells = generateMonthGrid(new Date(2024, 1, 15));
		expect(cells).toHaveLength(42);
		expect(cells[0].getFullYear()).toBe(2024);
		expect(cells[0].getMonth()).toBe(0); // January
		expect(cells[0].getDate()).toBe(28);
		expect(cells[0].getDay()).toBe(0); // Sunday
	});
});
