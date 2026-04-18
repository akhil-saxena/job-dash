import { eq, and, isNull, like, desc, asc, sql, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { application, timelineEvent } from "@/db/schema";
import { generateBaseSlug } from "@/shared/slug";
import { NotFoundError } from "@/server/lib/errors";
import type { Database } from "@/server/lib/db";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Base conditions for every query: tenant isolation + soft-delete exclusion */
function baseConditions(userId: string) {
	return [eq(application.userId, userId), isNull(application.deletedAt)] as const;
}

/** Build a timeline event insert statement (NOT executed -- use inside db.batch()) */
function createTimelineEvent(
	db: Database,
	params: {
		applicationId: string;
		userId: string;
		eventType: string;
		description: string;
		metadata?: Record<string, unknown>;
	},
) {
	return db.insert(timelineEvent).values({
		id: nanoid(),
		applicationId: params.applicationId,
		userId: params.userId,
		eventType: params.eventType,
		description: params.description,
		metadata: params.metadata ? JSON.stringify(params.metadata) : null,
		occurredAt: new Date(),
	});
}

/** Resolve a unique slug for the given user, appending -2, -3, etc. on collision */
async function resolveUniqueSlug(
	db: Database,
	userId: string,
	baseSlug: string,
): Promise<string> {
	const existing = await db
		.select({ slug: application.slug })
		.from(application)
		.where(and(eq(application.userId, userId), like(application.slug, `${baseSlug}%`)))
		.all();

	const slugSet = new Set(existing.map((r) => r.slug));
	if (!slugSet.has(baseSlug)) return baseSlug;

	let counter = 2;
	while (slugSet.has(`${baseSlug}-${counter}`)) counter++;
	return `${baseSlug}-${counter}`;
}

// ---------------------------------------------------------------------------
// Sort column helper
// ---------------------------------------------------------------------------

const SORT_COLUMNS = {
	created_at: application.createdAt,
	updated_at: application.updatedAt,
	applied_at: application.appliedAt,
	company_name: application.companyName,
} as const;

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/** Create a new application with a "created" timeline event (atomic via db.batch) */
export async function create(
	db: Database,
	userId: string,
	input: {
		companyName: string;
		roleTitle: string;
		jobPostingUrl?: string;
		locationType?: string;
		locationCity?: string;
		salaryMin?: number;
		salaryMax?: number;
		salaryOffered?: number;
		salaryCurrency?: string;
		equity?: string;
		bonus?: string;
		status?: string;
		priority?: string;
		source?: string;
		notes?: string;
		appliedAt?: string;
	},
) {
	const baseSlug = generateBaseSlug(input.companyName, input.roleTitle);
	const slug = await resolveUniqueSlug(db, userId, baseSlug);
	const now = new Date();
	const id = nanoid();
	const status = input.status || "wishlist";

	const [created] = await db.batch([
		db
			.insert(application)
			.values({
				id,
				userId,
				companyName: input.companyName,
				roleTitle: input.roleTitle,
				jobPostingUrl: input.jobPostingUrl || null,
				locationType: input.locationType || null,
				locationCity: input.locationCity || null,
				salaryMin: input.salaryMin ?? null,
				salaryMax: input.salaryMax ?? null,
				salaryOffered: input.salaryOffered ?? null,
				salaryCurrency: input.salaryCurrency,
				equity: input.equity || null,
				bonus: input.bonus || null,
				status,
				priority: input.priority || "medium",
				source: input.source || null,
				notes: input.notes || null,
				slug,
				appliedAt: input.appliedAt ? new Date(input.appliedAt) : null,
				createdAt: now,
				updatedAt: now,
			})
			.returning(),
		createTimelineEvent(db, {
			applicationId: id,
			userId,
			eventType: "created",
			description: "Application created",
			metadata: { status },
		}),
	]);

	return created[0];
}

/** Get a single application by ID with its timeline events */
export async function getById(db: Database, userId: string, appId: string) {
	const app = await db
		.select()
		.from(application)
		.where(and(eq(application.id, appId), ...baseConditions(userId)))
		.get();

	if (!app) throw new NotFoundError("Application not found");

	const events = await db
		.select()
		.from(timelineEvent)
		.where(eq(timelineEvent.applicationId, appId))
		.orderBy(desc(timelineEvent.occurredAt))
		.all();

	return { ...app, timeline: events };
}

/** Get a single application by slug with its timeline events */
export async function getBySlug(db: Database, userId: string, slug: string) {
	const app = await db
		.select()
		.from(application)
		.where(and(eq(application.slug, slug), ...baseConditions(userId)))
		.get();

	if (!app) throw new NotFoundError("Application not found");

	const events = await db
		.select()
		.from(timelineEvent)
		.where(eq(timelineEvent.applicationId, app.id))
		.orderBy(desc(timelineEvent.occurredAt))
		.all();

	return { ...app, timeline: events };
}

/** List applications with filtering, search, sorting, and pagination */
export async function list(
	db: Database,
	userId: string,
	params: {
		status?: string;
		priority?: string;
		source?: string;
		search?: string;
		archived?: boolean;
		sort?: string;
		order?: string;
		page?: number;
		limit?: number;
	},
) {
	const page = params.page ?? 1;
	const limit = params.limit ?? 20;
	const offset = (page - 1) * limit;

	// Build dynamic WHERE conditions
	const conditions: ReturnType<typeof eq>[] = [
		eq(application.userId, userId),
		isNull(application.deletedAt),
	];

	if (!params.archived) {
		conditions.push(eq(application.isArchived, false));
	}
	if (params.status) {
		conditions.push(eq(application.status, params.status));
	}
	if (params.priority) {
		conditions.push(eq(application.priority, params.priority));
	}
	if (params.source) {
		conditions.push(eq(application.source, params.source));
	}

	const whereClause = params.search
		? and(
				...conditions,
				sql`(${application.companyName} LIKE ${"%" + params.search + "%"} OR ${application.roleTitle} LIKE ${"%" + params.search + "%"})`,
			)
		: and(...conditions);

	// Count total
	const totalResult = await db
		.select({ value: count() })
		.from(application)
		.where(whereClause)
		.get();
	const total = totalResult?.value ?? 0;

	// Determine sort column and order
	const sortCol =
		SORT_COLUMNS[(params.sort as keyof typeof SORT_COLUMNS) ?? "created_at"] ??
		SORT_COLUMNS.created_at;
	const orderFn = params.order === "asc" ? asc : desc;

	// Fetch items
	const items = await db
		.select()
		.from(application)
		.where(whereClause)
		.orderBy(orderFn(sortCol))
		.limit(limit)
		.offset(offset)
		.all();

	return { items, total, page, limit };
}

/** Update an application (partial). Detects status/pin/archive changes for timeline events. */
export async function update(
	db: Database,
	userId: string,
	appId: string,
	input: Record<string, unknown>,
) {
	const app = await db
		.select()
		.from(application)
		.where(and(eq(application.id, appId), ...baseConditions(userId)))
		.get();

	if (!app) throw new NotFoundError("Application not found");

	const now = new Date();
	const eventInserts: ReturnType<typeof createTimelineEvent>[] = [];

	// Detect status change
	if (input.status !== undefined && input.status !== app.status) {
		eventInserts.push(
			createTimelineEvent(db, {
				applicationId: appId,
				userId,
				eventType: "status_change",
				description: `Status changed from ${app.status} to ${input.status}`,
				metadata: { from: app.status, to: input.status },
			}),
		);
	}

	// Detect pin change
	if (input.isPinned !== undefined && input.isPinned !== app.isPinned) {
		const type = input.isPinned ? "pinned" : "unpinned";
		eventInserts.push(
			createTimelineEvent(db, {
				applicationId: appId,
				userId,
				eventType: type,
				description: `Application ${type}`,
			}),
		);
	}

	// Detect archive change
	if (input.isArchived !== undefined && input.isArchived !== app.isArchived) {
		const type = input.isArchived ? "archived" : "unarchived";
		eventInserts.push(
			createTimelineEvent(db, {
				applicationId: appId,
				userId,
				eventType: type,
				description: `Application ${type}`,
			}),
		);
	}

	// Convert appliedAt string to Date if present
	const setValues: Record<string, unknown> = { ...input, updatedAt: now };
	if (typeof setValues.appliedAt === "string") {
		setValues.appliedAt = new Date(setValues.appliedAt as string);
	}

	const updateQuery = db
		.update(application)
		.set(setValues)
		.where(eq(application.id, appId))
		.returning();

	if (eventInserts.length > 0) {
		const [updated] = await db.batch([updateQuery, ...eventInserts]);
		return updated[0];
	}

	const updated = await updateQuery;
	return updated[0];
}

/** Change status with atomic timeline event via db.batch() */
export async function changeStatus(
	db: Database,
	userId: string,
	appId: string,
	newStatus: string,
) {
	const app = await db
		.select()
		.from(application)
		.where(and(eq(application.id, appId), ...baseConditions(userId)))
		.get();

	if (!app) throw new NotFoundError("Application not found");
	if (app.status === newStatus) return app;

	const now = new Date();
	const [updated] = await db.batch([
		db
			.update(application)
			.set({ status: newStatus, updatedAt: now })
			.where(eq(application.id, appId))
			.returning(),
		createTimelineEvent(db, {
			applicationId: appId,
			userId,
			eventType: "status_change",
			description: `Status changed from ${app.status} to ${newStatus}`,
			metadata: { from: app.status, to: newStatus },
		}),
	]);

	return updated[0];
}

/** Toggle isPinned with timeline event */
export async function togglePin(db: Database, userId: string, appId: string) {
	const app = await db
		.select()
		.from(application)
		.where(and(eq(application.id, appId), ...baseConditions(userId)))
		.get();

	if (!app) throw new NotFoundError("Application not found");

	const newPinned = !app.isPinned;
	const now = new Date();
	const eventType = newPinned ? "pinned" : "unpinned";

	const [updated] = await db.batch([
		db
			.update(application)
			.set({ isPinned: newPinned, updatedAt: now })
			.where(eq(application.id, appId))
			.returning(),
		createTimelineEvent(db, {
			applicationId: appId,
			userId,
			eventType,
			description: `Application ${eventType}`,
		}),
	]);

	return updated[0];
}

/** Toggle isArchived with timeline event */
export async function toggleArchive(db: Database, userId: string, appId: string) {
	const app = await db
		.select()
		.from(application)
		.where(and(eq(application.id, appId), ...baseConditions(userId)))
		.get();

	if (!app) throw new NotFoundError("Application not found");

	const newArchived = !app.isArchived;
	const now = new Date();
	const eventType = newArchived ? "archived" : "unarchived";

	const [updated] = await db.batch([
		db
			.update(application)
			.set({ isArchived: newArchived, updatedAt: now })
			.where(eq(application.id, appId))
			.returning(),
		createTimelineEvent(db, {
			applicationId: appId,
			userId,
			eventType,
			description: `Application ${eventType}`,
		}),
	]);

	return updated[0];
}

/** Soft-delete: set deletedAt with timeline event */
export async function softDelete(db: Database, userId: string, appId: string) {
	const app = await db
		.select()
		.from(application)
		.where(and(eq(application.id, appId), ...baseConditions(userId)))
		.get();

	if (!app) throw new NotFoundError("Application not found");

	const now = new Date();
	const [updated] = await db.batch([
		db
			.update(application)
			.set({ deletedAt: now, updatedAt: now })
			.where(eq(application.id, appId))
			.returning(),
		createTimelineEvent(db, {
			applicationId: appId,
			userId,
			eventType: "deleted",
			description: "Application deleted",
		}),
	]);

	return updated[0];
}

/** Restore: clear deletedAt with timeline event */
export async function restore(db: Database, userId: string, appId: string) {
	// Must find a currently-deleted app
	const app = await db
		.select()
		.from(application)
		.where(
			and(
				eq(application.id, appId),
				eq(application.userId, userId),
				sql`${application.deletedAt} IS NOT NULL`,
			),
		)
		.get();

	if (!app) throw new NotFoundError("Application not found");

	const now = new Date();
	const [updated] = await db.batch([
		db
			.update(application)
			.set({ deletedAt: null, updatedAt: now })
			.where(eq(application.id, appId))
			.returning(),
		createTimelineEvent(db, {
			applicationId: appId,
			userId,
			eventType: "restored",
			description: "Application restored",
		}),
	]);

	return updated[0];
}

/** Get timeline events for an application */
export async function getTimeline(db: Database, userId: string, appId: string) {
	// Verify the app exists and belongs to the user
	const app = await db
		.select({ id: application.id })
		.from(application)
		.where(and(eq(application.id, appId), eq(application.userId, userId)))
		.get();

	if (!app) throw new NotFoundError("Application not found");

	return db
		.select()
		.from(timelineEvent)
		.where(eq(timelineEvent.applicationId, appId))
		.orderBy(desc(timelineEvent.occurredAt))
		.all();
}
