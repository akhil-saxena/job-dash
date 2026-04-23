import {
	BarChart,
	Bar,
	Cell,
	LabelList,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { FunnelData } from "@/client/hooks/useAnalytics";

// ANLY-01 / UI-SPEC funnel palette — each stage uses the existing status color.
const FUNNEL_STAGES = [
	{ key: "applied", label: "Applied", fill: "#3b82f6" },
	{ key: "screening", label: "Screening", fill: "#8b5cf6" },
	{ key: "interviewing", label: "Interviewing", fill: "#f59e0b" },
	{ key: "offer", label: "Offer", fill: "#22c55e" },
] as const;

type StageKey = (typeof FUNNEL_STAGES)[number]["key"];

const PREV_STAGE: Record<StageKey, StageKey | null> = {
	applied: null,
	screening: "applied",
	interviewing: "screening",
	offer: "interviewing",
};

interface PipelineFunnelChartProps {
	data: FunnelData;
}

type ChartRow = {
	label: string;
	count: number;
	fill: string;
	conversionCopy: string;
	ariaLabel: string;
};

export function PipelineFunnelChart({ data }: PipelineFunnelChartProps) {
	const rows: ChartRow[] = FUNNEL_STAGES.map((stage) => {
		const entry = data[stage.key];
		const prev = PREV_STAGE[stage.key];
		const conversionCopy = prev
			? `${entry.conversionPct}% of ${FUNNEL_STAGES.find((s) => s.key === prev)!.label}`
			: "100%";
		const ariaLabel = prev
			? `${stage.label} stage: ${entry.count} applications, ${entry.conversionPct}% conversion from ${FUNNEL_STAGES.find((s) => s.key === prev)!.label}`
			: `${stage.label} stage: ${entry.count} applications, baseline`;
		return {
			label: stage.label,
			count: entry.count,
			fill: stage.fill,
			conversionCopy,
			ariaLabel,
		};
	});

	const allZero = rows.every((r) => r.count === 0);
	if (allZero) {
		// Per UI-SPEC funnel stalled-at-Applied empty state.
		return (
			<div className="flex min-h-[140px] items-center justify-center text-center text-sm text-text-secondary dark:text-dark-accent/60">
				More stages will unlock as applications progress past Applied.
			</div>
		);
	}

	return (
		<ResponsiveContainer width="100%" height={280}>
			<BarChart
				data={rows}
				layout="vertical"
				barCategoryGap={16}
				margin={{ top: 0, right: 120, bottom: 0, left: 0 }}
			>
				<XAxis type="number" hide />
				<YAxis type="category" dataKey="label" hide />
				<Tooltip
					cursor={false}
					formatter={(value: number, _name: string, entry: any) => [
						`${value} apps · ${entry?.payload?.conversionCopy ?? ""}`,
						entry?.payload?.label ?? "",
					]}
				/>
				<Bar
					dataKey="count"
					radius={[0, 4, 4, 0]}
					isAnimationActive={false}
					aria-label="Pipeline funnel bars"
				>
					<LabelList
						dataKey={(entry: any) => `${entry.label} · ${entry.count}`}
						position="insideLeft"
						style={{ fill: "#ffffff", fontSize: 12, fontWeight: 600 }}
					/>
					<LabelList
						dataKey="conversionCopy"
						position="right"
						style={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }}
					/>
					{rows.map((row) => (
						<Cell key={row.label} fill={row.fill} aria-label={row.ariaLabel} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}
