import { addDays, startOfMonth, startOfWeek } from "date-fns";

/**
 * Generate a fixed 42-cell month grid (7 columns × 6 rows) for the calendar view.
 *
 * The first cell is startOfWeek(startOfMonth(anchor), weekStartsOn: 0 = Sunday).
 * The grid always contains 42 cells so the month view height stays stable.
 * Out-of-month dates at the head/tail of the grid are the caller's to render at
 * reduced opacity.
 *
 * @param anchor any Date within the target month
 * @returns Date[] of length 42, chronologically ordered
 */
export function generateMonthGrid(anchor: Date): Date[] {
	const gridStart = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 });
	return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}
