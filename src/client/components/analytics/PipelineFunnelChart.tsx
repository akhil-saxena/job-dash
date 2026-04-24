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

type ChartRow = {
	label: string;
	count: number;
	fill: string;
	conversionCopy: string;
	prevLabel: string | null;
	ariaLabel: string;
};

function FunnelTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{ payload: ChartRow }>;
}) {
	if (!active || !payload?.length) return null;
	const row = payload[0].payload;
	return (
		<div className="rounded-[var(--radius-card)] border border-black/[0.06] bg-white/95 px-3 py-2 text-xs shadow-sm dark:border-white/10 dark:bg-dark-card/95">
			<div className="font-semibold text-text-primary dark:text-dark-accent">
				{row.label}: {row.count} applications
			</div>
			<div className="mt-0.5 text-text-secondary dark:text-dark-accent/70">
				{row.prevLabel
					? `${row.conversionCopy} conversion from ${row.prevLabel}`
					: "Top of funnel"}
			</div>
		</div>
	);
}

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

export function PipelineFunnelChart({ data }: PipelineFunnelChartProps) {
	const rows: ChartRow[] = FUNNEL_STAGES.map((stage) => {
		const entry = data[stage.key];
		const prev = PREV_STAGE[stage.key];
		const prevLabel = prev
			? (FUNNEL_STAGES.find((s) => s.key === prev)?.label ?? null)
			: null;
		const conversionCopy = prevLabel
			? `${entry.conversionPct}% of ${prevLabel}`
			: "100%";
		const ariaLabel = prevLabel
			? `${stage.label} stage: ${entry.count} applications, ${entry.conversionPct}% conversion from ${prevLabel}`
			: `${stage.label} stage: ${entry.count} applications, baseline`;
		return {
			label: stage.label,
			count: entry.count,
			fill: stage.fill,
			conversionCopy,
			prevLabel,
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
				<Tooltip cursor={false} content={<FunnelTooltip />} />
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
