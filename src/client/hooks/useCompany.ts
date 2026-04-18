import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Company {
	id: string;
	name: string;
	domain: string | null;
	website: string | null;
	notes: string | null;
	createdAt: number;
	updatedAt: number;
}

/**
 * Find or create a company by name. The API endpoint is idempotent --
 * it returns the existing company if one already matches by domain/name.
 */
export function useCompanyForApplication(companyName: string) {
	return useQuery({
		queryKey: ["company", companyName.toLowerCase().trim()],
		queryFn: async () => {
			const res = await fetch("/api/companies", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: companyName }),
			});
			if (!res.ok) throw new Error("Failed to find/create company");
			const json = await res.json();
			return json.data as Company;
		},
		enabled: !!companyName,
		staleTime: 5 * 60 * 1000, // 5 min -- company data doesn't change often
	});
}

/** PATCH /api/companies/:companyId to update company fields */
export function useUpdateCompany() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ companyId, ...fields }: { companyId: string; [key: string]: unknown }) => {
			const res = await fetch(`/api/companies/${companyId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(fields),
			});
			if (!res.ok) throw new Error("Failed to update company");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["company"] });
		},
	});
}
