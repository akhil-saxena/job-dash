import { type InputHTMLAttributes, forwardRef, type ReactNode } from "react";

interface RadioProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
	label?: string;
	hint?: string;
}

/** Single radio button. Use inside a `RadioGroup` or a native `<form>`. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
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
						type="radio"
						checked={checked}
						disabled={disabled}
						className="peer absolute inset-0 h-full w-full cursor-inherit opacity-0"
						{...props}
					/>
					<span
						className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-all peer-focus-visible:shadow-[0_0_0_3px_rgba(245,158,11,0.18)] ${
							checked
								? "border-amber"
								: "border-ink-5 group-hover:border-ink-4 dark:border-ink-4 dark:group-hover:border-ink-3"
						}`}
					>
						{checked ? (
							<span className="h-2 w-2 rounded-full bg-amber" />
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
Radio.displayName = "Radio";

interface RadioGroupOption {
	label: string;
	value: string;
	hint?: string;
	disabled?: boolean;
}

interface RadioGroupProps {
	name: string;
	value: string;
	onChange: (value: string) => void;
	options: RadioGroupOption[];
	orientation?: "horizontal" | "vertical";
	label?: ReactNode;
}

/**
 * RadioGroup — a controlled group of mutually-exclusive Radios.
 */
export function RadioGroup({
	name,
	value,
	onChange,
	options,
	orientation = "horizontal",
	label,
}: RadioGroupProps) {
	return (
		<div className="flex flex-col gap-2">
			{label ? (
				typeof label === "string" ? (
					<span className="ds-label">{label}</span>
				) : (
					label
				)
			) : null}
			<div
				className={`flex gap-${orientation === "vertical" ? "2" : "6"} ${orientation === "vertical" ? "flex-col" : "flex-wrap"}`}
				role="radiogroup"
			>
				{options.map((o) => (
					<Radio
						key={o.value}
						name={name}
						value={o.value}
						checked={value === o.value}
						onChange={() => onChange(o.value)}
						label={o.label}
						hint={o.hint}
						disabled={o.disabled}
					/>
				))}
			</div>
		</div>
	);
}
