import { type TextareaHTMLAttributes, forwardRef } from "react";

type TextareaVariant = "glass" | "raised";

interface TextareaProps
	extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
	variant?: TextareaVariant;
	label?: string;
	hint?: string;
	error?: string;
}

const variantClasses: Record<TextareaVariant, string> = {
	glass:
		"glass border-white/30 dark:border-white/10 focus:border-surface-accent/40 dark:focus:border-dark-accent/40",
	raised:
		"bg-white/80 dark:bg-dark-card/80 shadow-sm border border-black/[0.06] dark:border-white/10 focus:border-surface-accent/40 dark:focus:border-dark-accent/40",
};

/**
 * Plain multi-line textarea styled to match the design system. Use this for
 * free-text input where you explicitly do NOT want markdown rendering. For
 * markdown-supported fields use `MarkdownField` instead.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{
			variant = "raised",
			label,
			hint,
			error,
			className = "",
			id,
			rows = 4,
			...props
		},
		ref,
	) => {
		const textareaId =
			id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
		const errorClasses = error
			? "!border-status-rejected/40 focus:!border-status-rejected focus:!ring-status-rejected/20"
			: "";

		return (
			<div className="space-y-1.5">
				{label ? (
					<label
						htmlFor={textareaId}
						className="block text-xs font-semibold uppercase tracking-wide text-text-secondary dark:text-dark-accent/60"
					>
						{label}
					</label>
				) : null}
				<textarea
					ref={ref}
					id={textareaId}
					rows={rows}
					className={`block w-full resize-y rounded-[var(--radius-input)] px-3 py-2 text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-surface-accent/20 dark:text-dark-accent dark:placeholder:text-dark-accent/40 dark:focus:ring-dark-accent/20 transition-colors ${variantClasses[variant]} ${errorClasses} ${className}`}
					{...props}
				/>
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
Textarea.displayName = "Textarea";
