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
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
			<div className="text-sm font-semibold text-text-primary dark:text-dark-accent sm:w-48 sm:shrink-0">
				{transitionLabel}
			</div>

			<div className="flex flex-wrap items-center gap-4">
				<NumberDayField
					label="Green <"
					value={green}
					ariaLabel={`${transitionLabel} green-below days`}
					dotColor="#22c55e"
					onChange={(v) => {
						setGreen(v);
						commit(v, amber);
					}}
					onBlur={(v) => commit(v, amber)}
					hasError={invalid && green >= amber}
				/>
				<NumberDayField
					label="Amber <"
					value={amber}
					ariaLabel={`${transitionLabel} amber-below days`}
					dotColor="#f59e0b"
					onChange={(v) => {
						setAmber(v);
						commit(green, v);
					}}
					onBlur={(v) => commit(green, v)}
					hasError={invalid && green >= amber}
				/>
				<div className="flex items-center gap-1.5 rounded-[var(--radius-input)] bg-black/[0.03] px-2 py-1 dark:bg-white/[0.04]">
					<span
						className="h-2.5 w-2.5 rounded-full"
						style={{ backgroundColor: "#ef4444" }}
						aria-hidden="true"
					/>
					<span className="text-[11px] font-medium text-text-muted dark:text-dark-accent/50">
						Red ≥ {Number.isFinite(amber) ? amber : "—"}d
					</span>
				</div>
			</div>

			{invalid ? (
				<div className="text-xs text-status-rejected sm:ml-auto">
					green must be less than amber
				</div>
			) : null}
		</div>
	);
}

interface NumberDayFieldProps {
	label: string;
	value: number;
	ariaLabel: string;
	dotColor: string;
	hasError?: boolean;
	onChange: (v: number) => void;
	onBlur: (v: number) => void;
}

function NumberDayField({
	label,
	value,
	ariaLabel,
	dotColor,
	hasError,
	onChange,
	onBlur,
}: NumberDayFieldProps) {
	return (
		<label className="flex flex-col gap-1">
			<span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted dark:text-dark-accent/40">
				<span
					className="h-2 w-2 rounded-full"
					style={{ backgroundColor: dotColor }}
					aria-hidden="true"
				/>
				{label}
			</span>
			<div
				className={`relative flex items-center rounded-[var(--radius-input)] border bg-white/80 shadow-sm transition-colors focus-within:ring-2 dark:bg-dark-card/80 ${
					hasError
						? "border-status-rejected/40 focus-within:border-status-rejected focus-within:ring-status-rejected/20"
						: "border-black/[0.06] focus-within:border-surface-accent/40 focus-within:ring-surface-accent/20 dark:border-white/10 dark:focus-within:border-dark-accent/40 dark:focus-within:ring-dark-accent/20"
				}`}
			>
				<input
					type="number"
					min={0}
					max={365}
					value={Number.isNaN(value) ? "" : value}
					onChange={(e) => onChange(Number(e.target.value))}
					onBlur={(e) => onBlur(Number(e.target.value))}
					aria-label={ariaLabel}
					className="h-[34px] w-16 bg-transparent pl-3 pr-1 text-sm tabular-nums text-text-primary focus:outline-none dark:text-dark-accent"
				/>
				<span className="pr-2.5 text-xs font-medium text-text-muted dark:text-dark-accent/50">
					d
				</span>
			</div>
		</label>
	);
}
