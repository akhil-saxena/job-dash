import type { ApplicationStatus } from "@/shared/constants";
import { STATUS_COLORS, STATUS_LABELS } from "@/client/lib/colors";
import { Badge } from "./Badge";

interface ColumnHeaderProps {
	status: ApplicationStatus;
	count: number;
	variant?: "filled" | "minimal";
	label?: string;
}

export function ColumnHeader({
	status,
	count,
	variant = "filled",
	label: labelOverride,
}: ColumnHeaderProps) {
	const color = STATUS_COLORS[status];
	const label = labelOverride ?? STATUS_LABELS[status];

	if (variant === "minimal") {
		return (
			<div className="flex items-center gap-2 px-1 py-1.5">
				<span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted dark:text-dark-accent/50">
					{label}
				</span>
				<span className="text-[10px] text-text-muted dark:text-dark-accent/40">
					{count}
				</span>
			</div>
		);
	}

	// filled (default)
	return (
		<div
			className="flex items-center gap-2 rounded-[var(--radius-card)] px-3 py-2"
			style={{ backgroundColor: `${color}14` }}
		>
			<span
				className="inline-block h-2 w-2 rounded-full"
				style={{ backgroundColor: color }}
			/>
			<span className="text-xs font-semibold text-text-primary dark:text-dark-accent">
				{label}
			</span>
			{count > 0 && (
				<Badge variant="filled" color={status} size="sm">
					{count}
				</Badge>
			)}
		</div>
	);
}
