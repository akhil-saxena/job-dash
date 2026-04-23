import { useEffect, useRef, useState } from "react";

interface ThresholdPair {
	greenBelow: number;
	amberBelow: number;
}

interface ThresholdRowProps {
	transitionLabel: string;
	threshold: ThresholdPair;
	/** Called when values change AND pass validation (green < amber). Debounced
	 *  upstream; this component emits on every keystroke. */
	onChange: (next: ThresholdPair) => void;
}

/**
 * Single row in the Settings > Analytics threshold editor.
 * Two number inputs (green-below, amber-below) + three colour preview dots
 * labelled Green / Amber / Red. Inline error if green >= amber.
 */
export function ThresholdRow({
	transitionLabel,
	threshold,
	onChange,
}: ThresholdRowProps) {
	const [green, setGreen] = useState<number>(threshold.greenBelow);
	const [amber, setAmber] = useState<number>(threshold.amberBelow);
	const prevRef = useRef<ThresholdPair>(threshold);

	// If parent state changes (e.g. reset-to-defaults), sync local state.
	useEffect(() => {
		if (
			threshold.greenBelow !== prevRef.current.greenBelow ||
			threshold.amberBelow !== prevRef.current.amberBelow
		) {
			setGreen(threshold.greenBelow);
			setAmber(threshold.amberBelow);
			prevRef.current = threshold;
		}
	}, [threshold]);

	const invalid =
		!Number.isInteger(green) ||
		!Number.isInteger(amber) ||
		green < 0 ||
		amber < 0 ||
		green > 365 ||
		amber > 365 ||
		green >= amber;

	const commit = (g: number, a: number) => {
		if (
			Number.isInteger(g) &&
			Number.isInteger(a) &&
			g >= 0 &&
			a >= 0 &&
			g <= 365 &&
			a <= 365 &&
			g < a
		) {
			onChange({ greenBelow: g, amberBelow: a });
		}
	};

	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
			<div className="text-sm font-semibold text-text-primary dark:text-dark-accent sm:w-48">
				{transitionLabel}
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<label className="flex items-center gap-1 text-xs text-text-muted dark:text-dark-accent/40">
					green &lt;
					<input
						type="number"
						min={0}
						max={365}
						value={Number.isNaN(green) ? "" : green}
						onChange={(e) => {
							const v = Number(e.target.value);
							setGreen(v);
							commit(v, amber);
						}}
						onBlur={(e) => {
							const v = Number(e.target.value);
							commit(v, amber);
						}}
						className="w-20 rounded-[var(--radius-input)] border border-black/[0.06] bg-white/80 px-2 py-1 text-sm text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-surface-accent/20 dark:border-white/10 dark:bg-dark-card/80 dark:text-dark-accent"
						aria-label={`${transitionLabel} green-below days`}
					/>
					<span className="text-xs text-text-muted dark:text-dark-accent/40">
						d
					</span>
				</label>

				<label className="flex items-center gap-1 text-xs text-text-muted dark:text-dark-accent/40">
					amber &lt;
					<input
						type="number"
						min={0}
						max={365}
						value={Number.isNaN(amber) ? "" : amber}
						onChange={(e) => {
							const v = Number(e.target.value);
							setAmber(v);
							commit(green, v);
						}}
						onBlur={(e) => {
							const v = Number(e.target.value);
							commit(green, v);
						}}
						className="w-20 rounded-[var(--radius-input)] border border-black/[0.06] bg-white/80 px-2 py-1 text-sm text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-surface-accent/20 dark:border-white/10 dark:bg-dark-card/80 dark:text-dark-accent"
						aria-label={`${transitionLabel} amber-below days`}
					/>
					<span className="text-xs text-text-muted dark:text-dark-accent/40">
						d
					</span>
				</label>

				<div className="flex items-center gap-2">
					<PreviewDot color="#22c55e" label="Green" />
					<PreviewDot color="#f59e0b" label="Amber" />
					<PreviewDot color="#ef4444" label="Red" />
				</div>
			</div>

			{invalid ? (
				<div className="text-xs text-status-rejected">
					green must be less than amber
				</div>
			) : null}
		</div>
	);
}

function PreviewDot({ color, label }: { color: string; label: string }) {
	return (
		<div className="flex flex-col items-center gap-0.5">
			<span
				className="h-3 w-3 rounded-full"
				style={{ backgroundColor: color }}
				aria-hidden="true"
			/>
			<span className="text-[10px] text-text-muted dark:text-dark-accent/40">
				{label}
			</span>
		</div>
	);
}
