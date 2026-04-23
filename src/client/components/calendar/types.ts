// Normalised shape consumed by EventChip, CalendarDayCell, ThisWeekList and
// DayOverflowModal. Built once inside CalendarMonthGrid / ThisWeekList.
export interface CalendarEvent {
	id: string;
	kind: "interview" | "deadline";
	applicationId: string;
	applicationSlug: string;
	companyName: string;
	roleTitle: string;
	/** Text that renders inside the chip (e.g. "Technical · Acme" or "Offer expiry"). */
	label: string;
	/** HH:mm am/pm for interviews that have a scheduled time. Undefined for deadlines. */
	time?: string;
	/** The JS Date when this event occurs (for sorting + comparison). */
	date: Date;
	/** True if the event's date is strictly before today (00:00 local). */
	isPast: boolean;
	/** Only populated when kind === "deadline". */
	deadlineType?: string;
}
