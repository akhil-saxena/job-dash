import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

type SelectVariant = "glass" | "raised";
type SelectSize = "sm" | "md";

interface SelectOption {
	label: string;
	value: string;
}

interface SelectProps
	extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
	variant?: SelectVariant;
	size?: SelectSize;
	label?: string;
	hint?: string;
	error?: string;
	options: SelectOption[];
	placeholder?: string;
}

const sizeClasses: Record<SelectSize, string> = {
	sm: "h-[32px] pl-3 pr-8 text-xs",
	md: "h-[36px] pl-3 pr-9 text-[13px]",
};

const variantClasses: Record<SelectVariant, string> = {
	glass:
		"glass border-white/40 dark:border-white/10 focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]",
	raised:
		"bg-white/60 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/10 focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]",
};

/**
 * Native `<select>` styled to match the JobDash DS — amber focus, trailing
 * chevron, mono uppercase label. Use for simple single-choice dropdowns
 * where native OS keyboard / accessibility behaviour is preferred. For
 * custom-themed richer dropdowns, build a composite with Popover.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	(
		{
			variant = "raised",
			size = "md",
			label,
			hint,
			error,
			options,
			placeholder,
			className = "",
			id,
			...props
		},
		ref,
	) => {
		const selectId =
			id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
		const iconSize = size === "sm" ? 13 : 14;
		const errorClasses = error
			? "!border-status-rejected focus:!border-status-rejected focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
			: "";

		return (
			<div className="flex flex-col gap-1.5">
				{label ? (
					<label htmlFor={selectId} className="ds-label">
						{label}
					</label>
				) : null}
				<div className="relative">
					<select
						ref={ref}
						id={selectId}
						className={`block w-full appearance-none rounded-[var(--radius-input)] text-ink focus:outline-none transition-colors dark:text-cream-2 ${variantClasses[variant]} ${sizeClasses[size]} ${errorClasses} ${className}`}
						{...props}
					>
						{placeholder ? (
							<option value="" disabled hidden>
								{placeholder}
							</option>
						) : null}
						{options.map((o) => (
							<option key={o.value} value={o.value}>
								{o.label}
							</option>
						))}
					</select>
					<ChevronDown
						size={iconSize}
						aria-hidden="true"
						className={`pointer-events-none absolute top-1/2 ${size === "sm" ? "right-2.5" : "right-3"} -translate-y-1/2 text-ink-3 dark:text-ink-4`}
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
Select.displayName = "Select";
