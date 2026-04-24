import { useEffect, useState } from "react";
import { Modal } from "@/client/components/design-system/Modal";
import { Button } from "@/client/components/design-system/Button";
import { DateField } from "@/client/components/design-system/DateField";

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
	const invalidOrder = Boolean(from && to && from > to);

	return (
		<Modal open={open} onClose={onClose} title="Custom date range">
			<div className="flex flex-col gap-4">
				<div className="grid grid-cols-2 gap-3">
					<DateField
						label="From"
						value={from}
						onChange={(e) => setFrom(e.target.value)}
						max={to || undefined}
						variant="raised"
						size="md"
					/>
					<DateField
						label="To"
						value={to}
						onChange={(e) => setTo(e.target.value)}
						min={from || undefined}
						variant="raised"
						size="md"
						error={invalidOrder ? "To must be on or after From" : undefined}
					/>
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
