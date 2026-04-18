import { useState, useCallback } from "react";
import { useCompanyForApplication, useUpdateCompany } from "@/client/hooks/useCompany";
import { useDebouncedMutate } from "@/client/hooks/useDebouncedMutate";
import { SaveIndicator } from "./SaveIndicator";

interface CompanyResearchCardProps {
	companyName: string;
}

export function CompanyResearchCard({ companyName }: CompanyResearchCardProps) {
	const { data: company, isLoading, isError } = useCompanyForApplication(companyName);
	const updateCompany = useUpdateCompany();

	const [notes, setNotes] = useState("");
	const [initialized, setInitialized] = useState(false);
	const [dirty, setDirty] = useState(false);

	// Sync local state when company data loads
	if (company && !initialized) {
		setNotes(company.notes ?? "");
		setInitialized(true);
	}

	const doMutate = useCallback(
		(fields: Record<string, unknown>) => {
			if (!company) return;
			updateCompany.mutate({ companyId: company.id, ...fields }, {
				onSuccess: () => setDirty(false),
			});
		},
		[updateCompany, company],
	);
	const debouncedMutate = useDebouncedMutate(doMutate);

	const handleNotes = (val: string) => {
		setNotes(val);
		setDirty(true);
		debouncedMutate({ notes: val || null });
	};

	if (isLoading) {
		return (
			<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
				<div className="mb-3 flex items-center gap-2">
					<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
					<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Company Research</span>
				</div>
				<p className="text-[12px] text-text-muted dark:text-dark-accent/40 animate-pulse">Loading company data...</p>
			</div>
		);
	}

	if (isError || !company) {
		return (
			<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
				<div className="mb-3 flex items-center gap-2">
					<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
					<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Company Research</span>
				</div>
				<p className="text-[12px] text-text-muted dark:text-dark-accent/40">Could not load company data</p>
			</div>
		);
	}

	return (
		<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
			{/* Header */}
			<div className="mb-3 flex items-center gap-2">
				<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
				<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Company Research</span>
				{(dirty || updateCompany.isPending) && (
					<SaveIndicator isPending={updateCompany.isPending} hasUnsaved={dirty} />
				)}
			</div>

			{/* Company name + domain */}
			<p className="text-[14px] font-semibold text-text-primary dark:text-dark-accent">
				{company.name}
			</p>
			{company.domain && (
				<p className="text-[11px] text-amber-600 dark:text-amber-400">{company.domain}</p>
			)}

			{/* Shared notes hint */}
			<p className="mt-2 text-[10px] text-text-muted dark:text-dark-accent/30">
				Research notes for {company.name} -- shared across all applications to this company
			</p>

			{/* Markdown notes textarea */}
			<textarea
				value={notes}
				onChange={(e) => handleNotes(e.target.value)}
				placeholder="Add research notes -- Glassdoor reviews, tech stack, culture, interview tips..."
				className="mt-2.5 w-full min-h-[100px] rounded-lg border border-dashed border-black/[0.12] bg-transparent p-3 text-[14px] leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:border-amber-400 focus:outline-none resize-y dark:border-white/[0.1] dark:text-dark-accent dark:placeholder:text-dark-accent/30"
				style={{ fontFamily: "inherit" }}
			/>
			<div className="mt-1.5 text-[9px] text-text-muted dark:text-dark-accent/30" style={{ fontFamily: "var(--mono, monospace)" }}>
				**bold** *italic* - lists `code` -- markdown supported
			</div>
		</div>
	);
}
