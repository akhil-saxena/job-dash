import { z } from "zod";
import { DEADLINE_TYPES } from "@/shared/constants";

export const createDeadlineSchema = z.object({
	deadlineType: z.enum(DEADLINE_TYPES),
	label: z.string().max(200).optional(),
	dueDate: z.string().datetime(),
});

export const updateDeadlineSchema = z.object({
	deadlineType: z.enum(DEADLINE_TYPES).optional(),
	label: z.string().max(200).optional().or(z.literal("")),
	dueDate: z.string().datetime().optional(),
	isCompleted: z.boolean().optional(),
});
