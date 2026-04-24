import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";

type InputBaseProps = {
	variant?: "glass" | "raised";
	label?: string;
	error?: string;
	hint?: string;
	as?: "input" | "textarea";
};

type InputAsInput = InputBaseProps & {
	as?: "input";
} & Omit<InputHTMLAttributes<HTMLInputElement>, "as">;

type InputAsTextarea = InputBaseProps & {
	as: "textarea";
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "as">;

type InputProps = InputAsInput | InputAsTextarea;

const baseClasses =
	"block w-full px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none transition-colors rounded-[var(--radius-input)] dark:text-cream-2 dark:placeholder:text-ink-4";

const variantClasses: Record<string, string> = {
	glass:
		"glass border-white/40 dark:border-white/10 focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]",
	raised:
		"bg-white/60 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/10 focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]",
};

export const Input = forwardRef<
	HTMLInputElement | HTMLTextAreaElement,
	InputProps
>(({ variant = "raised", label, error, hint, as = "input", className = "", ...props }, ref) => {
	const inputId =
		props.id ||
		(label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
	const errorClasses = error
		? "!border-status-rejected focus:!border-status-rejected focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
		: "";
	const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${errorClasses} ${className}`;

	return (
		<div className="flex flex-col gap-1.5">
			{label ? (
				<label htmlFor={inputId} className="ds-label">
					{label}
				</label>
			) : null}
			{as === "textarea" ? (
				<textarea
					ref={ref as React.Ref<HTMLTextAreaElement>}
					id={inputId}
					className={`${combinedClasses} resize-y min-h-[80px] leading-relaxed`}
					{...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
				/>
			) : (
				<input
					ref={ref as React.Ref<HTMLInputElement>}
					id={inputId}
					className={combinedClasses}
					{...(props as InputHTMLAttributes<HTMLInputElement>)}
				/>
			)}
			{error ? (
				<p className="text-[11px] font-medium text-status-rejected">{error}</p>
			) : hint ? (
				<p className="text-[11px] text-ink-3 dark:text-ink-4">{hint}</p>
			) : null}
		</div>
	);
});
Input.displayName = "Input";
