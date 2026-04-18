import { z } from "zod";
import { TAG_COLORS } from "@/shared/constants";

export const createTagSchema = z.object({
	name: z.string().min(1).max(50),
	color: z.enum(TAG_COLORS).optional().default("blue"),
});

export const updateTagSchema = z.object({
	name: z.string().min(1).max(50).optional(),
	color: z.enum(TAG_COLORS).optional(),
});

export const assignTagSchema = z.object({
	tagId: z.string().min(1),
});
