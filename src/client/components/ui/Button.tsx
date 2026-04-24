import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "google";
	size?: "sm" | "md" | "lg";
	loading?: boolean;
}

/**
 * Auth-form button — tuned to match the design-system palette while keeping
 * the legacy variant names (primary / secondary / outline / google) that the
 * auth forms use. `primary` maps to the surface-accent fill used elsewhere
 * for primary CTAs.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "primary",
			size = "md",
			loading,
			children,
			className = "",
			disabled,
			...props
		},
		ref,
	) => {
		const base =
			"inline-flex items-center justify-center rounded-[var(--radius-btn)] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-accent/40 disabled:pointer-events-none disabled:opacity-50";
		const variants: Record<string, string> = {
			primary:
				"bg-surface-accent text-white hover:bg-[#1c1917] dark:bg-dark-accent dark:text-dark-dominant dark:hover:bg-[#e4e4e7]",
			secondary:
				"bg-black/[0.04] text-text-primary hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-dark-accent dark:hover:bg-white/[0.1]",
			outline:
				"border border-black/10 bg-transparent text-text-primary hover:bg-black/[0.04] dark:border-white/15 dark:text-dark-accent dark:hover:bg-white/[0.06]",
			google:
				"border border-black/10 bg-white text-text-primary hover:bg-black/[0.03] gap-2 dark:border-white/15 dark:bg-dark-card dark:text-dark-accent dark:hover:bg-white/[0.06]",
		};
		const sizes: Record<string, string> = {
			sm: "h-[30px] px-3 text-xs",
			md: "h-[36px] px-4 text-sm",
			lg: "h-[44px] px-6 text-sm",
		};

		return (
			<button
				ref={ref}
				className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
				disabled={disabled || loading}
				{...props}
			>
				{loading ? (
					<svg
						className="mr-2 h-4 w-4 animate-spin"
						viewBox="0 0 24 24"
						fill="none"
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
