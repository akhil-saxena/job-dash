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

function SourcesTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: Array<{ dataKey: string; name: string; value: number; color: string }>;
	label?: string;
}) {
	if (!active || !payload?.length) return null;
	return (
		<div className="min-w-[180px] rounded-[var(--radius-card)] border border-black/[0.06] bg-white/95 px-3 py-2 shadow-sm dark:border-white/10 dark:bg-dark-card/95">
			<div className="mb-1.5 text-xs font-semibold text-text-primary dark:text-dark-accent">
				{label}
			</div>
			<div className="flex flex-col gap-1">
				{SEGMENTS.map((seg) => {
					const entry = payload.find((p) => p.dataKey === seg.key);
					const value = entry?.value ?? 0;
					return (
						<div
							key={seg.key}
							className="flex items-center gap-2 text-xs text-text-secondary dark:text-dark-accent/70"
						>
							<span
								className="h-2 w-2 shrink-0 rounded-full"
								style={{ backgroundColor: seg.fill }}
								aria-hidden="true"
							/>
							<span className="flex-1">{seg.label}</span>
							<span className="tabular-nums font-semibold text-text-primary dark:text-dark-accent">
								{value}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
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
				<Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} content={<SourcesTooltip />} />
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
