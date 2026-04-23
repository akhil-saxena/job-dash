import { useCallback, useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, BarChart3 } from "lucide-react";
import { z } from "zod";
import { Card } from "@/client/components/design-system/Card";
import { Button } from "@/client/components/design-system/Button";
import {
	AnalyticsDateRangeBar,
	PipelineFunnelChart,
	ResponseTimeTable,
	SourceEffectivenessChart,
	StatCard,
} from "@/client/components/analytics";
import { useAnalytics } from "@/client/hooks/useAnalytics";
import { useAnalyticsThresholds } from "@/client/hooks/useAnalyticsThresholds";
import { useQuickAdd } from "@/client/hooks/useQuickAdd";
import {
	presetToRange,
	type DateRange,
	type DateRangePreset,
} from "@/client/lib/dateRange";

const LOCAL_KEY = "jobdash:analytics:dateRange";

const analyticsSearchSchema = z.object({
	preset: z
		.enum(["30d", "90d", "ytd", "all", "custom"])
		.optional(),
	from: z.string().optional(),
	to: z.string().optional(),
});

type AnalyticsSearch = z.infer<typeof analyticsSearchSchema>;

export const Route = createFileRoute("/_authenticated/analytics")({
	validateSearch: (search: Record<string, unknown>) =>
		analyticsSearchSchema.parse(search),
	component: AnalyticsPage,
});

interface StoredPreset {
	preset: DateRangePreset;
	from?: string;
	to?: string;
}

function readStoredPreset(): StoredPreset | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(LOCAL_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as StoredPreset;
		if (!parsed.preset) return null;
		return parsed;
	} catch {
		return null;
	}
}

function writeStoredPreset(s: StoredPreset) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
	} catch {
		// ignore quota / private-mode errors
	}
}

function AnalyticsPage() {
	const search = Route.useSearch() as AnalyticsSearch;
	const navigate = useNavigate();
	const { setOpen: setQuickAddOpen } = useQuickAdd();

	// Resolve preset: URL → localStorage → default "all".
	const effective: StoredPreset = useMemo(() => {
		if (search.preset)
			return {
				preset: search.preset,
				from: search.from,
				to: search.to,
			};
		const stored = readStoredPreset();
		if (stored) return stored;
		return { preset: "all" };
	}, [search.preset, search.from, search.to]);

	// If URL was empty but localStorage had a value, sync URL once on mount.
	useEffect(() => {
		if (!search.preset && effective.preset !== "all") {
			navigate({
				to: "/analytics",
				search: {
					preset: effective.preset,
					from: effective.from,
					to: effective.to,
				} as AnalyticsSearch,
				replace: true,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Compute the concrete Date window the analytics queries use.
	const now = useMemo(() => new Date(), []);
	const range: DateRange = useMemo(() => {
		if (effective.preset === "custom" && effective.from && effective.to) {
			return presetToRange("custom", now, {
				from: effective.from,
				to: effective.to,
			});
		}
		return presetToRange(effective.preset, now);
	}, [effective.preset, effective.from, effective.to, now]);

	const [funnelQ, sourcesQ, responseQ, statsQ] = useAnalytics(range);
	const { data: thresholds } = useAnalyticsThresholds();

	const handleChange = useCallback(
		(preset: DateRangePreset, custom?: { from: string; to: string }) => {
			const next: StoredPreset = {
				preset,
				from: custom?.from,
				to: custom?.to,
			};
			writeStoredPreset(next);
			navigate({
				to: "/analytics",
				search: {
					preset,
					from: custom?.from,
					to: custom?.to,
				} as AnalyticsSearch,
			});
		},
		[navigate],
	);

	// Whole-page empty state: no apps anywhere AND all 4 queries resolved.
	const allResolved =
		!funnelQ.isLoading &&
		!sourcesQ.isLoading &&
		!responseQ.isLoading &&
		!statsQ.isLoading;
	const showEmptyState =
		allResolved &&
		!statsQ.isError &&
		statsQ.data?.totalApps === 0;

	return (
		<div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 pb-16 lg:p-6">
			<AnalyticsDateRangeBar
				preset={effective.preset}
				customFrom={effective.from}
				customTo={effective.to}
				appliedFrom={range.from}
				appliedTo={range.to}
				onChange={handleChange}
			/>

			{showEmptyState ? (
				<Card padding="p-12">
					<div className="flex flex-col items-center justify-center gap-3 text-center">
						<BarChart3 size={32} className="text-text-muted" />
						<div className="text-xl font-semibold text-text-primary dark:text-dark-accent">
							Not enough data yet
						</div>
						<div className="max-w-md text-sm text-text-secondary dark:text-dark-accent/60">
							Start tracking applications to see your pipeline
							funnel, source breakdown, and response times.
						</div>
						<Button
							variant="filled"
							size="sm"
							onClick={() => setQuickAddOpen(true)}
						>
							Add an application
						</Button>
					</div>
				</Card>
			) : (
				<>
					{/* Stat card strip */}
					<StatStrip
						isLoading={statsQ.isLoading}
						isError={statsQ.isError}
						data={statsQ.data}
						onRetry={() => statsQ.refetch()}
					/>

					{/* Pipeline Funnel panel */}
					<Card padding="p-6">
						<PanelHeader
							title="Pipeline"
							caption="4 stages · flow from timeline events"
						/>
						{funnelQ.isLoading ? (
							<FunnelSkeleton />
						) : funnelQ.isError ? (
							<PanelError
								name="Pipeline"
								onRetry={() => funnelQ.refetch()}
							/>
						) : funnelQ.data ? (
							<PipelineFunnelChart data={funnelQ.data} />
						) : null}
					</Card>

					{/* Source Effectiveness panel */}
					<Card padding="p-6">
						<PanelHeader
							title="Sources"
							caption="Top 8 by volume, stacked by outcome"
						/>
						{sourcesQ.isLoading ? (
							<SourcesSkeleton />
						) : sourcesQ.isError ? (
							<PanelError
								name="Sources"
								onRetry={() => sourcesQ.refetch()}
							/>
						) : sourcesQ.data ? (
							<SourceEffectivenessChart data={sourcesQ.data} />
						) : null}
					</Card>

					{/* Response Time panel */}
					<Card padding="p-6">
						<PanelHeader
							title="Response Time"
							caption="Avg days between stage transitions"
						/>
						{responseQ.isLoading ? (
							<ResponseSkeleton />
						) : responseQ.isError ? (
							<PanelError
								name="Response Time"
								onRetry={() => responseQ.refetch()}
							/>
						) : responseQ.data ? (
							<ResponseTimeTable
								data={responseQ.data}
								thresholds={thresholds}
							/>
						) : null}
					</Card>
				</>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function PanelHeader({
	title,
	caption,
}: { title: string; caption: string }) {
	return (
		<div className="mb-4 flex flex-wrap items-end justify-between gap-2">
			<h2 className="text-xl font-semibold text-text-primary dark:text-dark-accent">
				{title}
			</h2>
			<span className="text-xs text-text-muted dark:text-dark-accent/40">
				{caption}
			</span>
		</div>
	);
}

function PanelError({
	name,
	onRetry,
}: {
	name: string;
	onRetry: () => void;
}) {
	return (
		<div className="flex items-center gap-3 py-4">
			<AlertCircle
				size={20}
				className="text-status-rejected"
				aria-hidden="true"
			/>
			<div className="flex-1">
				<div className="text-sm text-text-primary dark:text-dark-accent">
					Couldn't load {name}.
				</div>
				<div className="text-xs text-text-muted dark:text-dark-accent/40">
					Check connection and retry.
				</div>
			</div>
			<Button variant="ghost" size="sm" onClick={onRetry}>
				Retry
			</Button>
		</div>
	);
}

interface StatStripProps {
	isLoading: boolean;
	isError: boolean;
	data?: {
		totalApps: number;
		active: number;
		offers: number;
		rejectionRate: number | null;
		rejectionRateNumerator: number;
		rejectionRateDenominator: number;
	};
	onRetry: () => void;
}

function StatStrip({ isLoading, isError, data, onRetry }: StatStripProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i} padding="p-4">
						<div className="flex flex-col gap-2">
							<div className="h-3 w-16 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.06]" />
							<div className="h-7 w-20 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.06]" />
						</div>
					</Card>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<Card padding="p-4">
				<PanelError name="stats" onRetry={onRetry} />
			</Card>
		);
	}

	if (!data) return null;

	const rejectionCaption =
		data.rejectionRateDenominator > 0
			? `${data.rejectionRateNumerator} of ${data.rejectionRateDenominator} terminal`
			: "No outcomes yet";
	const rejectionValue =
		data.rejectionRate === null ? "—" : `${data.rejectionRate}%`;

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
			<StatCard label="TOTAL APPS" value={data.totalApps} />
			<StatCard label="CURRENTLY ACTIVE" value={data.active} />
			<StatCard label="OFFERS RECEIVED" value={data.offers} />
			<StatCard
				label="REJECTION RATE"
				value={rejectionValue}
				caption={rejectionCaption}
			/>
		</div>
	);
}

function FunnelSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<div
					key={i}
					className="h-9 w-full animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.06]"
				/>
			))}
		</div>
	);
}

function SourcesSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			{Array.from({ length: 8 }).map((_, i) => (
				<div
					key={i}
					className="h-8 w-full animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.06]"
				/>
			))}
		</div>
	);
}

function ResponseSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="flex items-center gap-4">
					<div className="h-4 w-40 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.06]" />
					<div className="h-7 w-24 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.06]" />
				</div>
			))}
		</div>
	);
}
