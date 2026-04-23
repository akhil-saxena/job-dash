import type { ReactNode } from "react";
import { Card } from "@/client/components/design-system/Card";

interface StatCardProps {
	/** Uppercase label shown above the value (e.g. "TOTAL APPS"). */
	label: string;
	/** The displayed value — pass a string so we can show "—" for null states. */
	value: ReactNode;
	/** Optional caption below the value (e.g. "12 of 27 terminal"). */
	caption?: ReactNode;
}

/**
 * Minimal-warm stat card: glass card, p-4, label (12px semibold uppercase
 * tracking-wider) · value (28px semibold tabular-nums) · optional caption.
 * No icons per UI-SPEC (deliberate visual calm).
 */
export function StatCard({ label, value, caption }: StatCardProps) {
	return (
		<Card padding="p-4">
			<div className="flex flex-col gap-2">
				<div className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-dark-accent/40">
					{label}
				</div>
				<div className="text-[28px] font-semibold leading-none tabular-nums text-text-primary dark:text-dark-accent">
					{value}
				</div>
				{caption ? (
					<div className="text-xs text-text-muted dark:text-dark-accent/40">
						{caption}
					</div>
				) : null}
			</div>
		</Card>
	);
}
