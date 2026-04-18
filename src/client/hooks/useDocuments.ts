import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/client/components/ui/Toast";

export interface Document {
	id: string;
	applicationId: string;
	fileName: string;
	fileType: string;
	fileSize: number;
	r2Key: string;
	createdAt: number;
	updatedAt: number;
}

/** Fetch all documents for an application */
export function useDocuments(applicationId: string) {
	return useQuery({
		queryKey: ["documents", applicationId],
		queryFn: async () => {
			const res = await fetch(`/api/applications/${applicationId}/documents`);
			if (!res.ok) throw new Error("Failed to fetch documents");
			const json = await res.json();
			return json.data as Document[];
		},
		enabled: !!applicationId,
	});
}

/** Get document count for tab badge */
export function useDocumentCount(applicationId: string) {
	return useQuery({
		queryKey: ["document-count", applicationId],
		queryFn: async () => {
			const res = await fetch(`/api/applications/${applicationId}/document-count`);
			if (!res.ok) throw new Error("Failed to fetch document count");
			const json = await res.json();
			return (json.data as { count: number }).count;
		},
		enabled: !!applicationId,
	});
}

/** Create a document metadata record */
export function useCreateDocument(applicationId: string) {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async (input: {
			fileName: string;
			fileType: string;
			fileSize: number;
			r2Key: string;
		}) => {
			const res = await fetch(`/api/applications/${applicationId}/documents`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (!res.ok) throw new Error("Failed to create document");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["documents", applicationId] });
			queryClient.invalidateQueries({ queryKey: ["document-count", applicationId] });
		},
		onError: () => {
			showToast("Failed to save document.", "error");
		},
	});
}

/** Delete a document */
export function useDeleteDocument(applicationId: string) {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async (docId: string) => {
			const res = await fetch(`/api/documents/${docId}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete document");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["documents", applicationId] });
			queryClient.invalidateQueries({ queryKey: ["document-count", applicationId] });
		},
		onError: () => {
			showToast("Failed to delete document.", "error");
		},
	});
}
