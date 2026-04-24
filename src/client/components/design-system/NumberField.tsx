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
	/** Optional currency/unit prefix rendered inside the field (e.g. "$"). */
	prefix?: string;
}

const sizeClasses: Record<NumberFieldSize, string> = {
	sm: "h-[34px] text-xs",
	md: "h-[38px] text-sm",
};

const variantClasses: Record<NumberFieldVariant, string> = {
	glass:
		"glass border-white/30 dark:border-white/10 focus-within:border-surface-accent/40 dark:focus-within:border-dark-accent/40",
	raised:
		"bg-white/80 dark:bg-dark-card/80 shadow-sm border border-black/[0.06] dark:border-white/10 focus-within:border-surface-accent/40 dark:focus-within:border-dark-accent/40",
};

/**
 * Numeric input with optional prefix / suffix affix (e.g. "$", "d", "%").
 * The input is styled as a wrapper so prefix + input + suffix share the
 * same visual surface and focus ring.
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
			className = "",
			id,
			...props
		},
		ref,
	) => {
		const inputId =
			id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
		const errorClasses = error
			? "!border-status-rejected/40 focus-within:!border-status-rejected focus-within:!ring-status-rejected/20"
			: "";

		return (
			<div className="space-y-1.5">
				{label ? (
					<label
						htmlFor={inputId}
						className="block text-xs font-semibold uppercase tracking-wide text-text-secondary dark:text-dark-accent/60"
					>
						{label}
					</label>
				) : null}
				<div
					className={`flex items-center rounded-[var(--radius-input)] transition-colors focus-within:ring-2 focus-within:ring-surface-accent/20 dark:focus-within:ring-dark-accent/20 ${variantClasses[variant]} ${sizeClasses[size]} ${errorClasses} ${className}`}
				>
					{prefix ? (
						<span
							className={`select-none pl-3 ${size === "sm" ? "text-xs" : "text-sm"} font-medium text-text-muted dark:text-dark-accent/50`}
						>
							{prefix}
						</span>
					) : null}
					<input
						ref={ref}
						id={inputId}
						type="number"
						className={`h-full w-full bg-transparent tabular-nums text-text-primary placeholder:text-text-muted focus:outline-none dark:text-dark-accent dark:placeholder:text-dark-accent/40 ${prefix ? "pl-2" : "pl-3"} ${suffix ? "pr-1" : "pr-3"}`}
						{...props}
					/>
					{suffix ? (
						<span
							className={`select-none pr-3 ${size === "sm" ? "text-xs" : "text-sm"} font-medium text-text-muted dark:text-dark-accent/50`}
						>
							{suffix}
						</span>
					) : null}
				</div>
				{error ? (
					<p className="text-xs text-status-rejected">{error}</p>
				) : hint ? (
					<p className="text-[10px] text-text-muted dark:text-dark-accent/40">
						{hint}
					</p>
				) : null}
			</div>
		);
	},
);
NumberField.displayName = "NumberField";
