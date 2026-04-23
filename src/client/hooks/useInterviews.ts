import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/client/components/ui/Toast";

export interface InterviewQA {
	id: string;
	roundId: string;
	question: string;
	answer: string | null;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
}

export interface InterviewRound {
	id: string;
	applicationId: string;
	roundType: string;
	customTypeName: string | null;
	scheduledAt: string | null;
	durationMinutes: number;
	interviewerName: string | null;
	interviewerRole: string | null;
	meetingLink: string | null;
	status: string;
	rating: number | null;
	experienceNotes: string | null;
	feedback: string | null;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
	qaPairs: InterviewQA[];
}

export function useInterviews(applicationId: string) {
	return useQuery({
		queryKey: ["interviews", applicationId],
		queryFn: async () => {
			const res = await fetch(`/api/applications/${applicationId}/interviews`);
			if (!res.ok) throw new Error("Failed to fetch interviews");
			const json = await res.json();
			return json.data as InterviewRound[];
		},
		enabled: !!applicationId,
	});
}

export function useInterviewCount(applicationId: string) {
	return useQuery({
		queryKey: ["interview-count", applicationId],
		queryFn: async () => {
			const res = await fetch(`/api/applications/${applicationId}/interview-count`);
			if (!res.ok) throw new Error("Failed to fetch interview count");
			const json = await res.json();
			return json.data.count as number;
		},
		enabled: !!applicationId,
	});
}

export function useCreateRound(applicationId: string) {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async (input: { roundType: string; scheduledAt?: string; customTypeName?: string }) => {
			const res = await fetch(`/api/applications/${applicationId}/interviews`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error?.message ?? "Failed to create round");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviews", applicationId] });
			queryClient.invalidateQueries({ queryKey: ["interview-count", applicationId] });
			queryClient.invalidateQueries({ queryKey: ["calendar"] });
		},
		onError: (err: Error) => {
			showToast(err.message, "error");
		},
	});
}

export function useUpdateRound(applicationId: string) {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async ({ roundId, ...fields }: { roundId: string; [key: string]: unknown }) => {
			const res = await fetch(`/api/interviews/${roundId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(fields),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error?.message ?? "Failed to update round");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviews", applicationId] });
			queryClient.invalidateQueries({ queryKey: ["calendar"] });
		},
		onError: (err: Error) => {
			showToast(err.message, "error");
		},
	});
}

export function useDeleteRound(applicationId: string) {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async ({ roundId }: { roundId: string }) => {
			const res = await fetch(`/api/interviews/${roundId}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete round");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviews", applicationId] });
			queryClient.invalidateQueries({ queryKey: ["interview-count", applicationId] });
			queryClient.invalidateQueries({ queryKey: ["calendar"] });
			showToast("Round deleted", "success");
		},
		onError: (err: Error) => {
			showToast(err.message, "error");
		},
	});
}

export function useCreateQA(applicationId: string) {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async ({ roundId, question, answer }: { roundId: string; question: string; answer?: string }) => {
			const res = await fetch(`/api/interviews/${roundId}/qa`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question, answer }),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error?.message ?? "Failed to create Q&A");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviews", applicationId] });
		},
		onError: (err: Error) => {
			showToast(err.message, "error");
		},
	});
}

export function useUpdateQA(applicationId: string) {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async ({ qaId, ...fields }: { qaId: string; question?: string; answer?: string }) => {
			const res = await fetch(`/api/interview-qa/${qaId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(fields),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error?.message ?? "Failed to update Q&A");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviews", applicationId] });
		},
		onError: (err: Error) => {
			showToast(err.message, "error");
		},
	});
}

export function useDeleteQA(applicationId: string) {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async ({ qaId }: { qaId: string }) => {
			const res = await fetch(`/api/interview-qa/${qaId}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete Q&A");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviews", applicationId] });
		},
		onError: (err: Error) => {
			showToast(err.message, "error");
		},
	});
}
