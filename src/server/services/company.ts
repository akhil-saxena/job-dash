import { eq, and, asc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { company } from "@/db/schema";
import { NotFoundError } from "@/server/lib/errors";
import type { Database } from "@/server/lib/db";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Verify that the company exists and belongs to the user */
async function verifyCompanyOwnership(
	db: Database,
	userId: string,
	companyId: string,
) {
	const c = await db
		.select({ id: company.id })
		.from(company)
		.where(and(eq(company.id, companyId), eq(company.userId, userId)))
		.get();

	if (!c) throw new NotFoundError("Company not found");
	return c;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Find an existing company by domain (if provided) or create a new one.
 * Implements COMP-01 domain dedup: if the same user has a company with the same
 * domain, return it instead of creating a duplicate.
 */
export async function findOrCreate(
	db: Database,
	userId: string,
	input: {
		name: string;
		domain?: string;
		website?: string;
		notes?: string;
	},
) {
	// If domain is provided, try to find existing company with same userId + domain
	if (input.domain) {
		const existing = await db
			.select()
			.from(company)
			.where(
				and(
					eq(company.userId, userId),
					eq(company.domain, input.domain),
				),
			)
			.get();

		if (existing) return { company: existing, created: false };
	}

	const now = new Date();
	const id = nanoid();

	const result = await db
		.insert(company)
		.values({
			id,
			userId,
			name: input.name,
			domain: input.domain || null,
			website: input.website || null,
			notes: input.notes || null,
			createdAt: now,
			updatedAt: now,
		})
		.returning();

	return { company: result[0], created: true };
}

/** List all companies for a user, ordered by name ASC */
export async function list(db: Database, userId: string) {
	return db
		.select()
		.from(company)
		.where(eq(company.userId, userId))
		.orderBy(asc(company.name))
		.all();
}

/** Get a single company by ID. Throws NotFoundError if not found or not owned. */
export async function getById(
	db: Database,
	userId: string,
	companyId: string,
) {
	const c = await db
		.select()
		.from(company)
		.where(and(eq(company.id, companyId), eq(company.userId, userId)))
		.get();

	if (!c) throw new NotFoundError("Company not found");
	return c;
}

/** Update a company (partial update). Used for COMP-02 research notes. */
export async function update(
	db: Database,
	userId: string,
	companyId: string,
	input: {
		name?: string;
		domain?: string;
		website?: string;
		notes?: string;
	},
) {
	await verifyCompanyOwnership(db, userId, companyId);

	const setValues: Record<string, unknown> = { updatedAt: new Date() };

	if (input.name !== undefined) setValues.name = input.name;
	if (input.domain !== undefined) setValues.domain = input.domain || null;
	if (input.website !== undefined) setValues.website = input.website || null;
	if (input.notes !== undefined) setValues.notes = input.notes;

	const result = await db
		.update(company)
		.set(setValues)
		.where(eq(company.id, companyId))
		.returning();

	return result[0];
}

/** Delete a company */
export async function remove(
	db: Database,
	userId: string,
	companyId: string,
) {
	await verifyCompanyOwnership(db, userId, companyId);

	await db.delete(company).where(eq(company.id, companyId));

	return { deleted: true };
}

/** Find company by domain for a user. Returns null if not found. */
export async function getByDomain(
	db: Database,
	userId: string,
	domain: string,
) {
	const c = await db
		.select()
		.from(company)
		.where(
			and(
				eq(company.userId, userId),
				eq(company.domain, domain),
			),
		)
		.get();

	return c || null;
}
