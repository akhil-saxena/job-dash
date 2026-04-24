import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "filled" | "amber" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	/** Legacy prop — use `variant="danger"` for destructive actions. */
	color?: "default" | "destructive";
	loading?: boolean;
}

const base =
	"inline-flex items-center justify-center gap-1.5 font-semibold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-amber/30 disabled:pointer-events-none disabled:opacity-50 rounded-[var(--radius-btn)] active:scale-[0.97]";

const variants: Record<ButtonVariant, string> = {
	// Dark/ink-filled CTA — the primary "dark" button from the DS reference
	filled:
		"bg-ink text-cream border border-ink hover:bg-[#1c1917] dark:bg-cream-3 dark:text-ink dark:border-cream-3 dark:hover:bg-[#e4e4e7]",
	// Amber brand CTA — use sparingly for the single primary accent action
	amber:
		"bg-amber text-white border border-amber-d hover:bg-amber-d",
	// Secondary / neutral — glass surface, thin border
	outline:
		"bg-[rgba(255,255,255,0.55)] backdrop-blur-sm text-ink-2 border border-black/[0.08] hover:bg-cream-2 hover:border-black/[0.12] dark:bg-white/[0.06] dark:text-cream-2 dark:border-white/10 dark:hover:bg-white/10",
	// Minimal hoverable
	ghost:
		"bg-transparent text-ink-2 border border-transparent hover:bg-black/[0.04] dark:text-cream-2 dark:hover:bg-white/[0.06]",
	// Destructive
	danger:
		"bg-[rgba(239,68,68,0.1)] text-[#dc2626] border border-[rgba(239,68,68,0.25)] hover:bg-status-rejected hover:text-white hover:border-status-rejected",
};

const sizes: Record<ButtonSize, string> = {
	sm: "h-7 px-2.5 text-[11px]",
	md: "h-[30px] px-3.5 text-xs",
	lg: "h-[38px] px-5 text-sm",
};

/**
 * Primary action button — JobDash DS v1.
 *
 * Variants:
 * - `filled` (default): ink-dark filled CTA — the common "save / submit"
 * - `amber`: amber brand CTA — reserved for the top-of-page hero action
 *   (e.g. "Advance →" on the detail pipeline)
 * - `outline`: neutral glass-backed secondary action
 * - `ghost`: minimal hoverable — use inside toolbars and dropdown rows
 * - `danger`: destructive action (delete, remove)
 *
 * `color="destructive"` is a legacy alias for `variant="danger"`.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "filled",
			size = "md",
			color,
			loading,
			children,
			className = "",
			disabled,
			...props
		},
		ref,
	) => {
		// Legacy: translate color="destructive" to variant="danger"
		const resolved: ButtonVariant =
			color === "destructive" ? "danger" : variant;

		return (
			<button
				ref={ref}
				className={`${base} ${variants[resolved]} ${sizes[size]} ${className}`}
				disabled={disabled || loading}
				{...props}
			>
				{loading ? (
					<svg
						className="h-3.5 w-3.5 animate-spin"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						/>
					</svg>
				) : null}
				{children}
			</button>
		);
	},
);
Button.displayName = "Button";
