import { useQuery } from "@tanstack/react-query";
import type { Application } from "./useApplications";

interface TimelineEvent {
	id: string;
	applicationId: string;
	eventType: string;
	description: string;
	metadata: string | null;
	occurredAt: string;
}

export interface ApplicationDetail extends Application {
	jobPostingUrl: string | null;
	applicationPortalUrl: string | null;
	equity: string | null;
	bonus: string | null;
	jdText: string | null;
	timeline: TimelineEvent[];
}

export function useApplicationBySlug(slug: string) {
	return useQuery({
		queryKey: ["application", slug],
		queryFn: async () => {
			const res = await fetch(`/api/application-by-slug/${slug}`);
			if (!res.ok) throw new Error("Application not found");
			const json = await res.json();
			return json.data as ApplicationDetail;
		},
		enabled: !!slug,
	});
}
