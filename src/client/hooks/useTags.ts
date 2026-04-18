import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/client/components/ui/Toast";

export interface Tag {
	id: string;
	name: string;
	color: string;
	createdAt: number;
}

export function useTags() {
	return useQuery({
		queryKey: ["tags"],
		queryFn: async () => {
			const res = await fetch("/api/tags");
			if (!res.ok) throw new Error("Failed to fetch tags");
			const json = await res.json();
			return json.data as Tag[];
		},
	});
}

export function useCreateTag() {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async (input: { name: string; color: string }) => {
			const res = await fetch("/api/tags", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error?.message ?? "Failed to create tag");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tags"] });
		},
		onError: (err: Error) => {
			showToast(err.message, "error");
		},
	});
}

export function useApplicationTags(appId: string) {
	return useQuery({
		queryKey: ["application-tags", appId],
		queryFn: async () => {
			const res = await fetch(`/api/applications/${appId}/tags`);
			if (!res.ok) throw new Error("Failed to fetch application tags");
			const json = await res.json();
			return json.data as Tag[];
		},
		enabled: !!appId,
	});
}

export function useAssignTag() {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async ({ appId, tagId }: { appId: string; tagId: string }) => {
			const res = await fetch(`/api/applications/${appId}/tags`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tagId }),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error?.message ?? "Failed to assign tag");
			}
			return res.json();
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["application-tags", variables.appId] });
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (err: Error) => {
			showToast(err.message, "error");
		},
	});
}

export function useUnassignTag() {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async ({ appId, tagId }: { appId: string; tagId: string }) => {
			const res = await fetch(`/api/applications/${appId}/tags/${tagId}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to unassign tag");
			return res.json();
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["application-tags", variables.appId] });
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (err: Error) => {
			showToast(err.message, "error");
		},
	});
}
