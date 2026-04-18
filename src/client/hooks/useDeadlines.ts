import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/client/components/ui/Toast";

export interface Deadline {
	id: string;
	applicationId: string;
	deadlineType: string;
	customLabel: string | null;
	dueAt: number;
	isCompleted: number;
	notes: string | null;
}

export function useDeadlines(appId: string) {
	return useQuery({
		queryKey: ["deadlines", appId],
		queryFn: async () => {
			const res = await fetch(`/api/applications/${appId}/deadlines`);
			if (!res.ok) throw new Error("Failed to fetch deadlines");
			const json = await res.json();
			return json.data as Deadline[];
		},
		enabled: !!appId,
	});
}

export function useUpcomingDeadlines() {
	return useQuery({
		queryKey: ["deadlines", "upcoming"],
		queryFn: async () => {
			const res = await fetch("/api/deadlines/upcoming");
			if (!res.ok) throw new Error("Failed to fetch upcoming deadlines");
			const json = await res.json();
			return json.data as Deadline[];
		},
	});
}

export function useCreateDeadline() {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async (input: {
			appId: string;
			deadlineType: string;
			dueAt: string;
			customLabel?: string;
			notes?: string;
		}) => {
			const { appId, ...body } = input;
			const res = await fetch(`/api/applications/${appId}/deadlines`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error?.message ?? "Failed to create deadline");
			}
			return res.json();
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["deadlines", variables.appId] });
			queryClient.invalidateQueries({ queryKey: ["deadlines", "upcoming"] });
		},
		onError: (err: Error) => {
			showToast(err.message, "error");
		},
	});
}

export function useCompleteDeadline() {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async ({ deadlineId }: { deadlineId: string }) => {
			const res = await fetch(`/api/deadlines/${deadlineId}/complete`, {
				method: "PATCH",
			});
			if (!res.ok) throw new Error("Failed to complete deadline");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deadlines"] });
		},
		onError: (err: Error) => {
			showToast(err.message, "error");
		},
	});
}

export function useDeleteDeadline() {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async ({ deadlineId }: { deadlineId: string }) => {
			const res = await fetch(`/api/deadlines/${deadlineId}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete deadline");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deadlines"] });
		},
		onError: (err: Error) => {
			showToast(err.message, "error");
		},
	});
}
