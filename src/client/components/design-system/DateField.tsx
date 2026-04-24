import { type InputHTMLAttributes, forwardRef } from "react";
import { Calendar, Clock } from "lucide-react";

type DateFieldVariant = "glass" | "raised";
type DateFieldSize = "sm" | "md";
type DateFieldKind = "date" | "datetime-local" | "time" | "month";

interface DateFieldProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
	/** Native input type — defaults to `date`. */
	type?: DateFieldKind;
	variant?: DateFieldVariant;
	size?: DateFieldSize;
	label?: string;
	hint?: string;
	error?: string;
}

const sizeClasses: Record<DateFieldSize, string> = {
	sm: "h-[34px] pl-9 pr-2 text-xs",
	md: "h-[38px] pl-10 pr-3 text-sm",
};

const iconOffset: Record<DateFieldSize, string> = {
	sm: "left-2.5",
	md: "left-3",
};

const variantClasses: Record<DateFieldVariant, string> = {
	glass:
		"glass border-white/30 dark:border-white/10 focus:border-surface-accent/40 dark:focus:border-dark-accent/40",
	raised:
		"bg-white/80 dark:bg-dark-card/80 shadow-sm border border-black/[0.06] dark:border-white/10 focus:border-surface-accent/40 dark:focus:border-dark-accent/40",
};

/**
 * Native date / datetime-local / time input styled to match the design system.
 * - Leading calendar or clock icon for visual affordance at rest.
 * - `raised` variant reads well inside glass cards / modals.
 * - Inherits the global `color-scheme` rule so the native picker chrome
 *   follows dark-mode correctly (see src/client/index.css).
 */
export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
	(
		{
			type = "date",
			variant = "raised",
			size = "md",
			label,
			hint,
			error,
			className = "",
			id,
			...props
		},
		ref,
	) => {
		const inputId =
			id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
		const Icon = type === "time" ? Clock : Calendar;
		const iconSize = size === "sm" ? 14 : 16;
		const errorClasses = error
			? "!border-status-rejected/40 focus:!border-status-rejected focus:!ring-status-rejected/20"
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
				<div className="relative">
					<Icon
						size={iconSize}
						aria-hidden="true"
						className={`pointer-events-none absolute top-1/2 ${iconOffset[size]} -translate-y-1/2 text-text-muted dark:text-dark-accent/40`}
					/>
					<input
						ref={ref}
						id={inputId}
						type={type}
						className={`block w-full rounded-[var(--radius-input)] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-surface-accent/20 dark:text-dark-accent dark:placeholder:text-dark-accent/40 dark:focus:ring-dark-accent/20 transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${errorClasses} ${className}`}
						{...props}
					/>
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
DateField.displayName = "DateField";
