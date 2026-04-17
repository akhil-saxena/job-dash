import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APPLICATION_STATUSES } from "@/shared/constants";
import type { ApplicationStatus } from "@/shared/constants";

export interface Application {
	id: string;
	companyName: string;
	roleTitle: string;
	status: ApplicationStatus;
	priority: string;
	slug: string;
	isPinned: number;
	isArchived: number;
	updatedAt: number;
	createdAt: number;
	appliedAt: number | null;
	source: string | null;
	locationType: string | null;
	locationCity: string | null;
	salaryMin: number | null;
	salaryMax: number | null;
	salaryCurrency: string;
	notes: string | null;
}

async function fetchApplications(): Promise<Application[]> {
	const res = await fetch("/api/applications?limit=100&archived=false");
	if (!res.ok) throw new Error("Failed to fetch applications");
	const json = await res.json();
	// API returns { data: [...], pagination: {...} } via paginated() helper
	return json.data;
}

export function useApplications() {
	return useQuery({
		queryKey: ["applications"],
		queryFn: fetchApplications,
	});
}

export function useApplicationsByStatus() {
	const query = useApplications();
	const grouped = new Map<ApplicationStatus, Application[]>();

	// Initialize ALL statuses with empty arrays to prevent column collapse (Pitfall 6)
	for (const status of APPLICATION_STATUSES) {
		grouped.set(status, []);
	}

	if (query.data) {
		for (const app of query.data) {
			const list = grouped.get(app.status);
			if (list) {
				list.push(app);
			}
		}
	}

	return { ...query, grouped };
}

export function useCreateApplication() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: {
			companyName: string;
			roleTitle: string;
			status?: string;
		}) => {
			const res = await fetch("/api/applications", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(
					err?.error?.message ?? "Failed to create application",
				);
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
	});
}
