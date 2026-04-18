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
			<div className="flex items-center gap-2 py-1">
				<span
					className="inline-block h-2 w-2 shrink-0 rounded-full"
					style={{ backgroundColor: color }}
				/>
				<span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary dark:text-dark-accent/60">
					{label}
				</span>
				{count > 0 && (
					<span className="text-[11px] tabular-nums text-text-muted dark:text-dark-accent/40">
						{count}
					</span>
				)}
			</div>
		);
	}

	// filled (default) — card style with count badge right-aligned
	return (
		<div
			className="flex h-9 items-center gap-2 rounded-lg px-3"
			style={{ backgroundColor: `${color}14` }}
		>
			<span
				className="inline-block h-2 w-2 shrink-0 rounded-full"
				style={{ backgroundColor: color }}
			/>
			<span className="text-xs font-semibold text-text-primary dark:text-dark-accent">
				{label}
			</span>
			{count > 0 && (
				<span className="ml-auto">
					<Badge variant="filled" color={status} size="sm">
						{count}
					</Badge>
				</span>
			)}
		</div>
	);
}
