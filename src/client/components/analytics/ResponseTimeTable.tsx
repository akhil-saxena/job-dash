import type { ResponseTimesData } from "@/client/hooks/useAnalytics";
import {
	getResponseTimeZone,
	type ResponseTimeThreshold,
} from "@/client/lib/responseTimeColor";
import type { AnalyticsThresholds } from "@/shared/validators/analytics";

// UI-SPEC Copywriting Contract exact labels.
const ROWS: Array<{
	key: keyof ResponseTimesData;
	label: string;
	thresholdKey: keyof AnalyticsThresholds;
}> = [
	{
		key: "applied_screening",
		label: "Applied → Screening",
		thresholdKey: "appliedScreening",
	},
	{
		key: "screening_interviewing",
		label: "Screening → Interviewing",
		thresholdKey: "screeningInterviewing",
	},
	{
		key: "interviewing_offer",
		label: "Interviewing → Offer",
		thresholdKey: "interviewingOffer",
	},
];

// Zone → Tailwind class mapping. Uses arbitrary-value color utilities so the
// rgba() from UI-SPEC lands exactly; text colours use the named Tailwind
// scales that match UI-SPEC §Color §Response-time cell colors.
const ZONE_CLASSES: Record<string, string> = {
	green:
		"bg-[rgba(34,197,94,0.12)] text-green-800 dark:bg-[rgba(34,197,94,0.10)] dark:text-green-300",
	amber:
		"bg-[rgba(245,158,11,0.12)] text-amber-800 dark:bg-[rgba(245,158,11,0.10)] dark:text-amber-300",
	red:
		"bg-[rgba(239,68,68,0.12)] text-red-800 dark:bg-[rgba(239,68,68,0.10)] dark:text-red-300",
	none: "bg-black/[0.04] text-text-muted dark:bg-white/[0.04] dark:text-dark-accent/40",
};

interface ResponseTimeTableProps {
	data: ResponseTimesData;
	thresholds: AnalyticsThresholds;
}

export function ResponseTimeTable({
	data,
	thresholds,
}: ResponseTimeTableProps) {
	return (
		<table className="w-full border-collapse tabular-nums">
			<tbody>
				{ROWS.map(({ key, label, thresholdKey }) => {
					const entry = data[key];
					const threshold = thresholds[thresholdKey] as ResponseTimeThreshold;
					const avgDays = entry ? entry.avgDays : null;
					const zone = getResponseTimeZone(avgDays, threshold);
					const zoneClass = ZONE_CLASSES[zone];
					const cellCopy =
						avgDays === null ? "—" : `${avgDays.toFixed(1)}d avg`;
					const cellTitle =
						avgDays === null
							? "No applications have moved through this transition yet."
							: `Based on ${entry!.sampleCount} applications`;
					const ariaLabel = `${label}: ${
						avgDays === null ? "no data" : `${avgDays} days average`
					}, ${zone} zone`;

					return (
						<tr
							key={key}
							className="border-b border-black/[0.04] last:border-b-0 dark:border-white/[0.06]"
						>
							<td className="px-4 py-3 text-sm text-text-secondary dark:text-dark-accent/70">
								{label}
							</td>
							<td
								className="py-3 pl-3 text-right"
								aria-label={ariaLabel}
								title={cellTitle}
							>
								<span
									className={`inline-flex items-center justify-end rounded-[var(--radius-pill)] px-3 py-1 text-sm font-semibold tabular-nums ${zoneClass}`}
								>
									{cellCopy}
								</span>
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}
