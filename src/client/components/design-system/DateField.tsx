import { type InputHTMLAttributes, forwardRef } from "react";
import { Calendar, Clock } from "lucide-react";

type DateFieldVariant = "glass" | "raised";
type DateFieldSize = "sm" | "md";
type DateFieldKind = "date" | "datetime-local" | "time" | "month";

interface DateFieldProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
	type?: DateFieldKind;
	variant?: DateFieldVariant;
	size?: DateFieldSize;
	label?: string;
	hint?: string;
	error?: string;
}

const sizeClasses: Record<DateFieldSize, string> = {
	sm: "h-[32px] pl-9 pr-2 text-xs",
	md: "h-[36px] pl-10 pr-3 text-[13px]",
};

const iconOffset: Record<DateFieldSize, string> = {
	sm: "left-2.5",
	md: "left-3",
};

const variantClasses: Record<DateFieldVariant, string> = {
	glass:
		"glass border-white/40 dark:border-white/10 focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]",
	raised:
		"bg-white/60 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/10 focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]",
};

/**
 * Native date / datetime-local / time input styled to match the JobDash DS.
 * - Leading calendar or clock icon.
 * - Amber focus ring per the DS reference.
 * - Inherits global `color-scheme` CSS so the native picker follows dark mode.
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
		const iconSize = size === "sm" ? 13 : 14;
		const errorClasses = error
			? "!border-status-rejected focus:!border-status-rejected focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
			: "";

		return (
			<div className="flex flex-col gap-1.5">
				{label ? (
					<label htmlFor={inputId} className="ds-label">
						{label}
					</label>
				) : null}
				<div className="relative">
					<Icon
						size={iconSize}
						aria-hidden="true"
						className={`pointer-events-none absolute top-1/2 ${iconOffset[size]} -translate-y-1/2 text-ink-3 dark:text-ink-4`}
					/>
					<input
						ref={ref}
						id={inputId}
						type={type}
						className={`block w-full rounded-[var(--radius-input)] text-ink placeholder:text-ink-4 focus:outline-none transition-colors dark:text-cream-2 dark:placeholder:text-ink-4 ${variantClasses[variant]} ${sizeClasses[size]} ${errorClasses} ${className}`}
						{...props}
					/>
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
DateField.displayName = "DateField";
