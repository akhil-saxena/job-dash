export const APPLICATION_STATUSES = [
	"wishlist",
	"applied",
	"screening",
	"interviewing",
	"offer",
	"accepted",
	"rejected",
	"withdrawn",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const PRIORITIES = ["high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const LOCATION_TYPES = ["remote", "hybrid", "onsite"] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export const TIMELINE_EVENT_TYPES = [
	"created",
	"status_change",
	"archived",
	"unarchived",
	"pinned",
	"unpinned",
	"deleted",
	"restored",
] as const;
export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];
