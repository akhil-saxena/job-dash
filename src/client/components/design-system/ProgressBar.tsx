import type { ReactNode } from "react";

type ProgressTone = "amber" | "green" | "blue" | "ink";

interface ProgressBarProps {
	/** Value between 0 and 100 (clamped). */
	value: number;
	/** Uppercase mono label shown above the bar. */
	label?: ReactNode;
	/** Caption shown below the bar (e.g. "72% complete"). */
	caption?: ReactNode;
	tone?: ProgressTone;
	/** Track height in pixels — default 6. */
	height?: number;
	className?: string;
}

const TONE_GRADIENTS: Record<ProgressTone, string> = {
	amber: "linear-gradient(90deg, #f59e0b, #d97706)",
	green: "linear-gradient(90deg, #22c55e, #16a34a)",
	blue: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
	ink: "linear-gradient(90deg, #57534e, #292524)",
};

const TONE_CAPTION: Record<ProgressTone, string> = {
	amber: "text-[#d97706]",
	green: "text-[#15803d]",
	blue: "text-[#1d4ed8]",
	ink: "text-ink-2 dark:text-cream-2",
};

/**
 * Horizontal progress bar with gradient fill. Use for completeness,
 * fit-scores, deadlines, or any linear scalar 0–100.
 */
export function ProgressBar({
	value,
	label,
	caption,
	tone = "amber",
	height = 6,
	className = "",
}: ProgressBarProps) {
	const clamped = Math.max(0, Math.min(100, value));

	return (
		<div className={`flex flex-col gap-1.5 ${className}`}>
			{label ? (
				typeof label === "string" ? (
					<span className="ds-label">{label}</span>
				) : (
					label
				)
			) : null}
			<div
				className="overflow-hidden rounded-full bg-cream-2 dark:bg-white/[0.06]"
				style={{ height }}
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={clamped}
			>
				<div
					className="h-full rounded-full transition-all duration-500"
					style={{ width: `${clamped}%`, background: TONE_GRADIENTS[tone] }}
				/>
			</div>
			{caption ? (
				<span className={`font-mono text-[10px] ${TONE_CAPTION[tone]}`}>
					{caption}
				</span>
			) : null}
		</div>
	);
}
