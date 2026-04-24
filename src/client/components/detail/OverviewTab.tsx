import { useCallback, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import Markdown from "react-markdown";
import { useUpdateApplication } from "@/client/hooks/useApplications";
import { useDebouncedMutate } from "@/client/hooks/useDebouncedMutate";
import { MarkdownField } from "@/client/components/design-system/MarkdownField";
import { StickyNote } from "@/client/components/design-system/StickyNote";
import { SectionHeader } from "@/client/components/design-system/SectionHeader";
import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";
import { TagPicker } from "./TagPicker";
import { DeadlineSection } from "./DeadlineSection";
import { CompanyResearchCard } from "./CompanyResearchCard";
import { SalaryCard } from "./SalaryCard";

interface OverviewTabProps {
	app: ApplicationDetail;
}

function formatDate(value: number | string | null | undefined): string {
	if (!value) return "—";
	try {
		const d = typeof value === "number" ? new Date(value * 1000) : new Date(value);
		if (Number.isNaN(d.getTime())) return "—";
		return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	} catch { return "—"; }
}

function formatSalary(min: number | null, max: number | null, currency: string): string {
	if (!min && !max) return "—";
	const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;
	if (min && max) return `${fmt(min)} – ${fmt(max)} ${currency}`;
	if (min) return `${fmt(min)}+ ${currency}`;
	return `${fmt(max!)} ${currency}`;
}

function hostname(url: string | null): string | null {
	if (!url) return null;
	try { return new URL(url.startsWith("http") ? url : `https://${url}`).hostname; }
	catch { return url; }
}

function fullUrl(url: string): string {
	return url.startsWith("http") ? url : `https://${url}`;
}

/**
 * Key-value row in the "At a glance" section. All values use the same sans
 * typography so Location / Salary / Source / Applied / Time / Job posting
 * read as a cohesive grid rather than a mix of mono and sans.
 */
function KV({ label, value, link }: { label: string; value: string; link?: string }) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40">
				{label}
			</span>
			{link ? (
				<a
					href={fullUrl(link)}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1 text-[15px] font-semibold text-amber-600 hover:underline dark:text-amber-400"
				>
					{value} <ExternalLink size={11} />
				</a>
			) : (
				<span className="text-[15px] font-semibold text-text-primary dark:text-dark-accent">
					{value}
				</span>
			)}
		</div>
	);
}

export function OverviewTab({ app }: OverviewTabProps) {
	const updateApplication = useUpdateApplication();
	const [notes, setNotes] = useState(app.notes || "");
	const notesSectionRef = useRef<HTMLDivElement | null>(null);

	const doMutate = useCallback(
		(fields: Record<string, unknown>) => {
			updateApplication.mutate({ id: app.id, slug: app.slug, ...fields });
		},
		[updateApplication, app.id, app.slug],
	);
	const debouncedMutate = useDebouncedMutate(doMutate);

	const handleNotes = (val: string) => {
		setNotes(val);
		debouncedMutate({ notes: val || null });
	};

	const scrollToNotes = () => {
		notesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
		const textarea = notesSectionRef.current?.querySelector("textarea");
		// If the markdown field is in preview mode, the textarea won't exist —
		// in that case the scroll + edit-toggle is handled by the user's click
		// on Edit inside the section. Keep scroll-only as a minimum affordance.
		textarea?.focus();
	};

	const salaryLabel = formatSalary(app.salaryMin, app.salaryMax, app.salaryCurrency);
	const location = app.locationType
		? `${app.locationType.charAt(0).toUpperCase() + app.locationType.slice(1)}${app.locationCity ? ` · ${app.locationCity}` : ""}`
		: "—";
	const sourceLabel = app.source
		? app.source.charAt(0).toUpperCase() + app.source.slice(1)
		: "—";
	const timeInStageDays = Math.max(
		0,
		Math.floor(
			(Date.now() / 1000 -
				(typeof app.updatedAt === "number"
					? app.updatedAt
					: new Date(app.updatedAt).getTime() / 1000)) /
				86400,
		),
	);

	return (
		<div className="grid gap-5 md:grid-cols-[1fr_300px]">
			{/* Main column */}
			<div className="flex flex-col gap-4">

				{/* 1. Reminder bar (only if status is interviewing or offer) */}
				{(app.status === "interviewing" || app.status === "offer") && (
					<div className="flex items-center gap-2 rounded-xl bg-amber-50/80 border border-amber-200/40 px-4 py-2.5 dark:bg-amber-500/10 dark:border-amber-500/20">
						<span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Next</span>
						<span className="text-[12.5px] text-text-secondary dark:text-dark-accent/60">Follow up or check for updates</span>
					</div>
				)}

				{/* 2. At a glance -- unified KV grid */}
				<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
					<SectionHeader title="At a glance" className="mb-4" />
					<div className="flex flex-wrap gap-x-8 gap-y-4">
						<KV label="Location" value={location} />
						<KV label="Salary range" value={salaryLabel} />
						<KV label="Source" value={sourceLabel} />
						<KV label="Applied" value={formatDate(app.appliedAt)} />
						<KV label="Time in stage" value={`${timeInStageDays} days`} />
						{app.jobPostingUrl ? (
							<KV label="Job posting" value={hostname(app.jobPostingUrl) ?? "View"} link={app.jobPostingUrl} />
						) : (
							<KV label="Job posting" value="—" />
						)}
					</div>
					{app.applicationPortalUrl && (
						<div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
							<KV label="Application portal" value={hostname(app.applicationPortalUrl) ?? "Open"} link={app.applicationPortalUrl} />
						</div>
					)}
				</div>

				{/* 3. Deadlines */}
				<DeadlineSection applicationId={app.id} />

				{/* 3b. Salary / Compensation */}
				<SalaryCard app={app} />

				{/* 5. Notes -- markdown edit/preview */}
				<div
					ref={notesSectionRef}
					className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10"
				>
					<SectionHeader
						title="Notes"
						caption={
							updateApplication.isPending
								? "Saving…"
								: notes
									? "Saved"
									: undefined
						}
						className="mb-3"
					/>
					<MarkdownField
						value={notes}
						onChange={handleNotes}
						placeholder="Add notes — prep tips, key contacts, follow-up reminders…"
						minHeight="140px"
						emptyLabel="Click to add notes"
					/>
				</div>
			</div>

			{/* Right sidebar */}
			<div className="flex flex-col gap-4">

				{/* Sticky note — click to scroll + focus Notes section below */}
				<StickyNote onClick={scrollToNotes} hint="Open notes ↓">
					{notes ? (
						<div className="jd-markdown prose prose-sm max-w-none text-[#292524] [&_*]:!text-[#292524] [&_p]:!mb-1 [&_a]:!text-amber-800">
							<Markdown>
								{notes.slice(0, 160) + (notes.length > 160 ? "…" : "")}
							</Markdown>
						</div>
					) : (
						<span className="italic text-amber-700/70">
							Quick note — click to jump to notes
						</span>
					)}
				</StickyNote>

				{/* Tags */}
				<TagPicker applicationId={app.id} />

				{/* Company Research */}
				<CompanyResearchCard companyName={app.companyName} />
			</div>
		</div>
	);
}
