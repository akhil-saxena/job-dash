import {
	BarChart,
	Bar,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Filter } from "lucide-react";
import type { SourceRow } from "@/client/hooks/useAnalytics";

// ANLY-02 / UI-SPEC source segment palette.
// Fixed left-to-right stack order.
const SEGMENTS = [
	{ key: "offer", label: "Offer", fill: "#22c55e" },
	{ key: "interviewing", label: "Interviewing", fill: "#f59e0b" },
	{ key: "rejected", label: "Rejected", fill: "#ef4444" },
	{ key: "ghosted", label: "Ghosted", fill: "#a8a29e" },
	{ key: "withdrawn", label: "Withdrawn", fill: "#64748b" },
] as const;

interface SourceEffectivenessChartProps {
	data: SourceRow[];
}

export function SourceEffectivenessChart({
	data,
}: SourceEffectivenessChartProps) {
	if (!data || data.length === 0) {
		// Per UI-SPEC "Sources panel all filtered" empty state.
		return (
			<div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
				<Filter size={20} className="text-text-muted" />
				<div className="text-sm text-text-secondary dark:text-dark-accent/60">
					No applications in the selected date range.
				</div>
				<div className="text-xs text-text-muted dark:text-dark-accent/40">
					Try expanding the range or picking 'All time'.
				</div>
			</div>
		);
	}

	return (
		<ResponsiveContainer width="100%" height={352}>
			<BarChart
				data={data}
				layout="vertical"
				barCategoryGap={12}
				margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
			>
				<XAxis type="number" hide />
				<YAxis
					type="category"
					dataKey="source"
					width={120}
					tick={{ fontSize: 12 }}
				/>
				<Tooltip cursor={false} />
				<Legend
					align="left"
					verticalAlign="bottom"
					iconType="square"
					wrapperStyle={{ fontSize: 12 }}
				/>
				{SEGMENTS.map((seg) => (
					<Bar
						key={seg.key}
						dataKey={seg.key}
						name={seg.label}
						stackId="outcome"
						fill={seg.fill}
						isAnimationActive={false}
					/>
				))}
			</BarChart>
		</ResponsiveContainer>
	);
}
