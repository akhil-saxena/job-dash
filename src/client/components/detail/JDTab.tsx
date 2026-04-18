import { useState, useCallback } from "react";
import { Pencil, Eye, ExternalLink, Save, X } from "lucide-react";
import Markdown from "react-markdown";
import { useUpdateApplication } from "@/client/hooks/useApplications";
import { useDebouncedMutate } from "@/client/hooks/useDebouncedMutate";
import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";

interface JDTabProps {
	app: ApplicationDetail;
}

export function JDTab({ app }: JDTabProps) {
	const [editing, setEditing] = useState(false);
	const [jdText, setJdText] = useState(app.jdText || "");
	const updateApplication = useUpdateApplication();

	const doMutate = useCallback(
		(fields: Record<string, unknown>) => {
			updateApplication.mutate({ id: app.id, slug: app.slug, ...fields });
		},
		[updateApplication, app.id, app.slug],
	);

	const handleSave = () => {
		doMutate({ jdText: jdText || null });
		setEditing(false);
	};

	const handleCancel = () => {
		setJdText(app.jdText || "");
		setEditing(false);
	};

	const hasJD = !!(jdText && jdText.trim());

	return (
		<div className="flex flex-col gap-4">
			{/* Header card with actions */}
			<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
						<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">
							Job description
						</span>
						{updateApplication.isPending && (
							<span className="text-[10px] text-text-muted dark:text-dark-accent/40">Saving...</span>
						)}
						{!updateApplication.isPending && hasJD && !editing && (
							<span className="text-[10px] text-green-600 dark:text-green-400">Saved</span>
						)}
					</div>
					<div className="flex items-center gap-2">
						{app.jobPostingUrl && (
							<a
								href={app.jobPostingUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
							>
								Open posting <ExternalLink size={10} />
							</a>
						)}
						{editing ? (
							<>
								<button
									type="button"
									onClick={handleCancel}
									className="inline-flex items-center gap-1 rounded-lg bg-black/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-text-muted hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-dark-accent/40 dark:hover:bg-white/[0.1]"
								>
									<X size={12} />
									Cancel
								</button>
								<button
									type="button"
									onClick={handleSave}
									className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-amber-600 transition-colors"
								>
									<Save size={12} />
									Save
								</button>
							</>
						) : (
							<button
								type="button"
								onClick={() => setEditing(true)}
								className="inline-flex items-center gap-1 rounded-lg bg-black/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-text-muted hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-dark-accent/40 dark:hover:bg-white/[0.1]"
							>
								<Pencil size={12} />
								{hasJD ? "Edit" : "Paste JD"}
							</button>
						)}
					</div>
				</div>

				{/* Edit mode: textarea for markdown paste */}
				{editing && (
					<div className="flex flex-col gap-2">
						<textarea
							value={jdText}
							onChange={(e) => setJdText(e.target.value)}
							placeholder="Paste the job description here (markdown supported)..."
							className="w-full min-h-[300px] rounded-lg border border-dashed border-black/[0.12] bg-transparent p-4 text-[13px] leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:border-amber-400 focus:outline-none resize-y dark:border-white/[0.1] dark:text-dark-accent dark:placeholder:text-dark-accent/30"
							style={{ fontFamily: "var(--mono, monospace)" }}
							autoFocus
						/>
						<div className="text-[9px] text-text-muted dark:text-dark-accent/30" style={{ fontFamily: "var(--mono, monospace)" }}>
							**bold** * *italic* * # headings * - lists * `code` -- full markdown supported
						</div>
					</div>
				)}

				{/* Read mode: rendered markdown */}
				{!editing && hasJD && (
					<div className="jd-markdown prose prose-sm max-w-none text-[13px] leading-relaxed text-text-secondary dark:text-dark-accent/60 dark:prose-invert">
						<Markdown>{jdText}</Markdown>
					</div>
				)}

				{/* Empty state */}
				{!editing && !hasJD && (
					<div className="flex flex-col items-center justify-center rounded-xl border-[1.5px] border-dashed border-black/[0.1] py-12 dark:border-white/[0.1]">
						<Eye size={24} className="mb-3 text-text-muted/40 dark:text-dark-accent/20" />
						<p className="text-[13px] font-medium text-text-muted dark:text-dark-accent/40">
							No job description saved yet
						</p>
						<p className="mt-1 text-[11px] text-text-muted/60 dark:text-dark-accent/30">
							Click "Paste JD" to save the posting before it disappears
						</p>
					</div>
				)}
			</div>

			{/* Markdown preview toggle hint when editing */}
			{editing && hasJD && (
				<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
					<div className="mb-3 flex items-center gap-2">
						<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
						<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Preview</span>
					</div>
					<div className="jd-markdown prose prose-sm max-w-none text-[13px] leading-relaxed text-text-secondary dark:text-dark-accent/60 dark:prose-invert">
						<Markdown>{jdText}</Markdown>
					</div>
				</div>
			)}
		</div>
	);
}
