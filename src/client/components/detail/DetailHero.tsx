import { useRouter } from "@tanstack/react-router";
import {
	ChevronLeft,
	Star,
	Archive,
	Globe,
	DollarSign,
	Clock,
	ChevronDown,
} from "lucide-react";
import { APPLICATION_STATUSES, PRIORITIES } from "@/shared/constants";
import type { ApplicationStatus } from "@/shared/constants";
import { STATUS_COLORS, STATUS_LABELS } from "@/client/lib/colors";
import {
	useUpdateStatus,
	useTogglePin,
	useToggleArchive,
	useUpdateApplication,
} from "@/client/hooks/useApplications";
import { CompanyBadge } from "@/client/components/kanban/CompanyBadge";
import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";

interface DetailHeroProps {
	app: ApplicationDetail;
}

function formatSalary(
	min: number | null,
	max: number | null,
	currency: string,
): string | null {
	if (!min && !max) return null;
	const fmt = (n: number) =>
		n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
	if (min && max) return `$${fmt(min)}–${fmt(max)} ${currency}`;
	if (min) return `$${fmt(min)}+ ${currency}`;
	return `$${fmt(max!)} ${currency}`;
}

function formatLocation(
	type: string | null,
	city: string | null,
): string | null {
	if (!type) return null;
	const label = type.charAt(0).toUpperCase() + type.slice(1);
	return city ? `${label} · ${city}` : label;
}

function daysSince(value: number | string | null | undefined): number {
	if (!value) return 0;
	const epochSec =
		typeof value === "number"
			? value
			: Math.floor(new Date(value).getTime() / 1000);
	if (Number.isNaN(epochSec)) return 0;
	return Math.max(0, Math.floor((Date.now() / 1000 - epochSec) / 86400));
}

/** Pipeline stages for the progress bar */
const PIPELINE_STAGES: ApplicationStatus[] = [
	"wishlist",
	"applied",
	"screening",
	"interviewing",
	"offer",
];

export function DetailHero({ app }: DetailHeroProps) {
	const router = useRouter();
	const updateStatus = useUpdateStatus();
	const togglePin = useTogglePin();
	const toggleArchive = useToggleArchive();
	const updateApplication = useUpdateApplication();

	const salaryLabel = formatSalary(app.salaryMin, app.salaryMax, app.salaryCurrency);
	const locationLabel = formatLocation(app.locationType, app.locationCity);
	const days = daysSince(app.appliedAt ?? app.createdAt);
	const currentStageIdx = PIPELINE_STAGES.indexOf(app.status as ApplicationStatus);

	return (
		<div className="border-b border-black/[0.06] dark:border-white/[0.06]">
			{/* Top bar: back button */}
			<div className="flex items-center px-6 py-2">
				<button
					type="button"
					onClick={() => router.history.back()}
					className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors dark:text-dark-accent/60 dark:hover:text-dark-accent"
				>
					<ChevronLeft size={18} strokeWidth={1.8} />
					Back
				</button>
			</div>

			{/* Hero card */}
			<div className="mx-6 mb-4 rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 dark:bg-zinc-800/50 dark:border-white/10 px-6 py-5">
				<div className="flex items-start gap-5">
					{/* Large company badge */}
					<div
						className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl text-[26px] font-extrabold text-white"
						style={{ background: "linear-gradient(145deg, #1a1717, #292524)" }}
					>
						{app.companyName.charAt(0).toUpperCase()}
					</div>

					{/* Company + role + chips */}
					<div className="min-w-0 flex-1">
						<h1 className="text-[28px] font-extrabold leading-none tracking-tight text-text-primary dark:text-dark-accent">
							{app.companyName}
						</h1>
						<p className="mt-1.5 text-base font-medium text-text-secondary dark:text-dark-accent/60">
							{app.roleTitle}
						</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{locationLabel && (
								<span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.05] bg-white/55 px-2.5 py-1 text-[11px] font-medium text-text-secondary dark:border-white/10 dark:bg-white/[0.06] dark:text-dark-accent/60">
									<Globe size={12} strokeWidth={1.8} />
									{locationLabel}
								</span>
							)}
							{salaryLabel && (
								<span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.05] bg-white/55 px-2.5 py-1 text-[11px] font-medium text-text-secondary dark:border-white/10 dark:bg-white/[0.06] dark:text-dark-accent/60">
									<DollarSign size={12} strokeWidth={1.8} />
									{salaryLabel}
								</span>
							)}
							<span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.05] bg-white/55 px-2.5 py-1 text-[11px] font-medium text-text-secondary dark:border-white/10 dark:bg-white/[0.06] dark:text-dark-accent/60">
								<Clock size={12} strokeWidth={1.8} />
								Applied {days}d ago
							</span>
						</div>
					</div>

					{/* Right: actions */}
					<div className="flex items-center gap-2 shrink-0">
						{/* Star toggle */}
						<button
							type="button"
							onClick={() => togglePin.mutate({ id: app.id })}
							className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg border transition-colors ${
								app.isPinned
									? "border-amber-300/30 bg-amber-50 text-amber-500 dark:border-amber-500/20 dark:bg-amber-500/10"
									: "border-black/[0.08] bg-white/50 text-text-muted hover:bg-white/70 dark:border-white/10 dark:bg-white/[0.06]"
							}`}
							title={app.isPinned ? "Unstar" : "Star"}
						>
							<Star size={14} strokeWidth={1.8} fill={app.isPinned ? "currentColor" : "none"} />
						</button>
						{/* Archive toggle */}
						<button
							type="button"
							onClick={() => toggleArchive.mutate({ id: app.id })}
							className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-black/[0.08] bg-white/50 text-text-muted hover:bg-white/70 transition-colors dark:border-white/10 dark:bg-white/[0.06]"
							title={app.isArchived ? "Unarchive" : "Archive"}
						>
							<Archive size={14} strokeWidth={1.8} />
						</button>
						{/* Status dropdown */}
						<div className="relative inline-flex items-center gap-2 rounded-lg border border-black/[0.08] bg-white/60 px-2.5 py-1.5 text-xs font-semibold dark:border-white/10 dark:bg-white/[0.06]">
							<span
								className="h-[7px] w-[7px] rounded-full"
								style={{ backgroundColor: STATUS_COLORS[app.status as ApplicationStatus] ?? "#6b7280" }}
							/>
							<select
								value={app.status}
								onChange={(e) => updateStatus.mutate({ id: app.id, status: e.target.value as ApplicationStatus })}
								className="appearance-none bg-transparent pr-4 text-text-primary focus:outline-none cursor-pointer dark:text-dark-accent"
							>
								{APPLICATION_STATUSES.map((s) => (
									<option key={s} value={s}>{STATUS_LABELS[s]}</option>
								))}
							</select>
							<ChevronDown size={12} className="pointer-events-none absolute right-2 text-text-muted" />
						</div>
						{/* Priority dropdown */}
						<div className="relative inline-flex items-center gap-2 rounded-lg border border-black/[0.08] bg-white/60 px-2.5 py-1.5 text-xs font-semibold dark:border-white/10 dark:bg-white/[0.06]">
							<span style={{ color: app.priority === "high" ? "#ef4444" : app.priority === "medium" ? "#f59e0b" : "#a8a29e" }}>●</span>
							<select
								value={app.priority}
								onChange={(e) => updateApplication.mutate({ id: app.id, slug: app.slug, priority: e.target.value })}
								className="appearance-none bg-transparent pr-4 text-text-primary focus:outline-none cursor-pointer dark:text-dark-accent"
							>
								{PRIORITIES.map((p) => (
									<option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
								))}
							</select>
							<ChevronDown size={12} className="pointer-events-none absolute right-2 text-text-muted" />
						</div>
					</div>
				</div>
			</div>

			{/* Pipeline progress bar */}
			<div className="mx-6 mb-4 flex items-center gap-3 rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 px-4 py-2.5 dark:bg-zinc-800/50 dark:border-white/10">
				<span className="text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40">
					Pipeline
				</span>
				<div className="flex flex-1 items-center">
					{PIPELINE_STAGES.map((stage, i) => {
						const isCurrent = stage === app.status;
						const isDone = currentStageIdx >= 0 && i < currentStageIdx;
						const stageColor = STATUS_COLORS[stage];
						return (
							<div key={stage} className="flex items-center">
								{i > 0 && (
									<div className={`mx-1 h-px w-6 ${isDone || isCurrent ? "bg-text-muted/30" : "bg-black/[0.06]"} dark:bg-white/[0.08]`} />
								)}
								<div className="flex items-center gap-1.5">
									<span
										className={`inline-block h-[7px] w-[7px] rounded-full ${isCurrent ? "ring-[3px]" : ""}`}
										style={{
											backgroundColor: isDone || isCurrent ? stageColor : "#d6d3d1",
											boxShadow: isCurrent ? `0 0 0 3px ${stageColor}25` : undefined,
										}}
									/>
									<span
										className={`text-[10px] font-semibold uppercase tracking-wide ${
											isCurrent
												? "text-text-primary dark:text-dark-accent"
												: isDone
													? "text-text-secondary dark:text-dark-accent/60"
													: "text-text-muted/60 dark:text-dark-accent/30"
										}`}
										style={isCurrent ? { color: stageColor } : undefined}
									>
										{STATUS_LABELS[stage]}
									</span>
								</div>
							</div>
						);
					})}
				</div>
				<button
					type="button"
					className="ml-auto shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-amber-600 transition-colors"
					onClick={() => {
						if (currentStageIdx >= 0 && currentStageIdx < PIPELINE_STAGES.length - 1) {
							updateStatus.mutate({ id: app.id, status: PIPELINE_STAGES[currentStageIdx + 1] });
						}
					}}
				>
					Advance →
				</button>
			</div>
		</div>
	);
}
