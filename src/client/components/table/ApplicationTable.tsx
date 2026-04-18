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

function formatDate(epoch: number | null): string {
	if (!epoch) return "--";
	const d = new Date(epoch * 1000);
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function capitalize(s: string | null): string {
	if (!s) return "--";
	return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ApplicationTable({
	apps,
	sort,
	order,
	onSort,
}: ApplicationTableProps) {
	return (
		<div className="glass rounded-[var(--radius-card)] overflow-hidden">
			<table className="w-full table-fixed">
				<thead>
					<tr className="border-b border-black/[0.06] dark:border-white/[0.06]">
						<SortableHeader
							label="Company"
							field="company"
							activeSort={sort}
							activeOrder={order}
							onSort={onSort}
						/>
						<SortableHeader
							label="Role"
							field="role"
							activeSort={sort}
							activeOrder={order}
							onSort={onSort}
						/>
						<SortableHeader
							label="Status"
							field="status"
							activeSort={sort}
							activeOrder={order}
							onSort={onSort}
						/>
						<SortableHeader
							label="Priority"
							field="priority"
							activeSort={sort}
							activeOrder={order}
							onSort={onSort}
						/>
						<SortableHeader
							label="Source"
							field="source"
							activeSort={sort}
							activeOrder={order}
							onSort={onSort}
						/>
						<SortableHeader
							label="Applied"
							field="applied"
							activeSort={sort}
							activeOrder={order}
							onSort={onSort}
						/>
						<SortableHeader
							label="Days"
							field="days"
							activeSort={sort}
							activeOrder={order}
							onSort={onSort}
						/>
					</tr>
				</thead>
				<tbody>
					{apps.map((app) => {
						const days = getDaysSinceUpdate(app.updatedAt);
						return (
							<tr key={app.id} className="group">
								<td colSpan={7} className="p-0">
									<Link
										to="/app/$slug"
										params={{ slug: app.slug }}
										className="flex w-full items-center transition-colors hover:bg-white/40 dark:hover:bg-white/[0.04]"
									>
										{/* Company */}
										<span className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5">
											<CompanyBadge
												companyName={app.companyName}
												size="sm"
											/>
											<span className="truncate text-[13px] font-medium text-text-primary dark:text-dark-accent">
												{app.companyName}
											</span>
										</span>
										{/* Role */}
										<span className="flex min-w-0 flex-1 items-center px-3 py-2.5">
											<span className="truncate text-[13px] text-text-secondary dark:text-dark-accent/70">
												{app.roleTitle}
											</span>
										</span>
										{/* Status */}
										<span className="flex w-[90px] shrink-0 items-center px-3 py-2.5">
											<Badge variant="filled" color={app.status} size="sm">
												{STATUS_LABELS[app.status]}
											</Badge>
										</span>
										{/* Priority */}
										<span className="flex w-[80px] shrink-0 items-center px-3 py-2.5">
											<Badge variant="outlined" color={app.priority === "high" ? "#ef4444" : app.priority === "medium" ? "#f59e0b" : "#6b7280"} size="sm">
												{capitalize(app.priority)}
											</Badge>
										</span>
										{/* Source */}
										<span className="flex w-[80px] shrink-0 items-center px-3 py-2.5">
											<span className="truncate text-xs text-text-secondary dark:text-dark-accent/60">
												{app.source ?? "--"}
											</span>
										</span>
										{/* Applied */}
										<span className="flex w-[90px] shrink-0 items-center px-3 py-2.5">
											<span className="text-xs text-text-secondary dark:text-dark-accent/60">
												{formatDate(app.appliedAt)}
											</span>
										</span>
										{/* Days */}
										<span className="flex w-[50px] shrink-0 items-center px-3 py-2.5">
											<span className={`text-xs font-medium ${days >= 7 ? "text-red-500" : "text-text-muted dark:text-dark-accent/40"}`}>
												{days}d
											</span>
										</span>
									</Link>
								</td>
							</tr>
						);
					})}
					{apps.length === 0 && (
						<tr>
							<td
								colSpan={7}
								className="px-3 py-8 text-center text-sm text-text-muted dark:text-dark-accent/40"
							>
								No applications match your filters.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
