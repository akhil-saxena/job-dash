import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "filled" | "outline" | "ghost";
	size?: "sm" | "md";
	color?: "default" | "destructive";
	loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "filled",
			size = "md",
			color = "default",
			loading,
			children,
			className = "",
			disabled,
			...props
		},
		ref,
	) => {
		const base =
			"inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-accent/40 disabled:pointer-events-none disabled:opacity-50 rounded-[var(--radius-btn)]";

		const variants: Record<string, Record<string, string>> = {
			filled: {
				default:
					"bg-surface-accent text-white hover:bg-[#1c1917] dark:bg-dark-accent dark:text-dark-dominant dark:hover:bg-[#e4e4e7]",
				destructive:
					"bg-status-rejected text-white hover:bg-[#dc2626] dark:bg-status-rejected dark:hover:bg-[#dc2626]",
			},
			outline: {
				default:
					"border border-black/10 bg-transparent hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.06]",
				destructive:
					"border border-status-rejected/30 text-status-rejected bg-transparent hover:bg-status-rejected/[0.06]",
			},
			ghost: {
				default:
					"bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]",
				destructive:
					"bg-status-rejected/[0.06] text-status-rejected hover:bg-status-rejected/[0.1]",
			},
		};

		const sizes: Record<string, string> = {
			sm: "h-[30px] px-3 text-xs",
			md: "h-[34px] px-4 text-sm",
		};

		const variantClass = variants[variant]?.[color] ?? variants.filled.default;

		return (
			<button
				ref={ref}
				className={`${base} ${variantClass} ${sizes[size]} ${className}`}
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
