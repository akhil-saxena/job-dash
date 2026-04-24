import type { ReactNode } from "react";
import type { ApplicationStatus } from "@/shared/constants";
import { STATUS_COLORS, STATUS_BADGE_BG } from "@/client/lib/colors";

type BadgeVariant = "filled" | "outlined" | "dot" | "mono";
type BadgeTone =
	| "upcoming"
	| "passed"
	| "pending"
	| "done"
	| "urgent"
	| "new"
	| "neutral";

interface BadgeProps {
	variant?: BadgeVariant;
	color?: ApplicationStatus | string;
	/** For variant="mono" — semantic tone that drives color. */
	tone?: BadgeTone;
	size?: "sm" | "md";
	children: ReactNode;
}

function resolveColor(color: string): string {
	if (color in STATUS_COLORS) {
		return STATUS_COLORS[color as ApplicationStatus];
	}
	return color;
}

function resolveBg(color: string): string {
	if (color in STATUS_BADGE_BG) {
		return STATUS_BADGE_BG[color as ApplicationStatus];
	}
	return `${color}1f`;
}

// Mono-style tone palette — matches the DS reference's Upcoming/Passed/… row.
const TONE_STYLES: Record<BadgeTone, string> = {
	upcoming: "bg-[rgba(59,130,246,0.12)] text-[#1d4ed8]",
	passed: "bg-[rgba(34,197,94,0.14)] text-[#15803d]",
	pending: "bg-cream-2 text-ink-3 dark:bg-white/[0.06] dark:text-ink-4",
	done: "bg-[rgba(139,92,246,0.12)] text-[#6d28d9]",
	urgent: "bg-[rgba(239,68,68,0.12)] text-[#b91c1c]",
	new: "bg-ink text-cream",
	neutral: "bg-amber-l text-amber-d",
};

export function Badge({
	variant = "filled",
	color = "applied",
	tone = "neutral",
	size = "sm",
	children,
}: BadgeProps) {
	const hex = resolveColor(color);
	const bg = resolveBg(color);
	const sizeClasses =
		size === "sm"
			? "text-[10px] min-h-5 px-2 py-px"
			: "text-xs min-h-6 px-2.5 py-px";

	// Mono variant — JetBrains Mono uppercase pill per the DS reference.
	if (variant === "mono") {
		return (
			<span
				className={`inline-flex items-center justify-center rounded-[var(--radius-pill)] font-mono text-[9.5px] font-bold uppercase tracking-[0.05em] px-2 py-[3px] ${TONE_STYLES[tone]}`}
			>
				{children}
			</span>
		);
	}

	if (variant === "dot") {
		return (
			<span className="inline-flex items-center gap-1.5">
				<span
					className="inline-block h-1.5 w-1.5 rounded-full"
					style={{ backgroundColor: hex }}
				/>
				<span className="text-xs text-ink-2 dark:text-cream-2">
					{children}
				</span>
			</span>
		);
	}

	if (variant === "outlined") {
		return (
			<span
				className={`inline-flex items-center justify-center font-semibold rounded-[var(--radius-pill)] border ${sizeClasses}`}
				style={{ color: hex, borderColor: hex }}
			>
				{children}
			</span>
		);
	}

	// filled (default)
	return (
		<span
			className={`inline-flex items-center justify-center font-semibold rounded-[var(--radius-pill)] ${sizeClasses}`}
			style={{ backgroundColor: bg, color: hex }}
		>
			{children}
		</span>
	);
}
