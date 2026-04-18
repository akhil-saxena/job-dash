import { eq, and, isNull, asc, count, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { document, application } from "@/db/schema";
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

/** Verify that the document exists and belongs to the user */
async function verifyDocumentOwnership(
	db: Database,
	userId: string,
	docId: string,
) {
	const doc = await db
		.select({ id: document.id, r2Key: document.r2Key })
		.from(document)
		.where(
			and(
				eq(document.id, docId),
				eq(document.userId, userId),
			),
		)
		.get();

	if (!doc) throw new NotFoundError("Document not found");
	return doc;
}

// ---------------------------------------------------------------------------
// Document CRUD
// ---------------------------------------------------------------------------

/** Create a document metadata record for an application */
export async function createDocument(
	db: Database,
	userId: string,
	applicationId: string,
	input: {
		fileName: string;
		fileType: string;
		fileSize: number;
		r2Key: string;
	},
) {
	await verifyApplicationOwnership(db, userId, applicationId);

	const now = new Date();
	const id = nanoid();

	const result = await db
		.insert(document)
		.values({
			id,
			applicationId,
			userId,
			fileName: input.fileName,
			fileType: input.fileType,
			fileSize: input.fileSize,
			r2Key: input.r2Key,
			createdAt: now,
			updatedAt: now,
		})
		.returning();

	return result[0];
}

/** List all documents for an application */
export async function listDocuments(
	db: Database,
	userId: string,
	applicationId: string,
) {
	await verifyApplicationOwnership(db, userId, applicationId);

	return db
		.select()
		.from(document)
		.where(
			and(
				eq(document.applicationId, applicationId),
				eq(document.userId, userId),
			),
		)
		.orderBy(desc(document.createdAt))
		.all();
}

/** Count documents for an application (lightweight for tab badge) */
export async function countDocuments(
	db: Database,
	userId: string,
	applicationId: string,
) {
	const result = await db
		.select({ value: count() })
		.from(document)
		.where(
			and(
				eq(document.applicationId, applicationId),
				eq(document.userId, userId),
			),
		)
		.get();

	return { count: result?.value ?? 0 };
}

/** Delete a document metadata record (returns r2Key for caller to delete from R2) */
export async function deleteDocument(
	db: Database,
	userId: string,
	docId: string,
) {
	const doc = await verifyDocumentOwnership(db, userId, docId);

	await db
		.delete(document)
		.where(eq(document.id, docId));

	return { deleted: true, r2Key: doc.r2Key };
}
