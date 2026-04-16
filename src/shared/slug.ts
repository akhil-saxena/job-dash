export function generateBaseSlug(company: string, role: string): string {
	return `${company}-${role}`
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}
