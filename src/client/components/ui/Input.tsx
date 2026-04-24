import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
}

/**
 * Auth-form input — wraps the design-system raised surface for parity with
 * the rest of the app. Kept as a separate component because auth forms
 * require a `label` (not optional), while the DS `Input` treats it as
 * optional. Once auth forms migrate fully, this can be dropped.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, className = "", id, ...props }, ref) => {
		const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
		const errorClasses = error
			? "border-status-rejected/40 focus:border-status-rejected focus:ring-status-rejected/20"
			: "";
		return (
			<div className="space-y-1.5">
				<label
					htmlFor={inputId}
					className="block text-xs font-semibold uppercase tracking-wide text-text-secondary dark:text-dark-accent/60"
				>
					{label}
				</label>
				<input
					ref={ref}
					id={inputId}
					className={`block w-full rounded-[var(--radius-input)] border border-black/[0.06] bg-white/80 px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-muted transition-colors focus:border-surface-accent/40 focus:outline-none focus:ring-2 focus:ring-surface-accent/20 dark:border-white/10 dark:bg-dark-card/80 dark:text-dark-accent dark:placeholder:text-dark-accent/40 dark:focus:border-dark-accent/40 dark:focus:ring-dark-accent/20 ${errorClasses} ${className}`}
					{...props}
				/>
				{error ? (
					<p className="text-xs text-status-rejected">{error}</p>
				) : null}
			</div>
		);
	},
);
Input.displayName = "Input";
