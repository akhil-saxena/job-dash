import { type InputHTMLAttributes, forwardRef } from "react";

interface ToggleProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
	label?: string;
	hint?: string;
	labelPosition?: "right" | "left";
}

/**
 * Amber-accented toggle switch. Wraps a hidden native checkbox so forms
 * and accessibility behave correctly.
 */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
	(
		{
			label,
			hint,
			labelPosition = "right",
			className = "",
			id,
			disabled,
			checked,
			...props
		},
		ref,
	) => {
		const inputId =
			id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
		const toggle = (
			<span className="relative flex h-5 w-9 shrink-0 items-center">
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
					className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors peer-focus-visible:shadow-[0_0_0_3px_rgba(245,158,11,0.18)] ${
						checked ? "bg-amber" : "bg-ink-5 dark:bg-ink-4"
					}`}
				>
					<span
						className={`h-4 w-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform ${
							checked ? "translate-x-4" : "translate-x-0"
						}`}
					/>
				</span>
			</span>
		);
		const labelNode = label || hint ? (
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
		) : null;

		return (
			<label
				htmlFor={inputId}
				className={`inline-flex items-center gap-2.5 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}
			>
				{labelPosition === "left" && labelNode}
				{toggle}
				{labelPosition === "right" && labelNode}
			</label>
		);
	},
);
Toggle.displayName = "Toggle";
