import { z } from "zod";

export const createDocumentSchema = z.object({
	fileName: z.string().min(1).max(255),
	fileType: z.string().min(1).max(100),
	fileSize: z.number().int().min(1),
	r2Key: z.string().min(1).max(500),
});
