import { type InputHTMLAttributes, forwardRef } from "react";
import { Check } from "lucide-react";

interface CheckboxProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
	label?: string;
	hint?: string;
}

/**
 * Amber-accented checkbox. Uses a hidden native input for keyboard +
 * form-submission semantics with a custom visual overlay.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	({ label, hint, className = "", id, disabled, checked, ...props }, ref) => {
		const inputId =
			id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

		return (
			<label
				htmlFor={inputId}
				className={`group inline-flex items-start gap-2 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}
			>
				<span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
					<input
						ref={ref}
						id={inputId}
						type="checkbox"
						checked={checked}
						disabled={disabled}
						className="peer absolute inset-0 h-full w-full cursor-inherit opacity-0"
						{...props}
					/>
					<span
						className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-2 transition-all peer-focus-visible:shadow-[0_0_0_3px_rgba(245,158,11,0.18)] ${
							checked
								? "border-amber bg-amber"
								: "border-ink-5 bg-transparent group-hover:border-ink-4 dark:border-ink-4 dark:group-hover:border-ink-3"
						}`}
					>
						{checked ? (
							<Check
								size={12}
								strokeWidth={3}
								className="text-white"
								aria-hidden="true"
							/>
						) : null}
					</span>
				</span>
				{label || hint ? (
					<span className="flex flex-col gap-0.5">
						{label ? (
							<span className="text-[13px] text-ink dark:text-cream-2">
								{label}
							</span>
						) : null}
						{hint ? (
							<span className="text-[11px] text-ink-3 dark:text-ink-4">
								{hint}
							</span>
						) : null}
					</span>
				) : null}
			</label>
		);
	},
);
Checkbox.displayName = "Checkbox";
