import type { ApplicationStatus } from "@/shared/constants";
import { STATUS_COLORS, STATUS_LABELS } from "@/client/lib/colors";

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

	// filled (default) — dot + bold label + amber pill count badge
	return (
		<div className="flex items-center gap-2 py-1.5">
			<span
				className="inline-block h-2 w-2 shrink-0 rounded-full"
				style={{ backgroundColor: color }}
			/>
			<span className="text-[13px] font-bold text-text-primary dark:text-dark-accent">
				{label}
			</span>
			{count > 0 ? (
				<span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
					{count}
				</span>
			) : (
				<span className="ml-auto rounded-full bg-black/[0.04] px-1.5 py-0.5 font-mono text-[10px] font-bold text-text-muted dark:bg-white/[0.06] dark:text-dark-accent/40">
					0
				</span>
			)}
		</div>
	);
}
