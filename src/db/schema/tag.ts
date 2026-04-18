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
import { application } from "./application";

export const tag = sqliteTable(
	"tag",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		color: text("color").notNull().default("blue"),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [
		uniqueIndex("idx_tag_user_name").on(t.userId, t.name),
	],
);

export const applicationTag = sqliteTable(
	"application_tag",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid()),
		applicationId: text("application_id")
			.notNull()
			.references(() => application.id, { onDelete: "cascade" }),
		tagId: text("tag_id")
			.notNull()
			.references(() => tag.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [
		uniqueIndex("idx_application_tag_unique").on(t.applicationId, t.tagId),
		index("idx_application_tag_tag").on(t.tagId),
	],
);
