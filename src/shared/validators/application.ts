import { z } from "zod";
import {
	APPLICATION_STATUSES,
	PRIORITIES,
	LOCATION_TYPES,
} from "@/shared/constants";

export const createApplicationSchema = z.object({
	companyName: z.string().min(1).max(200),
	roleTitle: z.string().min(1).max(200),
	jobPostingUrl: z.string().url().optional().or(z.literal("")),
	applicationPortalUrl: z.string().url().optional().or(z.literal("")),
	locationType: z.enum(LOCATION_TYPES).optional(),
	locationCity: z.string().max(100).optional(),
	salaryMin: z.number().int().min(0).optional(),
	salaryMax: z.number().int().min(0).optional(),
	salaryOffered: z.number().int().min(0).optional(),
	salaryCurrency: z.string().max(3).optional(),
	equity: z.string().max(100).optional(),
	bonus: z.string().max(100).optional(),
	status: z.enum(APPLICATION_STATUSES).optional(),
	priority: z.enum(PRIORITIES).optional(),
	source: z.string().max(50).optional(),
	notes: z.string().optional(),
	appliedAt: z.string().datetime().optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const statusChangeSchema = z.object({
	status: z.enum(APPLICATION_STATUSES),
});

export const listApplicationsSchema = z.object({
	status: z.enum(APPLICATION_STATUSES).optional(),
	priority: z.enum(PRIORITIES).optional(),
	source: z.string().optional(),
	search: z.string().optional(),
	tag: z.string().optional(),
	archived: z.coerce.boolean().optional(),
	sort: z
		.enum(["created_at", "updated_at", "applied_at", "company_name"])
		.optional(),
	order: z.enum(["asc", "desc"]).optional(),
	page: z.coerce.number().int().min(1).optional().default(1),
	limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
