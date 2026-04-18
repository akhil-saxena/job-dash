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

export const interviewRound = sqliteTable(
	"interview_round",
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
		roundType: text("round_type").notNull(),
		customTypeName: text("custom_type_name"),
		scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
		durationMinutes: integer("duration_minutes").default(60),
		interviewerName: text("interviewer_name"),
		interviewerRole: text("interviewer_role"),
		meetingLink: text("meeting_link"),
		status: text("status").notNull().default("scheduled"),
		rating: integer("rating"),
		experienceNotes: text("experience_notes"),
		feedback: text("feedback"),
		sortOrder: integer("sort_order").notNull().default(0),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [
		index("idx_interview_round_app").on(t.applicationId, t.sortOrder),
		index("idx_interview_round_user").on(t.userId),
		index("idx_interview_round_scheduled").on(t.applicationId, t.scheduledAt),
	],
);

export const interviewQa = sqliteTable(
	"interview_qa",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid()),
		roundId: text("round_id")
			.notNull()
			.references(() => interviewRound.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		question: text("question").notNull(),
		answer: text("answer"),
		sortOrder: integer("sort_order").notNull().default(0),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(t) => [
		index("idx_interview_qa_round").on(t.roundId, t.sortOrder),
	],
);
