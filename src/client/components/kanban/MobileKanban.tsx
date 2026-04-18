import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import type { ApplicationStatus } from "@/shared/constants";
import type { Application } from "@/client/hooks/useApplications";
import { ColumnHeader } from "@/client/components/design-system/ColumnHeader";
import { Card } from "@/client/components/design-system/Card";
import { CompanyBadge } from "./CompanyBadge";
import { calculateUrgency, getDaysSinceUpdate, URGENCY_STYLES } from "@/client/lib/urgency";

/** Priority-ordered sections for mobile (D-19) */
const MOBILE_STATUS_ORDER: ApplicationStatus[] = [
	"interviewing",
	"offer",
	"applied",
	"screening",
	"wishlist",
	"accepted",
	"rejected",
	"withdrawn",
];

interface CollapsibleSectionProps {
	status: ApplicationStatus;
	apps: Application[];
	defaultOpen?: boolean;
}

/** Mobile card — no Draggable, just tap to navigate */
function MobileCard({ app }: { app: Application }) {
	const router = useRouter();
	const urgency = calculateUrgency(app);
	const urgencyClass = URGENCY_STYLES[urgency];
	const days = getDaysSinceUpdate(app.updatedAt);
	const isStale = urgency === "stale";

	return (
		<div
			onClick={() => router.navigate({ to: "/app/$slug", params: { slug: app.slug } })}
			className="cursor-pointer"
		>
			<Card hover padding="p-2.5" className={urgencyClass}>
				<div className="flex items-center gap-2">
					<CompanyBadge companyName={app.companyName} size="sm" />
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium text-text-primary dark:text-dark-accent">
							{app.companyName}
						</p>
						<p className="truncate text-xs text-text-secondary dark:text-dark-accent/60">
							{app.roleTitle}
						</p>
					</div>
					<span className={`shrink-0 text-xs ${isStale ? "font-bold text-status-rejected" : "text-text-muted dark:text-dark-accent/40"}`}>
						{days}d
					</span>
				</div>
			</Card>
		</div>
	);
}

function CollapsibleSection({
	status,
	apps,
	defaultOpen = false,
}: CollapsibleSectionProps) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div className="border-b border-black/[0.06] last:border-b-0 dark:border-white/[0.08]">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="flex w-full items-center justify-between px-4 py-3"
			>
				<ColumnHeader
					status={status}
					count={apps.length}
					variant="filled"
				/>
				<ChevronDown
					size={16}
					strokeWidth={1.8}
					className={`text-text-muted transition-transform dark:text-dark-accent/40 ${open ? "rotate-180" : ""}`}
				/>
			</button>
			{open && (
				<div className="space-y-2 px-4 pb-4">
					{apps.map((app) => (
						<MobileCard key={app.id} app={app} />
					))}
					{apps.length === 0 && (
						<p className="py-4 text-center text-sm text-text-muted dark:text-dark-accent/40">
							No applications
						</p>
					)}
				</div>
			)}
		</div>
	);
}

interface MobileKanbanProps {
	grouped: Map<ApplicationStatus, Application[]>;
}

export function MobileKanban({ grouped }: MobileKanbanProps) {
	// Find the first section that has apps for default open
	const firstWithApps = MOBILE_STATUS_ORDER.find(
		(s) => (grouped.get(s)?.length ?? 0) > 0,
	);

	return (
		<div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
			{MOBILE_STATUS_ORDER.map((status) => (
				<CollapsibleSection
					key={status}
					status={status}
					apps={grouped.get(status) ?? []}
					defaultOpen={status === firstWithApps}
				/>
			))}
		</div>
	);
}
