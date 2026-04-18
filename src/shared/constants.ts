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

export const INTERVIEW_ROUND_TYPES = [
	"phone_screen",
	"recruiter_call",
	"technical",
	"system_design",
	"behavioral",
	"hiring_manager",
	"bar_raiser",
	"take_home",
	"panel",
	"custom",
] as const;
export type InterviewRoundType = (typeof INTERVIEW_ROUND_TYPES)[number];

export const INTERVIEW_STATUSES = [
	"scheduled",
	"completed",
	"cancelled",
	"no_show",
] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export const ROUND_TYPE_LABELS: Record<InterviewRoundType, string> = {
	phone_screen: "Phone Screen",
	recruiter_call: "Recruiter Call",
	technical: "Technical",
	system_design: "System Design",
	behavioral: "Behavioral",
	hiring_manager: "Hiring Manager",
	bar_raiser: "Bar Raiser",
	take_home: "Take-Home",
	panel: "Panel",
	custom: "Custom",
};

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
	scheduled: "Scheduled",
	completed: "Completed",
	cancelled: "Cancelled",
	no_show: "No Show",
};
