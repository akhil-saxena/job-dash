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

export const company = sqliteTable(
	"company",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		domain: text("domain"),
		website: text("website"),
		notes: text("notes"),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [
		uniqueIndex("idx_company_user_domain").on(t.userId, t.domain),
		index("idx_company_user_name").on(t.userId, t.name),
	],
);
