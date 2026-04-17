import type { ReactNode } from "react";
import type { ApplicationStatus } from "@/shared/constants";
import { STATUS_COLORS, STATUS_BADGE_BG } from "@/client/lib/colors";

interface BadgeProps {
	variant?: "filled" | "outlined" | "dot";
	color?: ApplicationStatus | string;
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
	// Compute a .12 alpha from hex
	return `${color}1f`;
}

export function Badge({
	variant = "filled",
	color = "applied",
	size = "sm",
	children,
}: BadgeProps) {
	const hex = resolveColor(color);
	const bg = resolveBg(color);
	const sizeClasses =
		size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

	if (variant === "dot") {
		return (
			<span className="inline-flex items-center gap-1.5">
				<span
					className="inline-block h-1.5 w-1.5 rounded-full"
					style={{ backgroundColor: hex }}
				/>
				<span className="text-xs text-text-secondary dark:text-dark-accent/70">
					{children}
				</span>
			</span>
		);
	}

	if (variant === "outlined") {
		return (
			<span
				className={`inline-flex items-center font-semibold rounded-[var(--radius-pill)] border ${sizeClasses}`}
				style={{ color: hex, borderColor: hex }}
			>
				{children}
			</span>
		);
	}

	// filled (default)
	return (
		<span
			className={`inline-flex items-center font-semibold rounded-[var(--radius-pill)] ${sizeClasses}`}
			style={{ backgroundColor: bg, color: hex }}
		>
			{children}
		</span>
	);
}
