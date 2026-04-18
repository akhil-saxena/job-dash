import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useApplications } from "@/client/hooks/useApplications";
import type { Application } from "@/client/hooks/useApplications";
import { useSearch } from "@/client/hooks/useSearch";
import { FilterChips } from "@/client/components/design-system/FilterChips";
import { ApplicationTable } from "@/client/components/table/ApplicationTable";
import { MobileCardList } from "@/client/components/table/MobileCardList";
import { APPLICATION_STATUSES } from "@/shared/constants";
import { STATUS_LABELS } from "@/client/lib/colors";
import { getDaysSinceUpdate } from "@/client/lib/urgency";

const searchSchema = z.object({
	status: z.string().optional(),
	sort: z
		.enum(["company", "role", "status", "priority", "source", "applied", "days"])
		.optional(),
	order: z.enum(["asc", "desc"]).optional(),
});

export const Route = createFileRoute("/_authenticated/list")({
	validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
	component: ListPage,
});

function sortApps(
	apps: Application[],
	sort: string | undefined,
	order: string | undefined,
): Application[] {
	if (!sort) return apps;
	const dir = order === "desc" ? -1 : 1;

	return [...apps].sort((a, b) => {
		switch (sort) {
			case "company":
				return dir * a.companyName.localeCompare(b.companyName);
			case "role":
				return dir * a.roleTitle.localeCompare(b.roleTitle);
			case "status": {
				const ai = APPLICATION_STATUSES.indexOf(a.status);
				const bi = APPLICATION_STATUSES.indexOf(b.status);
				return dir * (ai - bi);
			}
			case "priority": {
				const order_map: Record<string, number> = { high: 0, medium: 1, low: 2 };
				return dir * ((order_map[a.priority] ?? 3) - (order_map[b.priority] ?? 3));
			}
			case "source":
				return dir * (a.source ?? "").localeCompare(b.source ?? "");
			case "applied":
				return dir * ((a.appliedAt ?? 0) - (b.appliedAt ?? 0));
			case "days":
				return dir * (getDaysSinceUpdate(a.updatedAt) - getDaysSinceUpdate(b.updatedAt));
			default:
				return 0;
		}
	});
}

function ListPage() {
	const { status, sort, order } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { data: apps, isLoading } = useApplications();
	const { query } = useSearch();

	// Filter pipeline
	let filtered = apps ?? [];

	// (a) Filter by status
	if (status) {
		filtered = filtered.filter((app) => app.status === status);
	}

	// (b) Filter by search query
	if (query) {
		const q = query.toLowerCase();
		filtered = filtered.filter(
			(app) =>
				app.companyName.toLowerCase().includes(q) ||
				app.roleTitle.toLowerCase().includes(q),
		);
	}

	// (c) Sort
	const sorted = sortApps(filtered, sort, order);

	// Build filter chip items
	const allApps = apps ?? [];
	const chipItems = [
		{ label: "All", value: "all", count: allApps.length },
		...APPLICATION_STATUSES.map((s) => ({
			label: STATUS_LABELS[s],
			value: s,
			count: allApps.filter((app) => app.status === s).length,
		})),
	];

	function handleStatusChange(value: string) {
		navigate({
			search: (prev: Record<string, unknown>) => ({
				...prev,
				status: value === "all" ? undefined : value,
			}),
		});
	}

	function handleSort(field: string) {
		navigate({
			search: (prev: Record<string, unknown>) => {
				if (prev.sort === field) {
					if (prev.order === "asc") {
						return { ...prev, order: "desc" };
					}
					// Clear sort
					const { sort: _s, order: _o, ...rest } = prev;
					return rest;
				}
				return { ...prev, sort: field, order: "asc" };
			},
		});
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4 p-4 md:p-6">
				<div className="flex gap-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className="h-8 w-20 animate-pulse rounded-[var(--radius-btn)] bg-black/[0.04] dark:bg-white/[0.06]"
						/>
					))}
				</div>
				<div className="glass rounded-[var(--radius-card)] overflow-hidden">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="flex items-center gap-3 border-b border-black/[0.04] px-3 py-3 dark:border-white/[0.04]"
						>
							<div className="h-6 w-6 animate-pulse rounded-md bg-black/[0.06] dark:bg-white/[0.08]" />
							<div className="h-4 w-32 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
							<div className="h-4 w-24 animate-pulse rounded bg-black/[0.04] dark:bg-white/[0.06]" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 p-4 md:p-6">
			{/* Filter chips */}
			<FilterChips
				variant="tab"
				items={chipItems}
				active={status || "all"}
				onChange={handleStatusChange}
			/>

			{/* Desktop: glass table */}
			<div className="hidden md:block">
				<ApplicationTable
					apps={sorted}
					sort={sort}
					order={order}
					onSort={handleSort}
				/>
			</div>

			{/* Mobile: card list */}
			<div className="md:hidden">
				<MobileCardList apps={sorted} />
			</div>
		</div>
	);
}
