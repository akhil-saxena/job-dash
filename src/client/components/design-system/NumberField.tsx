import { type InputHTMLAttributes, forwardRef } from "react";

type NumberFieldVariant = "glass" | "raised";
type NumberFieldSize = "sm" | "md";

interface NumberFieldProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
	variant?: NumberFieldVariant;
	size?: NumberFieldSize;
	label?: string;
	hint?: string;
	error?: string;
	/** Optional unit suffix rendered inside the field (e.g. "d", "%"). */
	suffix?: string;
	/** Optional currency / unit prefix rendered inside the field (e.g. "$"). */
	prefix?: string;
	/** If true, renders value + affixes in JetBrains Mono for tabular data. */
	mono?: boolean;
}

const sizeClasses: Record<NumberFieldSize, string> = {
	sm: "h-[32px] text-xs",
	md: "h-[36px] text-[13px]",
};

const variantClasses: Record<NumberFieldVariant, string> = {
	glass:
		"glass border-white/40 dark:border-white/10 focus-within:border-amber focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]",
	raised:
		"bg-white/60 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/10 focus-within:border-amber focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]",
};

/**
 * Numeric input with optional prefix / suffix affix (e.g. "$", "d", "%").
 * The wrapper holds the focus ring so prefix + input + suffix feel as a
 * single surface. `mono` renders the value in JetBrains Mono for aligned
 * tabular data.
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
	(
		{
			variant = "raised",
			size = "md",
			label,
			hint,
			error,
			prefix,
			suffix,
			mono = false,
			className = "",
			id,
			...props
		},
		ref,
	) => {
		const inputId =
			id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
		const errorClasses = error
			? "!border-status-rejected focus-within:!border-status-rejected focus-within:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
			: "";
		const affixFont = mono ? "font-mono" : "";

		return (
			<div className="flex flex-col gap-1.5">
				{label ? (
					<label htmlFor={inputId} className="ds-label">
						{label}
					</label>
				) : null}
				<div
					className={`flex items-center rounded-[var(--radius-input)] transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${errorClasses} ${className}`}
				>
					{prefix ? (
						<span
							className={`select-none pl-3 ${size === "sm" ? "text-xs" : "text-[13px]"} font-medium text-ink-3 dark:text-ink-4 ${affixFont}`}
						>
							{prefix}
						</span>
					) : null}
					<input
						ref={ref}
						id={inputId}
						type="number"
						className={`h-full w-full bg-transparent tabular-nums text-ink placeholder:text-ink-4 focus:outline-none dark:text-cream-2 dark:placeholder:text-ink-4 ${prefix ? "pl-2" : "pl-3"} ${suffix ? "pr-1" : "pr-3"} ${mono ? "font-mono" : ""}`}
						{...props}
					/>
					{suffix ? (
						<span
							className={`select-none pr-3 ${size === "sm" ? "text-xs" : "text-[13px]"} font-medium text-ink-3 dark:text-ink-4 ${affixFont}`}
						>
							{suffix}
						</span>
					) : null}
				</div>
				{error ? (
					<p className="text-[11px] font-medium text-status-rejected">
						{error}
					</p>
				) : hint ? (
					<p className="text-[11px] text-ink-3 dark:text-ink-4">{hint}</p>
				) : null}
			</div>
		);
	},
);
NumberField.displayName = "NumberField";
