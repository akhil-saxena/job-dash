import { useRouter } from "@tanstack/react-router";
import {
	ChevronLeft,
	Star,
	Archive,
	MapPin,
	DollarSign,
	Clock,
} from "lucide-react";
import { Button } from "@/client/components/design-system/Button";
import { CompanyBadge } from "@/client/components/kanban/CompanyBadge";
import {
	useUpdateStatus,
	useTogglePin,
	useToggleArchive,
	useUpdateApplication,
} from "@/client/hooks/useApplications";
import { STATUS_LABELS, STATUS_COLORS } from "@/client/lib/colors";
import {
	APPLICATION_STATUSES,
	PRIORITIES,
	type ApplicationStatus,
} from "@/shared/constants";
import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";

interface DetailHeroProps {
	app: ApplicationDetail;
}

function formatSalary(
	min: number | null,
	max: number | null,
	currency: string,
): string {
	const fmt = (n: number) => {
		if (n >= 1000) return `${Math.round(n / 1000)}K`;
		return String(n);
	};
	if (min && max) return `$${fmt(min)}-${fmt(max)} ${currency}`;
	if (max) return `$${fmt(max)} ${currency}`;
	if (min) return `$${fmt(min)}+ ${currency}`;
	return "";
}

function formatLocation(
	locationType: string | null,
	locationCity: string | null,
): string {
	const typeLabel = locationType
		? locationType.charAt(0).toUpperCase() + locationType.slice(1)
		: "";
	if (typeLabel && locationCity) return `${typeLabel} - ${locationCity}`;
	if (typeLabel) return typeLabel;
	if (locationCity) return locationCity;
	return "";
}

function daysSince(value: number | string | null | undefined): number {
	if (!value) return 0;
	const epochSec = typeof value === "number" ? value : Math.floor(new Date(value).getTime() / 1000);
	if (Number.isNaN(epochSec)) return 0;
	return Math.max(0, Math.floor((Date.now() / 1000 - epochSec) / 86400));
}

export function DetailHero({ app }: DetailHeroProps) {
	const router = useRouter();
	const updateStatus = useUpdateStatus();
	const togglePin = useTogglePin();
	const toggleArchive = useToggleArchive();
	const updateApplication = useUpdateApplication();

	const salaryLabel = formatSalary(
		app.salaryMin,
		app.salaryMax,
		app.salaryCurrency,
	);
	const locationLabel = formatLocation(app.locationType, app.locationCity);
	const days = daysSince(app.createdAt);

	const pillClasses =
		"inline-flex items-center gap-1 text-xs text-text-secondary dark:text-dark-accent/60 bg-black/[0.03] dark:bg-white/[0.05] px-2 py-1 rounded-[var(--radius-pill)]";
	const selectClasses =
		"bg-transparent border border-black/10 dark:border-white/10 rounded-[var(--radius-btn)] px-2 py-1 text-sm text-text-primary dark:text-dark-accent focus:outline-none focus:ring-2 focus:ring-surface-accent/20 cursor-pointer";

	return (
		<div className="sticky top-0 z-10 glass border-b border-white/30 dark:border-white/10 px-6 py-4">
			{/* Top row: back button left, pin + archive right */}
			<div className="flex items-center justify-between mb-3">
				<button
					type="button"
					onClick={() => router.history.back()}
					className="inline-flex items-center gap-1 text-sm text-text-secondary dark:text-dark-accent/60 hover:text-text-primary dark:hover:text-dark-accent transition-colors"
				>
					<ChevronLeft size={20} strokeWidth={1.8} />
					Back
				</button>
				<div className="flex items-center gap-2">
					{/* Pin star toggle */}
					<button
						type="button"
						onClick={() => togglePin.mutate({ id: app.id })}
						className="p-1 rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
						title={app.isPinned ? "Unpin" : "Pin"}
					>
						{app.isPinned ? (
							<Star
								size={18}
								strokeWidth={1.8}
								fill="currentColor"
								className="text-amber-500"
							/>
						) : (
							<Star
								size={18}
								strokeWidth={1.8}
								className="text-text-muted dark:text-dark-accent/50"
							/>
						)}
					</button>
					{/* Archive button */}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => toggleArchive.mutate({ id: app.id })}
					>
						<Archive size={14} strokeWidth={1.8} className="mr-1" />
						{app.isArchived ? "Unarchive" : "Archive"}
					</Button>
				</div>
			</div>

			{/* Main row: company info left, dropdowns right */}
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-3">
					<CompanyBadge companyName={app.companyName} size="lg" />
					<div>
						<h1 className="text-[22px] font-semibold text-text-primary dark:text-dark-accent">
							{app.companyName}
						</h1>
						<p className="text-sm text-text-secondary dark:text-dark-accent/60">
							{app.roleTitle}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{/* Status dropdown */}
					<div className="relative">
						<span
							className="absolute left-2 top-1/2 -translate-y-1/2 inline-block h-2 w-2 rounded-full"
							style={{
								backgroundColor:
									STATUS_COLORS[app.status as ApplicationStatus] ?? "#6b7280",
							}}
						/>
						<select
							value={app.status}
							onChange={(e) =>
								updateStatus.mutate({
									id: app.id,
									status: e.target.value as ApplicationStatus,
								})
							}
							className={`${selectClasses} pl-6`}
						>
							{APPLICATION_STATUSES.map((s) => (
								<option key={s} value={s}>
									{STATUS_LABELS[s]}
								</option>
							))}
						</select>
					</div>
					{/* Priority dropdown */}
					<select
						value={app.priority}
						onChange={(e) =>
							updateApplication.mutate({
								id: app.id,
								slug: app.slug,
								priority: e.target.value,
							})
						}
						className={selectClasses}
					>
						{PRIORITIES.map((p) => (
							<option key={p} value={p}>
								{p.charAt(0).toUpperCase() + p.slice(1)}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Info pills row */}
			<div className="flex items-center gap-3 mt-3">
				{locationLabel && (
					<span className={pillClasses}>
						<MapPin size={12} strokeWidth={1.8} />
						{locationLabel}
					</span>
				)}
				{salaryLabel && (
					<span className={pillClasses}>
						<DollarSign size={12} strokeWidth={1.8} />
						{salaryLabel}
					</span>
				)}
				<span className={pillClasses}>
					<Clock size={12} strokeWidth={1.8} />
					{days}d
				</span>
			</div>
		</div>
	);
}
