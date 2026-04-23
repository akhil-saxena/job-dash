import { and, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { application, timelineEvent } from "@/db/schema";
import type { Database } from "@/server/lib/db";

/**
 * ANLY-01 / D-01..D-04 — Pipeline funnel driven by timeline events.
 *
 * Counts DISTINCT applications that reached each of the four funnel stages
 * (applied → screening → interviewing → offer) within the date range, based
 * on status_change events. Soft-deleted applications are excluded via inner
 * join (Pitfall 1). Stage whitelist guards against json_extract returning
 * unexpected keys (Pitfall 7).
 *
 * Conversion is computed in TS post-query to avoid SQL div-by-zero noise.
 */
export async function getFunnelCounts(
	db: Database,
	userId: string,
	range: { from: Date; to: Date },
): Promise<{
	applied: { count: number; conversionPct: number };
	screening: { count: number; conversionPct: number };
	interviewing: { count: number; conversionPct: number };
	offer: { count: number; conversionPct: number };
}> {
	const rows = await db
		.select({
			stage: sql<string>`json_extract(${timelineEvent.metadata}, '$.to')`.as(
				"stage",
			),
			count: sql<number>`count(distinct ${timelineEvent.applicationId})`.as(
				"count",
			),
		})
		.from(timelineEvent)
		.innerJoin(application, eq(application.id, timelineEvent.applicationId))
		.where(
			and(
				eq(timelineEvent.userId, userId),
				eq(timelineEvent.eventType, "status_change"),
				isNull(application.deletedAt),
				gte(timelineEvent.occurredAt, range.from),
				lte(timelineEvent.occurredAt, range.to),
				sql`json_extract(${timelineEvent.metadata}, '$.to') IS NOT NULL`,
				sql`json_extract(${timelineEvent.metadata}, '$.to') IN ('applied','screening','interviewing','offer')`,
			),
		)
		.groupBy(sql`json_extract(${timelineEvent.metadata}, '$.to')`)
		.all();

	const byStage: Record<string, number> = {
		applied: 0,
		screening: 0,
		interviewing: 0,
		offer: 0,
	};
	for (const row of rows) {
		if (row.stage && row.stage in byStage) {
			byStage[row.stage] = Number(row.count) || 0;
		}
	}

	const applied = byStage.applied;
	const screening = byStage.screening;
	const interviewing = byStage.interviewing;
	const offer = byStage.offer;

	const pct = (numer: number, denom: number) =>
		denom > 0 ? Math.round((numer / denom) * 100) : 0;

	return {
		applied: { count: applied, conversionPct: 100 },
		screening: { count: screening, conversionPct: pct(screening, applied) },
		interviewing: {
			count: interviewing,
			conversionPct: pct(interviewing, screening),
		},
		offer: { count: offer, conversionPct: pct(offer, interviewing) },
	};
}

/**
 * ANLY-03 / D-12/D-13 — Avg days between adjacent stage transitions via LAG().
 *
 * LAG() window function walks status_change events per application in
 * chronological order, yielding (from_stage, to_stage, to_at, from_at) for
 * each transition. We filter to the 3 canonical adjacent transitions and
 * aggregate AVG((to_at - from_at) / 86400.0).
 *
 * Skipped stages (e.g. applied → interviewing directly) correctly contribute
 * 0 samples to applied→screening and screening→interviewing averages (per
 * Research "Edge case — status skips" / D-12).
 */
export async function getResponseTimeAverages(
	db: Database,
	userId: string,
	range: { from: Date; to: Date },
): Promise<{
	applied_screening: { avgDays: number; sampleCount: number } | null;
	screening_interviewing: { avgDays: number; sampleCount: number } | null;
	interviewing_offer: { avgDays: number; sampleCount: number } | null;
}> {
	const fromSec = Math.floor(range.from.getTime() / 1000);
	const toSec = Math.floor(range.to.getTime() / 1000);

	const query = sql`
		WITH transitions AS (
			SELECT
				te.application_id,
				json_extract(te.metadata, '$.to') AS to_stage,
				LAG(json_extract(te.metadata, '$.to')) OVER (
					PARTITION BY te.application_id
					ORDER BY te.occurred_at
				) AS from_stage,
				te.occurred_at AS to_at,
				LAG(te.occurred_at) OVER (
					PARTITION BY te.application_id
					ORDER BY te.occurred_at
				) AS from_at
			FROM timeline_event te
			INNER JOIN application a ON a.id = te.application_id
			WHERE te.user_id = ${userId}
			  AND te.event_type = 'status_change'
			  AND a.deleted_at IS NULL
		)
		SELECT
			from_stage AS from_stage,
			to_stage AS to_stage,
			AVG((to_at - from_at) / 86400.0) AS avg_days,
			COUNT(*) AS sample_count
		FROM transitions
		WHERE from_stage IS NOT NULL
		  AND to_at >= ${fromSec}
		  AND to_at <= ${toSec}
		  AND (
			(from_stage = 'applied'      AND to_stage = 'screening') OR
			(from_stage = 'screening'    AND to_stage = 'interviewing') OR
			(from_stage = 'interviewing' AND to_stage = 'offer')
		  )
		GROUP BY from_stage, to_stage
	`;

	const result = (await db.all(query)) as Array<{
		from_stage: string;
		to_stage: string;
		avg_days: number;
		sample_count: number;
	}>;

	const out: {
		applied_screening: { avgDays: number; sampleCount: number } | null;
		screening_interviewing: { avgDays: number; sampleCount: number } | null;
		interviewing_offer: { avgDays: number; sampleCount: number } | null;
	} = {
		applied_screening: null,
		screening_interviewing: null,
		interviewing_offer: null,
	};

	for (const row of result) {
		const key = `${row.from_stage}_${row.to_stage}` as
			| "applied_screening"
			| "screening_interviewing"
			| "interviewing_offer";
		if (key in out) {
			out[key] = {
				avgDays: Math.round(Number(row.avg_days) * 10) / 10,
				sampleCount: Number(row.sample_count),
			};
		}
	}

	return out;
}

/**
 * ANLY-02 / D-10/D-11 — Top-8 sources stacked by final outcome.
 *
 * GROUP BY LOWER(COALESCE(source,'(none)')) (case-insensitive per D-11);
 * display name via MAX(source) (first-seen-alphabetically). Outcome columns
 * via SUM(CASE ...). Ghosted derivation uses two NOT EXISTS subqueries
 * (Research § 7 verbatim) — app is 'applied', updated_at > 30d ago, no
 * outgoing status_change, no interview_round.
 */
export async function getSourceBreakdown(
	db: Database,
	userId: string,
	range: { from: Date; to: Date },
): Promise<
	Array<{
		source: string;
		offer: number;
		interviewing: number;
		rejected: number;
		ghosted: number;
		withdrawn: number;
		total: number;
	}>
> {
	const fromSec = Math.floor(range.from.getTime() / 1000);
	const toSec = Math.floor(range.to.getTime() / 1000);
	const thirtyDaysAgoSec = Math.floor(Date.now() / 1000) - 30 * 86400;

	const query = sql`
		SELECT
			LOWER(COALESCE(source, '(none)')) AS source_key,
			MAX(COALESCE(source, '(none)')) AS source_display,
			COUNT(*) AS total,
			SUM(CASE WHEN status IN ('offer', 'accepted') THEN 1 ELSE 0 END) AS offer,
			SUM(CASE WHEN status IN ('screening', 'interviewing') THEN 1 ELSE 0 END) AS interviewing,
			SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
			SUM(CASE WHEN status = 'withdrawn' THEN 1 ELSE 0 END) AS withdrawn,
			SUM(CASE
				WHEN status = 'applied'
				  AND updated_at < ${thirtyDaysAgoSec}
				  AND NOT EXISTS (
					SELECT 1 FROM timeline_event te
					WHERE te.application_id = application.id
					  AND te.event_type = 'status_change'
					  AND json_extract(te.metadata, '$.from') = 'applied'
				  )
				  AND NOT EXISTS (
					SELECT 1 FROM interview_round ir
					WHERE ir.application_id = application.id
				  )
				THEN 1 ELSE 0
			END) AS ghosted
		FROM application
		WHERE user_id = ${userId}
		  AND deleted_at IS NULL
		  AND created_at >= ${fromSec}
		  AND created_at <= ${toSec}
		GROUP BY source_key
		ORDER BY total DESC
		LIMIT 8
	`;

	const rows = (await db.all(query)) as Array<{
		source_key: string;
		source_display: string;
		total: number;
		offer: number;
		interviewing: number;
		rejected: number;
		withdrawn: number;
		ghosted: number;
	}>;

	return rows.map((r) => ({
		source: r.source_display,
		offer: Number(r.offer) || 0,
		interviewing: Number(r.interviewing) || 0,
		rejected: Number(r.rejected) || 0,
		ghosted: Number(r.ghosted) || 0,
		withdrawn: Number(r.withdrawn) || 0,
		total: Number(r.total) || 0,
	}));
}

/**
 * ANLY-04 / D-14 — 4 summary stat cards. Single aggregate query with SUM(CASE).
 *
 * Semantics: "of applications created in this range, how many are currently
 * in an {active, offers, terminal} state?" (see Research § 6).
 *
 * rejectionRate = rejected / (accepted + rejected + withdrawn); null when the
 * denominator is 0 (UI renders em-dash + "No outcomes yet").
 */
export async function getStatCards(
	db: Database,
	userId: string,
	range: { from: Date; to: Date },
): Promise<{
	totalApps: number;
	active: number;
	offers: number;
	rejectionRate: number | null;
	rejectionRateNumerator: number;
	rejectionRateDenominator: number;
}> {
	const row = await db
		.select({
			totalApps: sql<number>`count(*)`.as("totalApps"),
			active: sql<number>`sum(case when status in ('applied','screening','interviewing','offer') then 1 else 0 end)`.as(
				"active",
			),
			offers: sql<number>`sum(case when status in ('offer','accepted') then 1 else 0 end)`.as(
				"offers",
			),
			rejected: sql<number>`sum(case when status = 'rejected' then 1 else 0 end)`.as(
				"rejected",
			),
			accepted: sql<number>`sum(case when status = 'accepted' then 1 else 0 end)`.as(
				"accepted",
			),
			withdrawn: sql<number>`sum(case when status = 'withdrawn' then 1 else 0 end)`.as(
				"withdrawn",
			),
		})
		.from(application)
		.where(
			and(
				eq(application.userId, userId),
				isNull(application.deletedAt),
				gte(application.createdAt, range.from),
				lte(application.createdAt, range.to),
			),
		)
		.get();

	const totalApps = Number(row?.totalApps) || 0;
	const active = Number(row?.active) || 0;
	const offers = Number(row?.offers) || 0;
	const rejected = Number(row?.rejected) || 0;
	const accepted = Number(row?.accepted) || 0;
	const withdrawn = Number(row?.withdrawn) || 0;
	const terminal = rejected + accepted + withdrawn;
	const rejectionRate =
		terminal > 0 ? Math.round((rejected / terminal) * 100) : null;

	return {
		totalApps,
		active,
		offers,
		rejectionRate,
		rejectionRateNumerator: rejected,
		rejectionRateDenominator: terminal,
	};
}
