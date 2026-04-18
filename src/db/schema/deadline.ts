import {
	sqliteTable,
	text,
	integer,
	index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { user } from "./auth";
import { application } from "./application";

export const deadline = sqliteTable(
	"deadline",
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
		deadlineType: text("deadline_type").notNull(),
		label: text("label"),
		dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
		isCompleted: integer("is_completed", { mode: "boolean" })
			.notNull()
			.default(false),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [
		index("idx_deadline_app").on(t.applicationId),
		index("idx_deadline_user_due").on(t.userId, t.dueDate),
	],
);
