import { useEffect, useState } from "react";
import { Modal } from "@/client/components/design-system/Modal";
import { Button } from "@/client/components/design-system/Button";

interface CustomRangeModalProps {
	open: boolean;
	onClose: () => void;
	onApply: (range: { from: string; to: string }) => void;
	/** Initial values in YYYY-MM-DD (optional). */
	initialFrom?: string;
	initialTo?: string;
}

export function CustomRangeModal({
	open,
	onClose,
	onApply,
	initialFrom,
	initialTo,
}: CustomRangeModalProps) {
	const [from, setFrom] = useState<string>(initialFrom ?? "");
	const [to, setTo] = useState<string>(initialTo ?? "");

	useEffect(() => {
		if (open) {
			setFrom(initialFrom ?? "");
			setTo(initialTo ?? "");
		}
	}, [open, initialFrom, initialTo]);

	const canApply = Boolean(from && to && from <= to);

	return (
		<Modal open={open} onClose={onClose} title="Custom date range">
			<div className="flex flex-col gap-4">
				<div className="grid grid-cols-2 gap-3">
					<label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-dark-accent/60">
						From
						<input
							type="date"
							value={from}
							onChange={(e) => setFrom(e.target.value)}
							className="rounded-[var(--radius-input)] border border-black/[0.06] bg-white/80 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-surface-accent/20 dark:border-white/10 dark:bg-dark-card/80 dark:text-dark-accent"
						/>
					</label>
					<label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-dark-accent/60">
						To
						<input
							type="date"
							value={to}
							onChange={(e) => setTo(e.target.value)}
							className="rounded-[var(--radius-input)] border border-black/[0.06] bg-white/80 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-surface-accent/20 dark:border-white/10 dark:bg-dark-card/80 dark:text-dark-accent"
						/>
					</label>
				</div>
				<div className="flex items-center justify-end gap-2">
					<Button variant="ghost" size="sm" onClick={onClose}>
						Keep previous range
					</Button>
					<Button
						variant="filled"
						size="sm"
						onClick={() => onApply({ from, to })}
						disabled={!canApply}
					>
						Apply range
					</Button>
				</div>
			</div>
		</Modal>
	);
}
