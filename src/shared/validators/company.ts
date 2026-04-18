import { z } from "zod";

export const createCompanySchema = z.object({
	name: z.string().min(1).max(200),
	domain: z.string().max(200).optional(),
	website: z.string().url().optional().or(z.literal("")),
	notes: z.string().optional(),
});

export const updateCompanySchema = z.object({
	name: z.string().min(1).max(200).optional(),
	domain: z.string().max(200).optional().or(z.literal("")),
	website: z.string().url().optional().or(z.literal("")),
	notes: z.string().optional(),
});
