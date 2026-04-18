import { useState, useCallback } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import { useUpdateApplication } from "@/client/hooks/useApplications";
import { useDebouncedMutate } from "@/client/hooks/useDebouncedMutate";
import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";
import { TagPicker } from "./TagPicker";
import { DeadlineSection } from "./DeadlineSection";
import { CompanyResearchCard } from "./CompanyResearchCard";
import { SalaryCard } from "./SalaryCard";

interface OverviewTabProps {
	app: ApplicationDetail;
}

function formatDate(value: number | string | null | undefined): string {
	if (!value) return "\u2014";
	try {
		const d = typeof value === "number" ? new Date(value * 1000) : new Date(value);
		if (Number.isNaN(d.getTime())) return "\u2014";
		return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	} catch { return "\u2014"; }
}

function formatSalary(min: number | null, max: number | null, currency: string): string {
	if (!min && !max) return "\u2014";
	const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;
	if (min && max) return `${fmt(min)} \u2013 ${fmt(max)} ${currency}`;
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

/** A single key-value item in the "At a glance" section */
function KV({ label, value, mono, link }: { label: string; value: string; mono?: boolean; link?: string }) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40" style={{ fontFamily: "var(--mono, monospace)" }}>
				{label}
			</span>
			{link ? (
				<a href={fullUrl(link)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[15px] font-semibold text-amber-600 hover:underline dark:text-amber-400" style={mono ? { fontFamily: "var(--mono, monospace)", fontSize: "14px" } : undefined}>
					{value} <ExternalLink size={11} />
				</a>
			) : (
				<span className={`text-[15px] font-semibold text-text-primary dark:text-dark-accent`} style={mono ? { fontFamily: "var(--mono, monospace)", fontSize: "14px" } : undefined}>
					{value}
				</span>
			)}
		</div>
	);
}

export function OverviewTab({ app }: OverviewTabProps) {
	const updateApplication = useUpdateApplication();
	const [notes, setNotes] = useState(app.notes || "");
	const [editing, setEditing] = useState(false);

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

	const salaryLabel = formatSalary(app.salaryMin, app.salaryMax, app.salaryCurrency);
	const location = app.locationType
		? `${app.locationType.charAt(0).toUpperCase() + app.locationType.slice(1)}${app.locationCity ? ` \u00b7 ${app.locationCity}` : ""}`
		: "\u2014";

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

				{/* 2. At a glance -- KV grid with flex row layout */}
				<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
					<div className="mb-4 flex items-center gap-2">
						<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
							<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
							At a glance
						</span>
						<button
							type="button"
							onClick={() => setEditing(!editing)}
							className="ml-auto text-text-muted hover:text-text-secondary transition-colors dark:text-dark-accent/40"
							title="Edit details"
						>
							<Pencil size={13} />
						</button>
					</div>
					<div className="flex flex-wrap gap-x-8 gap-y-4">
						<KV label="Location" value={location} />
						<KV label="Salary range" value={salaryLabel} mono />
						<KV label="Source" value={app.source ? app.source.charAt(0).toUpperCase() + app.source.slice(1) : "\u2014"} />
						<KV label="Applied" value={formatDate(app.appliedAt)} mono />
						<KV label="Time in stage" value={`${Math.max(0, Math.floor((Date.now() / 1000 - (typeof app.updatedAt === "number" ? app.updatedAt : new Date(app.updatedAt).getTime() / 1000)) / 86400))} days`} />
						{app.jobPostingUrl ? (
							<KV label="Job posting" value={hostname(app.jobPostingUrl) ?? "View"} mono link={app.jobPostingUrl} />
						) : (
							<KV label="Job posting" value="\u2014" />
						)}
					</div>
					{app.applicationPortalUrl && (
						<div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
							<KV label="Application portal" value={hostname(app.applicationPortalUrl) ?? "Open"} mono link={app.applicationPortalUrl} />
						</div>
					)}
				</div>

				{/* 3. Deadlines */}
				<DeadlineSection applicationId={app.id} />

				{/* 3b. Salary / Compensation */}
				<SalaryCard app={app} />

				{/* 4. About the role */}
				<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
					<div className="mb-3 flex items-center gap-2">
						<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
						<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">About the role</span>
					</div>
					<p className="text-[13px] leading-relaxed text-text-secondary dark:text-dark-accent/60 mb-3">
						Review the full job description in the JD tab for complete details.
					</p>
					<ul className="space-y-1.5 text-[12.5px] text-text-secondary dark:text-dark-accent/60">
						<li className="flex items-start gap-2">
							<span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
							Design and implement scalable systems
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
							Collaborate with cross-functional teams
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
							Ship high-quality, well-tested code
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
							Mentor junior engineers and drive technical direction
						</li>
					</ul>
				</div>

				{/* 5. Notes -- editable */}
				<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
					<div className="mb-3 flex items-center gap-2">
						<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
							<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
							Notes
						</span>
						{updateApplication.isPending && (
							<span className="text-[10px] text-text-muted dark:text-dark-accent/40">Saving...</span>
						)}
						{!updateApplication.isPending && notes && (
							<span className="text-[10px] text-green-600 dark:text-green-400">Saved</span>
						)}
					</div>
					<textarea
						value={notes}
						onChange={(e) => handleNotes(e.target.value)}
						placeholder="Add notes -- prep tips, key contacts, follow-up reminders..."
						className="w-full min-h-[120px] rounded-lg border border-dashed border-black/[0.12] bg-transparent p-3 text-[14px] leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:border-amber-400 focus:outline-none resize-y dark:border-white/[0.1] dark:text-dark-accent dark:placeholder:text-dark-accent/30"
						style={{ fontFamily: "inherit" }}
					/>
					<div className="mt-1.5 text-[9px] text-text-muted dark:text-dark-accent/30" style={{ fontFamily: "var(--mono, monospace)" }}>
						**bold** * *italic* * - lists * `code` -- markdown supported
					</div>
				</div>
			</div>

			{/* Right sidebar */}
			<div className="flex flex-col gap-4">

				{/* Sticky note style */}
				<div
					className="rounded-[10px] p-4 text-[13.5px] font-semibold leading-snug shadow-sm cursor-text"
					style={{
						background: "linear-gradient(145deg, #fef3c7, #fde68a)",
						border: "1px solid rgba(245,158,11,0.25)",
						transform: "rotate(-0.6deg)",
						boxShadow: "0 2px 8px rgba(245,158,11,0.15)",
					}}
				>
					{notes ? (
						<span className="text-text-primary">{notes.slice(0, 120)}{notes.length > 120 ? "\u2026" : ""}</span>
					) : (
						<span className="text-amber-700/60 italic">Quick note -- click to edit above</span>
					)}
					<div className="mt-2.5 text-[9px] font-bold uppercase tracking-widest text-amber-700/60" style={{ fontFamily: "var(--mono, monospace)" }}>
						Click to expand
					</div>
				</div>

				{/* Tags */}
				<TagPicker applicationId={app.id} />

				{/* Company Research */}
				<CompanyResearchCard companyName={app.companyName} />
			</div>
		</div>
	);
}
