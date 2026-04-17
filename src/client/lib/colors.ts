import type { ApplicationStatus } from "@/shared/constants";

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
	wishlist: "#6b7280",
	applied: "#3b82f6",
	screening: "#8b5cf6",
	interviewing: "#f59e0b",
	offer: "#22c55e",
	accepted: "#10b981",
	rejected: "#ef4444",
	withdrawn: "#64748b",
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
	wishlist: "Wishlist",
	applied: "Applied",
	screening: "Screening",
	interviewing: "Interviewing",
	offer: "Offer",
	accepted: "Accepted",
	rejected: "Rejected",
	withdrawn: "Withdrawn",
};

export const STATUS_BADGE_BG: Record<ApplicationStatus, string> = {
	wishlist: "rgba(107,114,128,.12)",
	applied: "rgba(59,130,246,.12)",
	screening: "rgba(139,92,246,.12)",
	interviewing: "rgba(245,158,11,.12)",
	offer: "rgba(34,197,94,.12)",
	accepted: "rgba(16,185,129,.12)",
	rejected: "rgba(239,68,68,.12)",
	withdrawn: "rgba(100,116,139,.12)",
};
