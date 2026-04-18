import { Link } from "@tanstack/react-router";
import { Card } from "@/client/components/design-system/Card";
import { CompanyBadge } from "@/client/components/kanban/CompanyBadge";
import { Badge } from "@/client/components/design-system/Badge";
import { STATUS_LABELS } from "@/client/lib/colors";
import { getDaysSinceUpdate } from "@/client/lib/urgency";
import type { Application } from "@/client/hooks/useApplications";

interface MobileCardListProps {
	apps: Application[];
}

export function MobileCardList({ apps }: MobileCardListProps) {
	if (apps.length === 0) {
		return (
			<div className="px-4 py-8 text-center text-sm text-text-muted dark:text-dark-accent/40">
				No applications match your filters.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{apps.map((app) => {
				const days = getDaysSinceUpdate(app.updatedAt);
				return (
					<Link
						key={app.id}
						to="/app/$slug"
						params={{ slug: app.slug }}
					>
						<Card hover className="flex items-center gap-3">
							<CompanyBadge companyName={app.companyName} size="lg" />
							<div className="min-w-0 flex-1">
								<div className="truncate text-[14px] font-medium text-text-primary dark:text-dark-accent">
									{app.companyName}
								</div>
								<div className="truncate text-xs text-text-secondary dark:text-dark-accent/60">
									{app.roleTitle}
								</div>
							</div>
							<div className="flex shrink-0 flex-col items-end gap-1">
								<Badge variant="filled" color={app.status} size="sm">
									{STATUS_LABELS[app.status]}
								</Badge>
								<span className={`text-[10px] font-medium ${days >= 7 ? "text-red-500" : "text-text-muted dark:text-dark-accent/40"}`}>
									{days}d
								</span>
							</div>
						</Card>
					</Link>
				);
			})}
		</div>
	);
}
