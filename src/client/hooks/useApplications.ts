import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APPLICATION_STATUSES } from "@/shared/constants";
import type { ApplicationStatus } from "@/shared/constants";
import { useToast } from "@/client/components/ui/Toast";

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

// ---------------------------------------------------------------------------
// Optimistic mutation hooks (D-16, D-17, D-18, UI-05)
// ---------------------------------------------------------------------------

/** Optimistic status change mutation used by kanban DnD and detail page */
export function useUpdateStatus() {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
			const res = await fetch(`/api/applications/${id}/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			if (!res.ok) throw new Error("Failed to update status");
			return res.json();
		},
		onMutate: async ({ id, status }) => {
			await queryClient.cancelQueries({ queryKey: ["applications"] });
			const previousApps = queryClient.getQueryData<Application[]>(["applications"]);
			queryClient.setQueryData<Application[]>(["applications"], (old) =>
				old?.map((app) =>
					app.id === id ? { ...app, status, updatedAt: Math.floor(Date.now() / 1000) } : app,
				),
			);
			return { previousApps };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousApps) {
				queryClient.setQueryData(["applications"], context.previousApps);
			}
			showToast("Failed to update. Reverted.", "error");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
	});
}

/** Optimistic pin toggle mutation */
export function useTogglePin() {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async ({ id }: { id: string }) => {
			const res = await fetch(`/api/applications/${id}/pin`, {
				method: "PATCH",
			});
			if (!res.ok) throw new Error("Failed to toggle pin");
			return res.json();
		},
		onMutate: async ({ id }) => {
			await queryClient.cancelQueries({ queryKey: ["applications"] });
			const previousApps = queryClient.getQueryData<Application[]>(["applications"]);
			queryClient.setQueryData<Application[]>(["applications"], (old) =>
				old?.map((app) =>
					app.id === id ? { ...app, isPinned: app.isPinned ? 0 : 1 } : app,
				),
			);
			return { previousApps };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousApps) {
				queryClient.setQueryData(["applications"], context.previousApps);
			}
			showToast("Failed to update. Reverted.", "error");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
	});
}

/** Optimistic archive toggle mutation */
export function useToggleArchive() {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async ({ id }: { id: string }) => {
			const res = await fetch(`/api/applications/${id}/archive`, {
				method: "PATCH",
			});
			if (!res.ok) throw new Error("Failed to toggle archive");
			return res.json();
		},
		onMutate: async ({ id }) => {
			await queryClient.cancelQueries({ queryKey: ["applications"] });
			const previousApps = queryClient.getQueryData<Application[]>(["applications"]);
			queryClient.setQueryData<Application[]>(["applications"], (old) =>
				old?.map((app) =>
					app.id === id ? { ...app, isArchived: app.isArchived ? 0 : 1 } : app,
				),
			);
			return { previousApps };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousApps) {
				queryClient.setQueryData(["applications"], context.previousApps);
			}
			showToast("Failed to update. Reverted.", "error");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
	});
}

/** Optimistic partial update mutation for detail page fields */
export function useUpdateApplication() {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async ({ id, ...fields }: { id: string; slug?: string; [key: string]: unknown }) => {
			const res = await fetch(`/api/applications/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(fields),
			});
			if (!res.ok) throw new Error("Failed to update application");
			return res.json();
		},
		onMutate: async ({ id, slug, ...fields }) => {
			await queryClient.cancelQueries({ queryKey: ["applications"] });
			const previousApps = queryClient.getQueryData<Application[]>(["applications"]);
			queryClient.setQueryData<Application[]>(["applications"], (old) =>
				old?.map((app) =>
					app.id === id
						? { ...app, ...fields, updatedAt: Math.floor(Date.now() / 1000) } as Application
						: app,
				),
			);
			return { previousApps };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousApps) {
				queryClient.setQueryData(["applications"], context.previousApps);
			}
			showToast("Failed to update. Reverted.", "error");
		},
		onSettled: (_data, _err, variables) => {
			queryClient.invalidateQueries({ queryKey: ["applications"] });
			if (variables.slug) {
				queryClient.invalidateQueries({ queryKey: ["application", variables.slug] });
			}
		},
	});
}
