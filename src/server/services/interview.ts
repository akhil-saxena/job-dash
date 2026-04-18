import { eq, and, isNull, asc, count, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { interviewRound, interviewQa, application } from "@/db/schema";
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

/** Verify that the round exists and belongs to the user */
async function verifyRoundOwnership(
	db: Database,
	userId: string,
	roundId: string,
) {
	const round = await db
		.select({ id: interviewRound.id })
		.from(interviewRound)
		.where(
			and(
				eq(interviewRound.id, roundId),
				eq(interviewRound.userId, userId),
			),
		)
		.get();

	if (!round) throw new NotFoundError("Interview round not found");
	return round;
}

/** Verify that the QA pair exists and belongs to the user */
async function verifyQAOwnership(
	db: Database,
	userId: string,
	qaId: string,
) {
	const qa = await db
		.select({ id: interviewQa.id })
		.from(interviewQa)
		.where(
			and(
				eq(interviewQa.id, qaId),
				eq(interviewQa.userId, userId),
			),
		)
		.get();

	if (!qa) throw new NotFoundError("QA pair not found");
	return qa;
}

// ---------------------------------------------------------------------------
// Round CRUD
// ---------------------------------------------------------------------------

/** Create a new interview round for an application */
export async function createRound(
	db: Database,
	userId: string,
	applicationId: string,
	input: {
		roundType: string;
		customTypeName?: string;
		scheduledAt?: string;
		durationMinutes?: number;
		interviewerName?: string;
		interviewerRole?: string;
		meetingLink?: string;
		status?: string;
		rating?: number;
		experienceNotes?: string;
		feedback?: string;
	},
) {
	await verifyApplicationOwnership(db, userId, applicationId);

	// Compute sortOrder from count of existing rounds
	const countResult = await db
		.select({ value: count() })
		.from(interviewRound)
		.where(
			and(
				eq(interviewRound.applicationId, applicationId),
				eq(interviewRound.userId, userId),
			),
		)
		.get();
	const sortOrder = countResult?.value ?? 0;

	const now = new Date();
	const id = nanoid();

	const result = await db
		.insert(interviewRound)
		.values({
			id,
			applicationId,
			userId,
			roundType: input.roundType,
			customTypeName: input.customTypeName || null,
			scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
			durationMinutes: input.durationMinutes ?? 60,
			interviewerName: input.interviewerName || null,
			interviewerRole: input.interviewerRole || null,
			meetingLink: input.meetingLink || null,
			status: input.status || "scheduled",
			rating: input.rating ?? null,
			experienceNotes: input.experienceNotes || null,
			feedback: input.feedback || null,
			sortOrder,
			createdAt: now,
			updatedAt: now,
		})
		.returning();

	return result[0];
}

/** List all interview rounds for an application with nested QA pairs */
export async function listRounds(
	db: Database,
	userId: string,
	applicationId: string,
) {
	await verifyApplicationOwnership(db, userId, applicationId);

	const rounds = await db
		.select()
		.from(interviewRound)
		.where(
			and(
				eq(interviewRound.applicationId, applicationId),
				eq(interviewRound.userId, userId),
			),
		)
		.orderBy(asc(interviewRound.sortOrder), asc(interviewRound.createdAt))
		.all();

	if (rounds.length === 0) return [];

	// Fetch all QA pairs for all rounds in one query (avoid N+1)
	const roundIds = rounds.map((r) => r.id);
	const allQaPairs = await db
		.select()
		.from(interviewQa)
		.where(
			and(
				inArray(interviewQa.roundId, roundIds),
				eq(interviewQa.userId, userId),
			),
		)
		.orderBy(asc(interviewQa.sortOrder))
		.all();

	// Group QA pairs by roundId
	const qaByRound = new Map<string, typeof allQaPairs>();
	for (const qa of allQaPairs) {
		const existing = qaByRound.get(qa.roundId) || [];
		existing.push(qa);
		qaByRound.set(qa.roundId, existing);
	}

	return rounds.map((r) => ({
		...r,
		qaPairs: qaByRound.get(r.id) || [],
	}));
}

/** Update an interview round (partial update) */
export async function updateRound(
	db: Database,
	userId: string,
	roundId: string,
	input: {
		roundType?: string;
		customTypeName?: string;
		scheduledAt?: string;
		durationMinutes?: number;
		interviewerName?: string;
		interviewerRole?: string;
		meetingLink?: string;
		status?: string;
		rating?: number;
		experienceNotes?: string;
		feedback?: string;
	},
) {
	await verifyRoundOwnership(db, userId, roundId);

	// Build partial update values
	const setValues: Record<string, unknown> = { updatedAt: new Date() };

	if (input.roundType !== undefined) setValues.roundType = input.roundType;
	if (input.customTypeName !== undefined) setValues.customTypeName = input.customTypeName;
	if (input.scheduledAt !== undefined) setValues.scheduledAt = new Date(input.scheduledAt);
	if (input.durationMinutes !== undefined) setValues.durationMinutes = input.durationMinutes;
	if (input.interviewerName !== undefined) setValues.interviewerName = input.interviewerName;
	if (input.interviewerRole !== undefined) setValues.interviewerRole = input.interviewerRole;
	if (input.meetingLink !== undefined) setValues.meetingLink = input.meetingLink;
	if (input.status !== undefined) setValues.status = input.status;
	if (input.rating !== undefined) setValues.rating = input.rating;
	if (input.experienceNotes !== undefined) setValues.experienceNotes = input.experienceNotes;
	if (input.feedback !== undefined) setValues.feedback = input.feedback;

	const result = await db
		.update(interviewRound)
		.set(setValues)
		.where(eq(interviewRound.id, roundId))
		.returning();

	return result[0];
}

/** Delete an interview round (cascade-deletes QA pairs via FK) */
export async function deleteRound(
	db: Database,
	userId: string,
	roundId: string,
) {
	await verifyRoundOwnership(db, userId, roundId);

	await db
		.delete(interviewRound)
		.where(eq(interviewRound.id, roundId));

	return { deleted: true };
}

// ---------------------------------------------------------------------------
// QA CRUD
// ---------------------------------------------------------------------------

/** Create a QA pair for an interview round */
export async function createQA(
	db: Database,
	userId: string,
	roundId: string,
	input: {
		question: string;
		answer?: string;
	},
) {
	await verifyRoundOwnership(db, userId, roundId);

	// Compute sortOrder from count of existing QA pairs for this round
	const countResult = await db
		.select({ value: count() })
		.from(interviewQa)
		.where(
			and(
				eq(interviewQa.roundId, roundId),
				eq(interviewQa.userId, userId),
			),
		)
		.get();
	const sortOrder = countResult?.value ?? 0;

	const now = new Date();
	const id = nanoid();

	const result = await db
		.insert(interviewQa)
		.values({
			id,
			roundId,
			userId,
			question: input.question,
			answer: input.answer || null,
			sortOrder,
			createdAt: now,
			updatedAt: now,
		})
		.returning();

	return result[0];
}

/** Update a QA pair (partial update) */
export async function updateQA(
	db: Database,
	userId: string,
	qaId: string,
	input: {
		question?: string;
		answer?: string;
	},
) {
	await verifyQAOwnership(db, userId, qaId);

	const setValues: Record<string, unknown> = { updatedAt: new Date() };

	if (input.question !== undefined) setValues.question = input.question;
	if (input.answer !== undefined) setValues.answer = input.answer;

	const result = await db
		.update(interviewQa)
		.set(setValues)
		.where(eq(interviewQa.id, qaId))
		.returning();

	return result[0];
}

/** Delete a QA pair */
export async function deleteQA(
	db: Database,
	userId: string,
	qaId: string,
) {
	await verifyQAOwnership(db, userId, qaId);

	await db
		.delete(interviewQa)
		.where(eq(interviewQa.id, qaId));

	return { deleted: true };
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/** Count interview rounds for an application (lightweight for tab badge) */
export async function countRounds(
	db: Database,
	userId: string,
	applicationId: string,
) {
	const result = await db
		.select({ value: count() })
		.from(interviewRound)
		.where(
			and(
				eq(interviewRound.applicationId, applicationId),
				eq(interviewRound.userId, userId),
			),
		)
		.get();

	return { count: result?.value ?? 0 };
}
