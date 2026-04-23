import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AnalyticsThresholds } from "@/shared/validators/analytics";
import { ANALYTICS_THRESHOLD_DEFAULTS } from "@/shared/validators/analytics";
import { useToast } from "@/client/components/ui/Toast";

const KEY = ["settings", "analytics-thresholds"] as const;
const PATH = "/api/settings/analytics-thresholds";
const RESET_PATH = `${PATH}/reset`;

export function useAnalyticsThresholds() {
	return useQuery<AnalyticsThresholds>({
		queryKey: KEY,
		queryFn: async () => {
			const res = await fetch(PATH);
			if (!res.ok)
				throw new Error(
					`Failed to fetch analytics thresholds (${res.status})`,
				);
			const json = (await res.json()) as { data: AnalyticsThresholds };
			return json.data;
		},
		// Sensible fallback so the Response Time table can colour before the
		// hook's first resolution.
		initialData:
			ANALYTICS_THRESHOLD_DEFAULTS as unknown as AnalyticsThresholds,
	});
}

/**
 * Optimistic PATCH with revert-on-error. On success invalidates
 * analytics/response-times so the table recolours without a manual refresh.
 */
export function useUpdateAnalyticsThresholds() {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async (input: AnalyticsThresholds) => {
			const res = await fetch(PATH, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (!res.ok) {
				const err = (await res.json().catch(() => null)) as {
					error?: { message?: string };
				} | null;
				throw new Error(
					err?.error?.message ?? "Failed to save thresholds",
				);
			}
			const json = (await res.json()) as { data: AnalyticsThresholds };
			return json.data;
		},
		onMutate: async (input) => {
			await queryClient.cancelQueries({ queryKey: KEY });
			const previous =
				queryClient.getQueryData<AnalyticsThresholds>(KEY);
			queryClient.setQueryData<AnalyticsThresholds>(KEY, input);
			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(KEY, context.previous);
			}
			showToast("Couldn't save thresholds. Reverted.", "error");
		},
		onSuccess: () => {
			// Response Time table colours depend on thresholds — recolour.
			queryClient.invalidateQueries({
				queryKey: ["analytics", "response-times"],
			});
		},
	});
}

export function useResetAnalyticsThresholds() {
	const queryClient = useQueryClient();
	const { showToast } = useToast();

	return useMutation({
		mutationFn: async () => {
			const res = await fetch(RESET_PATH, { method: "POST" });
			if (!res.ok) throw new Error("Failed to reset thresholds");
			const json = (await res.json()) as { data: AnalyticsThresholds };
			return json.data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData<AnalyticsThresholds>(KEY, data);
			queryClient.invalidateQueries({
				queryKey: ["analytics", "response-times"],
			});
		},
		onError: () => {
			showToast("Couldn't reset thresholds. Try again.", "error");
		},
	});
}
