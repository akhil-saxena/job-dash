import { eq, and, isNull, asc, gte } from "drizzle-orm";
import { nanoid } from "nanoid";
import { deadline, application } from "@/db/schema";
import { NotFoundError } from "@/server/lib/errors";
import type { Database } from "@/server/lib/db";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Verify that the application exists and belongs to the user */
async function verifyApplicationOwnership(
	db: Database,
	userId: string,
	applicationId: string,
) {
	const app = await db
		.select({ id: application.id })
		.from(application)
		.where(
			and(
				eq(application.id, applicationId),
				eq(application.userId, userId),
				isNull(application.deletedAt),
			),
		)
		.get();

	if (!app) throw new NotFoundError("Application not found");
	return app;
}

/** Verify that the deadline exists and belongs to the user */
async function verifyDeadlineOwnership(
	db: Database,
	userId: string,
	deadlineId: string,
) {
	const d = await db
		.select({ id: deadline.id })
		.from(deadline)
		.where(and(eq(deadline.id, deadlineId), eq(deadline.userId, userId)))
		.get();

	if (!d) throw new NotFoundError("Deadline not found");
	return d;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/** Create a new deadline for an application */
export async function create(
	db: Database,
	userId: string,
	applicationId: string,
	input: {
		deadlineType: string;
		label?: string;
		dueDate: string;
	},
) {
	await verifyApplicationOwnership(db, userId, applicationId);

	const now = new Date();
	const id = nanoid();

	const result = await db
		.insert(deadline)
		.values({
			id,
			applicationId,
			userId,
			deadlineType: input.deadlineType,
			label: input.label || null,
			dueDate: new Date(input.dueDate),
			isCompleted: false,
			createdAt: now,
			updatedAt: now,
		})
		.returning();

	return result[0];
}

/** List all deadlines for a specific application, ordered by dueDate ASC */
export async function listForApplication(
	db: Database,
	userId: string,
	applicationId: string,
) {
	await verifyApplicationOwnership(db, userId, applicationId);

	return db
		.select()
		.from(deadline)
		.where(
			and(
				eq(deadline.applicationId, applicationId),
				eq(deadline.userId, userId),
			),
		)
		.orderBy(asc(deadline.dueDate))
		.all();
}

/** List all non-completed upcoming deadlines for the user (dueDate >= now) */
export async function listUpcoming(db: Database, userId: string) {
	const now = new Date();

	return db
		.select()
		.from(deadline)
		.where(
			and(
				eq(deadline.userId, userId),
				eq(deadline.isCompleted, false),
				gte(deadline.dueDate, now),
			),
		)
		.orderBy(asc(deadline.dueDate))
		.all();
}

/** Update a deadline (partial update) */
export async function update(
	db: Database,
	userId: string,
	deadlineId: string,
	input: {
		deadlineType?: string;
		label?: string;
		dueDate?: string;
		isCompleted?: boolean;
	},
) {
	await verifyDeadlineOwnership(db, userId, deadlineId);

	const setValues: Record<string, unknown> = { updatedAt: new Date() };

	if (input.deadlineType !== undefined) setValues.deadlineType = input.deadlineType;
	if (input.label !== undefined) setValues.label = input.label || null;
	if (input.dueDate !== undefined) setValues.dueDate = new Date(input.dueDate);
	if (input.isCompleted !== undefined) setValues.isCompleted = input.isCompleted;

	const result = await db
		.update(deadline)
		.set(setValues)
		.where(eq(deadline.id, deadlineId))
		.returning();

	return result[0];
}

/** Mark a deadline as completed */
export async function complete(
	db: Database,
	userId: string,
	deadlineId: string,
) {
	await verifyDeadlineOwnership(db, userId, deadlineId);

	const result = await db
		.update(deadline)
		.set({ isCompleted: true, updatedAt: new Date() })
		.where(eq(deadline.id, deadlineId))
		.returning();

	return result[0];
}

/** Delete a deadline */
export async function remove(
	db: Database,
	userId: string,
	deadlineId: string,
) {
	await verifyDeadlineOwnership(db, userId, deadlineId);

	await db.delete(deadline).where(eq(deadline.id, deadlineId));

	return { deleted: true };
}
