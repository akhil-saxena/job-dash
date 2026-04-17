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
	"block w-full px-3 py-2 text-text-primary dark:text-dark-accent placeholder:text-text-muted dark:placeholder:text-dark-accent/40 focus:outline-none focus:ring-2 focus:ring-surface-accent/20 focus:border-surface-accent/40 dark:focus:ring-dark-accent/20 dark:focus:border-dark-accent/40 transition-colors rounded-[var(--radius-input)]";

const variantClasses: Record<string, string> = {
	glass: "glass border-white/30 dark:border-white/10",
	raised:
		"bg-white/80 dark:bg-dark-card/80 shadow-sm border border-black/[0.06] dark:border-white/10",
};

export const Input = forwardRef<
	HTMLInputElement | HTMLTextAreaElement,
	InputProps
>(({ variant = "glass", label, error, hint, as = "input", className = "", ...props }, ref) => {
	const inputId =
		props.id ||
		(label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
	const errorClasses = error
		? "border-status-rejected/40 focus:border-status-rejected focus:ring-status-rejected/20"
		: "";
	const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${errorClasses} ${className}`;

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
			{as === "textarea" ? (
				<textarea
					ref={ref as React.Ref<HTMLTextAreaElement>}
					id={inputId}
					className={`${combinedClasses} resize-y min-h-[80px]`}
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
				<p className="text-xs text-status-rejected">{error}</p>
			) : null}
			{hint && !error ? (
				<p className="text-[10px] text-text-muted dark:text-dark-accent/40">
					{hint}
				</p>
			) : null}
		</div>
	);
});
Input.displayName = "Input";
