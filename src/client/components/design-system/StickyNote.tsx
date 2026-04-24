import type { ReactNode } from "react";

interface StickyNoteProps {
	children: ReactNode;
	hint?: ReactNode;
	/** Small rotation in degrees for the lived-in feel. Default -0.6. */
	rotate?: number;
	onClick?: () => void;
	className?: string;
}

/**
 * Amber sticky note — lived-in surface with a slight rotation, used in the
 * Overview sidebar for a quick-glance snippet of longer notes. Renders as
 * a `<button>` when `onClick` is provided so it's keyboard-navigable.
 */
export function StickyNote({
	children,
	hint,
	rotate = -0.6,
	onClick,
	className = "",
}: StickyNoteProps) {
	const shared =
		"rounded-[10px] px-4 py-3.5 font-display font-semibold text-[13.5px] leading-snug text-[#292524] transition-transform";
	const style = {
		background: "linear-gradient(145deg, #fef3c7, #fde68a)",
		border: "1px solid rgba(245,158,11,0.25)",
		transform: `rotate(${rotate}deg)`,
		boxShadow: "0 2px 8px rgba(245,158,11,0.15)",
	} as const;

	const body = (
		<>
			<div>{children}</div>
			{hint ? (
				<div className="mt-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[#b45309] opacity-75">
					{hint}
				</div>
			) : null}
		</>
	);

	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				className={`${shared} text-left hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50 ${className}`}
				style={style}
			>
				{body}
			</button>
		);
	}

	return (
		<div className={`${shared} ${className}`} style={style}>
			{body}
		</div>
	);
}
