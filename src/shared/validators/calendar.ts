import { z } from "zod";

// VIEW-03 — month query: must match YYYY-MM where MM is 01..12
export const calendarMonthSchema = z.object({
	month: z
		.string()
		.regex(/^\d{4}-(0[1-9]|1[0-2])$/, "month must be YYYY-MM"),
});

export type CalendarMonthQuery = z.infer<typeof calendarMonthSchema>;
