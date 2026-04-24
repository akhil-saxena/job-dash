import type { ReactNode } from "react";

interface SectionHeaderProps {
	/** Section title, rendered in Archivo. */
	title: ReactNode;
	/** Optional count rendered as a mono chip to the right. */
	count?: number | string;
	/** Optional caption rendered below or to the right of the title. */
	caption?: ReactNode;
	/** Optional right-side action cluster (buttons, filters). */
	actions?: ReactNode;
	/** Hide the amber bar accent. */
	hideAccent?: boolean;
	className?: string;
}

/**
 * Repeated "amber bar + Archivo title + mono count + right-aligned actions"
 * section header pattern used throughout the app (Deadlines, Interviews,
 * Notes, At-a-glance, Company Research, Timeline, etc.). Extract this so
 * the pattern is consistent everywhere and tweaks land in one place.
 */
export function SectionHeader({
	title,
	count,
	caption,
	actions,
	hideAccent = false,
	className = "",
}: SectionHeaderProps) {
	return (
		<div className={`flex items-center gap-2.5 ${className}`}>
			{hideAccent ? null : (
				<span
					className="inline-block h-[14px] w-1 shrink-0 rounded-[2px] bg-amber"
					aria-hidden="true"
				/>
			)}
			<div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5">
				<h3 className="font-display text-[14px] font-bold tracking-tight text-ink dark:text-cream-2">
					{title}
				</h3>
				{count !== undefined ? (
					<span className="rounded-md bg-cream-2 px-1.5 py-[1px] font-mono text-[10px] font-bold text-ink-3 dark:bg-white/[0.06] dark:text-ink-4">
						{count}
					</span>
				) : null}
				{caption ? (
					<span className="text-[11px] text-ink-3 dark:text-ink-4">
						{caption}
					</span>
				) : null}
			</div>
			{actions ? (
				<div className="flex shrink-0 items-center gap-2">{actions}</div>
			) : null}
		</div>
	);
}
