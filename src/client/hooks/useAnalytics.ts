import { useQueries } from "@tanstack/react-query";
import { format } from "date-fns";
import type { DateRange } from "@/client/lib/dateRange";

export interface FunnelData {
	applied: { count: number; conversionPct: number };
	screening: { count: number; conversionPct: number };
	interviewing: { count: number; conversionPct: number };
	offer: { count: number; conversionPct: number };
}

export interface SourceRow {
	source: string;
	offer: number;
	interviewing: number;
	rejected: number;
	ghosted: number;
	withdrawn: number;
	total: number;
}

export interface ResponseTimeEntry {
	avgDays: number;
	sampleCount: number;
}

export interface ResponseTimesData {
	applied_screening: ResponseTimeEntry | null;
	screening_interviewing: ResponseTimeEntry | null;
	interviewing_offer: ResponseTimeEntry | null;
}

export interface StatsData {
	totalApps: number;
	active: number;
	offers: number;
	rejectionRate: number | null;
	rejectionRateNumerator: number;
	rejectionRateDenominator: number;
}

function qs(range: DateRange): string {
	return new URLSearchParams({
		from: format(range.from, "yyyy-MM-dd"),
		to: format(range.to, "yyyy-MM-dd"),
	}).toString();
}

async function fetchJson<T>(url: string): Promise<T> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed ${url} (${res.status})`);
	const json = (await res.json()) as { data: T };
	return json.data;
}

/**
 * Runs the 4 analytics queries in parallel so the page tracks per-panel
 * loading/error state independently. Query keys embed the range so
 * invalidation on any analytics-touching mutation triggers refetches for
 * all in-flight ranges.
 */
export function useAnalytics(range: DateRange) {
	const fromKey = range.from.toISOString();
	const toKey = range.to.toISOString();

	return useQueries({
		queries: [
			{
				queryKey: ["analytics", "funnel", fromKey, toKey],
				queryFn: () =>
					fetchJson<FunnelData>(`/api/analytics/funnel?${qs(range)}`),
			},
			{
				queryKey: ["analytics", "sources", fromKey, toKey],
				queryFn: () =>
					fetchJson<SourceRow[]>(`/api/analytics/sources?${qs(range)}`),
			},
			{
				queryKey: ["analytics", "response-times", fromKey, toKey],
				queryFn: () =>
					fetchJson<ResponseTimesData>(
						`/api/analytics/response-times?${qs(range)}`,
					),
			},
			{
				queryKey: ["analytics", "stats", fromKey, toKey],
				queryFn: () =>
					fetchJson<StatsData>(`/api/analytics/stats?${qs(range)}`),
			},
		],
	});
}
