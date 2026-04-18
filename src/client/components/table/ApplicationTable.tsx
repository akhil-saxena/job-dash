import { Link } from "@tanstack/react-router";
import { SortableHeader } from "./SortableHeader";
import { CompanyBadge } from "@/client/components/kanban/CompanyBadge";
import { Badge } from "@/client/components/design-system/Badge";
import { STATUS_LABELS } from "@/client/lib/colors";
import { getDaysSinceUpdate } from "@/client/lib/urgency";
import type { Application } from "@/client/hooks/useApplications";

interface ApplicationTableProps {
	apps: Application[];
	sort: string | undefined;
	order: string | undefined;
	onSort: (field: string) => void;
}

function formatDate(value: number | string | null | undefined): string {
	if (!value) return "--";
	try {
		const d = typeof value === "number" ? new Date(value * 1000) : new Date(value);
		if (Number.isNaN(d.getTime())) return "--";
		return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	} catch {
		return "--";
	}
}

function capitalize(s: string | null): string {
	if (!s) return "--";
	return s.charAt(0).toUpperCase() + s.slice(1);
}

const COL_WIDTHS = {
	company: "25%",
	role: "22%",
	status: "12%",
	priority: "10%",
	source: "11%",
	applied: "11%",
	days: "9%",
};

export function ApplicationTable({
	apps,
	sort,
	order,
	onSort,
}: ApplicationTableProps) {
	return (
		<div className="glass overflow-hidden rounded-xl">
			<table className="w-full border-collapse">
				<colgroup>
					<col style={{ width: COL_WIDTHS.company }} />
					<col style={{ width: COL_WIDTHS.role }} />
					<col style={{ width: COL_WIDTHS.status }} />
					<col style={{ width: COL_WIDTHS.priority }} />
					<col style={{ width: COL_WIDTHS.source }} />
					<col style={{ width: COL_WIDTHS.applied }} />
					<col style={{ width: COL_WIDTHS.days }} />
				</colgroup>
				<thead>
					<tr className="border-b border-black/[0.06] dark:border-white/[0.06]">
						<SortableHeader label="Company" field="company" activeSort={sort} activeOrder={order} onSort={onSort} />
						<SortableHeader label="Role" field="role" activeSort={sort} activeOrder={order} onSort={onSort} />
						<SortableHeader label="Status" field="status" activeSort={sort} activeOrder={order} onSort={onSort} />
						<SortableHeader label="Priority" field="priority" activeSort={sort} activeOrder={order} onSort={onSort} />
						<SortableHeader label="Source" field="source" activeSort={sort} activeOrder={order} onSort={onSort} />
						<SortableHeader label="Applied" field="applied" activeSort={sort} activeOrder={order} onSort={onSort} />
						<SortableHeader label="Days" field="days" activeSort={sort} activeOrder={order} onSort={onSort} />
					</tr>
				</thead>
				<tbody>
					{apps.map((app) => {
						const days = getDaysSinceUpdate(app.appliedAt ?? app.createdAt);
						return (
							<tr key={app.id} className="border-b border-black/[0.03] last:border-b-0 dark:border-white/[0.03]">
								<td className="px-3 py-2.5">
									<Link to="/app/$slug" params={{ slug: app.slug }} className="flex items-center gap-2 hover:opacity-80">
										<CompanyBadge companyName={app.companyName} size="sm" />
										<span className="truncate text-[13px] font-medium text-text-primary dark:text-dark-accent">
											{app.companyName}
										</span>
									</Link>
								</td>
								<td className="px-3 py-2.5">
									<span className="truncate text-[13px] text-text-secondary dark:text-dark-accent/70">
										{app.roleTitle}
									</span>
								</td>
								<td className="px-3 py-2.5">
									<Badge variant="filled" color={app.status} size="sm">
										{STATUS_LABELS[app.status]}
									</Badge>
								</td>
								<td className="px-3 py-2.5">
									<span className="text-xs capitalize text-text-secondary dark:text-dark-accent/60">
										{app.priority}
									</span>
								</td>
								<td className="px-3 py-2.5">
									<span className="truncate text-xs text-text-secondary dark:text-dark-accent/60">
										{capitalize(app.source)}
									</span>
								</td>
								<td className="px-3 py-2.5">
									<span className="text-xs text-text-secondary dark:text-dark-accent/60">
										{formatDate(app.appliedAt)}
									</span>
								</td>
								<td className="px-3 py-2.5">
									<span className={`text-xs font-medium tabular-nums ${days >= 7 ? "text-red-500" : "text-text-muted dark:text-dark-accent/40"}`}>
										{days}d
									</span>
								</td>
							</tr>
						);
					})}
					{apps.length === 0 && (
						<tr>
							<td colSpan={7} className="px-3 py-8 text-center text-sm text-text-muted dark:text-dark-accent/40">
								No applications match your filters.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
