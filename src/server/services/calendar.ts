import { and, eq, gte, isNull, lt } from "drizzle-orm";
import { addDays, startOfMonth, startOfWeek } from "date-fns";
import { application, deadline, interviewRound } from "@/db/schema";
import type { Database } from "@/server/lib/db";

/**
 * Load interviews + deadlines whose scheduled/due date falls inside the 42-cell
 * month grid window that `anchor` belongs to.
 *
 * Window = [startOfWeek(startOfMonth(anchor), Sunday), +42 days). Joins the
 * application table inner so soft-deleted apps never leak into the response,
 * and returns company/role/slug inline so the client needs only a single
 * round-trip to render the month view.
 */
export async function getMonthEvents(
	db: Database,
	userId: string,
	anchor: Date,
) {
	const gridStart = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 });
	const gridEnd = addDays(gridStart, 42);

	const interviews = await db
		.select({
			id: interviewRound.id,
			applicationId: interviewRound.applicationId,
			applicationSlug: application.slug,
			companyName: application.companyName,
			roleTitle: application.roleTitle,
			roundType: interviewRound.roundType,
			scheduledAt: interviewRound.scheduledAt,
			status: interviewRound.status,
		})
		.from(interviewRound)
		.innerJoin(
			application,
			eq(application.id, interviewRound.applicationId),
		)
		.where(
			and(
				eq(interviewRound.userId, userId),
				isNull(application.deletedAt),
				gte(interviewRound.scheduledAt, gridStart),
				lt(interviewRound.scheduledAt, gridEnd),
			),
		)
		.all();

	const deadlines = await db
		.select({
			id: deadline.id,
			applicationId: deadline.applicationId,
			applicationSlug: application.slug,
			companyName: application.companyName,
			roleTitle: application.roleTitle,
			deadlineType: deadline.deadlineType,
			label: deadline.label,
			dueDate: deadline.dueDate,
			isCompleted: deadline.isCompleted,
		})
		.from(deadline)
		.innerJoin(application, eq(application.id, deadline.applicationId))
		.where(
			and(
				eq(deadline.userId, userId),
				isNull(application.deletedAt),
				gte(deadline.dueDate, gridStart),
				lt(deadline.dueDate, gridEnd),
			),
		)
		.all();

	return { interviews, deadlines };
}
