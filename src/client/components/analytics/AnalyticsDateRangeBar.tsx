import { useState } from "react";
import { format } from "date-fns";
import { FilterChips } from "@/client/components/design-system/FilterChips";
import { CustomRangeModal } from "./CustomRangeModal";
import type { DateRangePreset } from "@/client/lib/dateRange";

const PRESET_ITEMS: Array<{ label: string; value: DateRangePreset }> = [
	{ label: "Last 30 days", value: "30d" },
	{ label: "Last 90 days", value: "90d" },
	{ label: "Year to date", value: "ytd" },
	{ label: "All time", value: "all" },
	{ label: "Custom", value: "custom" },
];

const PRESET_LABELS: Record<DateRangePreset, string> = {
	"30d": "Last 30 days",
	"90d": "Last 90 days",
	ytd: "Year to date",
	all: "All time",
	custom: "Custom",
};

interface AnalyticsDateRangeBarProps {
	preset: DateRangePreset;
	customFrom?: string;
	customTo?: string;
	/** Active Date range (resolved) — used for the "Showing: …" caption. */
	appliedFrom?: Date;
	appliedTo?: Date;
	onChange: (
		preset: DateRangePreset,
		custom?: { from: string; to: string },
	) => void;
}

export function AnalyticsDateRangeBar({
	preset,
	customFrom,
	customTo,
	appliedFrom,
	appliedTo,
	onChange,
}: AnalyticsDateRangeBarProps) {
	const [modalOpen, setModalOpen] = useState(false);

	const caption =
		preset === "custom" && appliedFrom && appliedTo
			? `Showing: ${format(appliedFrom, "MMM d")} – ${format(appliedTo, "MMM d")}`
			: `Showing: ${PRESET_LABELS[preset]}`;

	const handleChipChange = (value: string) => {
		const next = value as DateRangePreset;
		if (next === "custom") {
			setModalOpen(true);
		} else {
			onChange(next);
		}
	};

	const handleApply = (range: { from: string; to: string }) => {
		onChange("custom", range);
		setModalOpen(false);
	};

	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<div className="text-sm text-text-secondary dark:text-dark-accent/70">
				{caption}
			</div>
			<FilterChips
				items={PRESET_ITEMS}
				active={preset}
				onChange={handleChipChange}
				variant="tab"
			/>
			<CustomRangeModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				onApply={handleApply}
				initialFrom={customFrom}
				initialTo={customTo}
			/>
		</div>
	);
}
