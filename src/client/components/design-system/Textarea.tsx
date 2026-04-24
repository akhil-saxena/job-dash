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
		"glass border-white/40 dark:border-white/10 focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]",
	raised:
		"bg-white/60 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/10 focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]",
};

/**
 * Plain multi-line textarea styled to the JobDash DS. Use this for free
 * text where markdown rendering is NOT wanted — for markdown-supported
 * fields prefer `MarkdownField`.
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
			? "!border-status-rejected focus:!border-status-rejected focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
			: "";

		return (
			<div className="flex flex-col gap-1.5">
				{label ? (
					<label htmlFor={textareaId} className="ds-label">
						{label}
					</label>
				) : null}
				<textarea
					ref={ref}
					id={textareaId}
					rows={rows}
					className={`block w-full resize-y rounded-[var(--radius-input)] px-3 py-2.5 text-[13px] leading-relaxed text-ink placeholder:text-ink-4 focus:outline-none transition-colors dark:text-cream-2 dark:placeholder:text-ink-4 ${variantClasses[variant]} ${errorClasses} ${className}`}
					{...props}
				/>
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
Textarea.displayName = "Textarea";
