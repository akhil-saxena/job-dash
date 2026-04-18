import {
	sqliteTable,
	text,
	integer,
	index,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { user } from "./auth";

export const application = sqliteTable(
	"application",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		companyName: text("company_name").notNull(),
		roleTitle: text("role_title").notNull(),
		jobPostingUrl: text("job_posting_url"),
		applicationPortalUrl: text("application_portal_url"),
		locationType: text("location_type"),
		locationCity: text("location_city"),
		salaryMin: integer("salary_min"),
		salaryMax: integer("salary_max"),
		salaryOffered: integer("salary_offered"),
		salaryCurrency: text("salary_currency").default("INR"),
		equity: text("equity"),
		bonus: text("bonus"),
		status: text("status").notNull().default("wishlist"),
		priority: text("priority").default("medium"),
		source: text("source"),
		isPinned: integer("is_pinned", { mode: "boolean" })
			.notNull()
			.default(false),
		isArchived: integer("is_archived", { mode: "boolean" })
			.notNull()
			.default(false),
		notes: text("notes"),
		jdText: text("jd_text"),
		slug: text("slug").notNull(),
		appliedAt: integer("applied_at", { mode: "timestamp" }),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		deletedAt: integer("deleted_at", { mode: "timestamp" }),
	},
	(t) => [
		uniqueIndex("idx_application_user_slug").on(t.userId, t.slug),
		index("idx_application_user_status").on(t.userId, t.status),
		index("idx_application_user_created").on(t.userId, t.createdAt),
		index("idx_application_user_archived").on(t.userId, t.isArchived),
		index("idx_application_user_pinned").on(t.userId, t.isPinned),
	],
);

export const timelineEvent = sqliteTable(
	"timeline_event",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid()),
		applicationId: text("application_id")
			.notNull()
			.references(() => application.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		eventType: text("event_type").notNull(),
		description: text("description").notNull(),
		metadata: text("metadata"),
		occurredAt: integer("occurred_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [
		index("idx_timeline_event_app").on(t.applicationId, t.occurredAt),
	],
);
