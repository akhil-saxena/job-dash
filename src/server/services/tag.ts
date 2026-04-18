import { eq, and, isNull, asc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { tag, applicationTag, application } from "@/db/schema";
import { NotFoundError, ConflictError } from "@/server/lib/errors";
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

/** Verify that the tag exists and belongs to the user */
async function verifyTagOwnership(
	db: Database,
	userId: string,
	tagId: string,
) {
	const t = await db
		.select({ id: tag.id })
		.from(tag)
		.where(and(eq(tag.id, tagId), eq(tag.userId, userId)))
		.get();

	if (!t) throw new NotFoundError("Tag not found");
	return t;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/** Create a new tag for the user. Throws ConflictError if name already exists. */
export async function create(
	db: Database,
	userId: string,
	input: { name: string; color?: string },
) {
	// Check uniqueness (tag name per user)
	const existing = await db
		.select({ id: tag.id })
		.from(tag)
		.where(and(eq(tag.userId, userId), eq(tag.name, input.name)))
		.get();

	if (existing) throw new ConflictError("Tag name already exists");

	const now = new Date();
	const id = nanoid();

	const result = await db
		.insert(tag)
		.values({
			id,
			userId,
			name: input.name,
			color: input.color || "blue",
			createdAt: now,
			updatedAt: now,
		})
		.returning();

	return result[0];
}

/** List all tags for a user, ordered by name ASC */
export async function list(db: Database, userId: string) {
	return db
		.select()
		.from(tag)
		.where(eq(tag.userId, userId))
		.orderBy(asc(tag.name))
		.all();
}

/** Update a tag. Throws NotFoundError if not found or not owned by user. */
export async function update(
	db: Database,
	userId: string,
	tagId: string,
	input: { name?: string; color?: string },
) {
	await verifyTagOwnership(db, userId, tagId);

	const setValues: Record<string, unknown> = { updatedAt: new Date() };

	if (input.name !== undefined) setValues.name = input.name;
	if (input.color !== undefined) setValues.color = input.color;

	const result = await db
		.update(tag)
		.set(setValues)
		.where(eq(tag.id, tagId))
		.returning();

	return result[0];
}

/** Delete a tag. Cascade deletes application_tag rows via FK. */
export async function remove(db: Database, userId: string, tagId: string) {
	await verifyTagOwnership(db, userId, tagId);

	await db.delete(tag).where(eq(tag.id, tagId));

	return { deleted: true };
}

/** Assign a tag to an application. Silently returns if already assigned. */
export async function assignTag(
	db: Database,
	userId: string,
	applicationId: string,
	tagId: string,
) {
	await verifyApplicationOwnership(db, userId, applicationId);
	await verifyTagOwnership(db, userId, tagId);

	// Check if already assigned
	const existing = await db
		.select({ id: applicationTag.id })
		.from(applicationTag)
		.where(
			and(
				eq(applicationTag.applicationId, applicationId),
				eq(applicationTag.tagId, tagId),
			),
		)
		.get();

	if (existing) return existing;

	const now = new Date();
	const id = nanoid();

	const result = await db
		.insert(applicationTag)
		.values({
			id,
			applicationId,
			tagId,
			userId,
			createdAt: now,
		})
		.returning();

	return result[0];
}

/** Unassign a tag from an application. */
export async function unassignTag(
	db: Database,
	userId: string,
	applicationId: string,
	tagId: string,
) {
	await verifyApplicationOwnership(db, userId, applicationId);

	await db
		.delete(applicationTag)
		.where(
			and(
				eq(applicationTag.applicationId, applicationId),
				eq(applicationTag.tagId, tagId),
			),
		);

	return { deleted: true };
}

/** Get all tags assigned to an application. */
export async function getTagsForApplication(
	db: Database,
	userId: string,
	applicationId: string,
) {
	await verifyApplicationOwnership(db, userId, applicationId);

	const rows = await db
		.select({
			id: tag.id,
			userId: tag.userId,
			name: tag.name,
			color: tag.color,
			createdAt: tag.createdAt,
			updatedAt: tag.updatedAt,
		})
		.from(applicationTag)
		.innerJoin(tag, eq(applicationTag.tagId, tag.id))
		.where(eq(applicationTag.applicationId, applicationId))
		.orderBy(asc(tag.name))
		.all();

	return rows;
}

/** Get application IDs that have a given tag. Used for filtering. */
export async function getApplicationIdsByTag(
	db: Database,
	userId: string,
	tagId: string,
) {
	const rows = await db
		.select({ applicationId: applicationTag.applicationId })
		.from(applicationTag)
		.where(
			and(
				eq(applicationTag.tagId, tagId),
				eq(applicationTag.userId, userId),
			),
		)
		.all();

	return rows.map((r) => r.applicationId);
}
