import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ApplicationStatus } from "@/shared/constants";
import type { Application } from "@/client/hooks/useApplications";
import { ColumnHeader } from "@/client/components/design-system/ColumnHeader";
import { KanbanCard } from "./KanbanCard";

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
						<KanbanCard key={app.id} app={app} />
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
