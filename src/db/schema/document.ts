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

export const document = sqliteTable(
	"document",
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
		fileName: text("file_name").notNull(),
		fileType: text("file_type").notNull(),
		fileSize: integer("file_size").notNull(),
		r2Key: text("r2_key").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [
		index("idx_document_app").on(t.applicationId, t.createdAt),
		index("idx_document_user").on(t.userId),
	],
);
