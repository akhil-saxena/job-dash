import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export interface CalendarInterviewEvent {
	id: string;
	applicationId: string;
	applicationSlug: string;
	companyName: string;
	roleTitle: string;
	roundType: string;
	// ISO-8601 string (JSON serialisation of a Drizzle timestamp column) or
	// unix-seconds number — normalise on the consumer side.
	scheduledAt: string | number | null;
	status: string;
}

export interface CalendarDeadlineEvent {
	id: string;
	applicationId: string;
	applicationSlug: string;
	companyName: string;
	roleTitle: string;
	deadlineType: string;
	label: string | null;
	dueDate: string | number;
	isCompleted: boolean | number;
}

export interface CalendarMonthData {
	interviews: CalendarInterviewEvent[];
	deadlines: CalendarDeadlineEvent[];
}

/**
 * Fetch interviews + deadlines for the 42-cell month window anchored at
 * `anchor`. QueryKey carries the YYYY-MM string so TanStack Query caches
 * per-month.
 */
export function useCalendarMonth(anchor: Date) {
	const monthKey = format(anchor, "yyyy-MM");
	return useQuery({
		queryKey: ["calendar", "month", monthKey],
		queryFn: async (): Promise<CalendarMonthData> => {
			const res = await fetch(
				`/api/calendar/events?month=${monthKey}`,
			);
			if (!res.ok) throw new Error("Failed to load calendar");
			const json = (await res.json()) as { data: CalendarMonthData };
			return json.data;
		},
	});
}
