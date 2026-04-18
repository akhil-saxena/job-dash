import { createFileRoute } from "@tanstack/react-router";
import { useApplicationBySlug } from "@/client/hooks/useApplicationDetail";
import { DetailPage } from "@/client/components/detail/DetailPage";
import { Button } from "@/client/components/design-system/Button";

export const Route = createFileRoute("/_authenticated/app/$slug")({
	component: AppDetailPage,
});

function AppDetailPage() {
	const { slug } = Route.useParams();
	const { data: app, isLoading, isError, refetch } = useApplicationBySlug(slug);

	if (isLoading) {
		return (
			<div className="p-6 space-y-4">
				{/* Hero skeleton */}
				<div className="h-32 rounded-[var(--radius-card)] bg-black/[0.04] dark:bg-white/[0.06] animate-pulse" />
				{/* Tab skeleton */}
				<div className="h-10 w-64 rounded bg-black/[0.03] dark:bg-white/[0.04] animate-pulse" />
				{/* Content skeleton */}
				<div className="grid gap-6 md:grid-cols-2">
					<div className="h-64 rounded-[var(--radius-card)] bg-black/[0.03] dark:bg-white/[0.04] animate-pulse" />
					<div className="h-64 rounded-[var(--radius-card)] bg-black/[0.03] dark:bg-white/[0.04] animate-pulse" />
				</div>
			</div>
		);
	}

	if (isError || !app) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 p-12">
				<p className="text-sm text-text-secondary dark:text-dark-accent/60">
					Application not found.
				</p>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					Retry
				</Button>
			</div>
		);
	}

	return <DetailPage app={app} />;
}
