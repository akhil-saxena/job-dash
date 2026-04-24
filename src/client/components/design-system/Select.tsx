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
	sm: "h-[34px] pl-3 pr-8 text-xs",
	md: "h-[38px] pl-3 pr-9 text-sm",
};

const variantClasses: Record<SelectVariant, string> = {
	glass:
		"glass border-white/30 dark:border-white/10 focus:border-surface-accent/40 dark:focus:border-dark-accent/40",
	raised:
		"bg-white/80 dark:bg-dark-card/80 shadow-sm border border-black/[0.06] dark:border-white/10 focus:border-surface-accent/40 dark:focus:border-dark-accent/40",
};

/**
 * Styled `<select>` with a trailing chevron icon. Shares the design-system
 * raised/glass surface and focus ring. Use this instead of raw `<select>`
 * for visual parity with Input + DateField.
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
		const iconSize = size === "sm" ? 14 : 16;
		const errorClasses = error
			? "!border-status-rejected/40 focus:!border-status-rejected focus:!ring-status-rejected/20"
			: "";

		return (
			<div className="space-y-1.5">
				{label ? (
					<label
						htmlFor={selectId}
						className="block text-xs font-semibold uppercase tracking-wide text-text-secondary dark:text-dark-accent/60"
					>
						{label}
					</label>
				) : null}
				<div className="relative">
					<select
						ref={ref}
						id={selectId}
						className={`block w-full appearance-none rounded-[var(--radius-input)] text-text-primary focus:outline-none focus:ring-2 focus:ring-surface-accent/20 dark:text-dark-accent dark:focus:ring-dark-accent/20 transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${errorClasses} ${className}`}
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
						className={`pointer-events-none absolute top-1/2 ${size === "sm" ? "right-2.5" : "right-3"} -translate-y-1/2 text-text-muted dark:text-dark-accent/40`}
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
Select.displayName = "Select";
