import { z } from "zod";
import { INTERVIEW_ROUND_TYPES, INTERVIEW_STATUSES } from "@/shared/constants";

export const createInterviewRoundSchema = z.object({
	roundType: z.enum(INTERVIEW_ROUND_TYPES),
	customTypeName: z.string().max(100).optional(),
	scheduledAt: z.string().datetime().nullable().optional(),
	durationMinutes: z.number().int().min(5).max(480).optional(),
	interviewerName: z.string().max(200).optional(),
	interviewerRole: z.string().max(200).optional(),
	meetingLink: z.string().url().optional().or(z.literal("")),
	status: z.enum(INTERVIEW_STATUSES).optional(),
	rating: z.number().int().min(1).max(5).optional(),
	experienceNotes: z.string().optional(),
	feedback: z.string().optional(),
});

export const updateInterviewRoundSchema = createInterviewRoundSchema.partial();

export const createQASchema = z.object({
	question: z.string().min(1).max(2000),
	answer: z.string().max(5000).optional(),
});

export const updateQASchema = z.object({
	question: z.string().min(1).max(2000).optional(),
	answer: z.string().max(5000).optional().or(z.literal("")),
});
