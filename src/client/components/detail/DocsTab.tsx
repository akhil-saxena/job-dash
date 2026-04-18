import { Upload, FileText, Link as LinkIcon } from "lucide-react";
import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";

interface DocsTabProps {
	app: ApplicationDetail;
}

const SAMPLE_DOCS = [
	{ id: "1", name: "Resume_2025.pdf", type: "PDF", size: "245 KB", date: "Jan 15, 2025", version: "v2" },
	{ id: "2", name: "Cover_Letter.md", type: "MD", size: "12 KB", date: "Jan 16, 2025", version: "v1" },
	{ id: "3", name: "Portfolio_Deck.pdf", type: "PDF", size: "1.2 MB", date: "Jan 18, 2025", version: "v1" },
	{ id: "4", name: "References.pdf", type: "PDF", size: "89 KB", date: "Jan 20, 2025", version: "v1" },
];

const SAMPLE_LINKS = [
	{ name: "GitHub Profile", url: "github.com/username" },
	{ name: "LinkedIn", url: "linkedin.com/in/username" },
	{ name: "Portfolio Site", url: "portfolio.example.com" },
];

const TYPE_COLORS: Record<string, string> = {
	PDF: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
	MD: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
};

export function DocsTab({ app: _app }: DocsTabProps) {
	return (
		<div className="flex flex-col gap-4">
			{/* Documents card */}
			<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
				<div className="mb-5 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
						<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Attached documents</span>
					</div>
					<button
						type="button"
						className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-amber-600 transition-colors"
					>
						<Upload size={12} />
						Upload
					</button>
				</div>

				{/* 2-column doc grid */}
				<div className="grid gap-3 sm:grid-cols-2">
					{SAMPLE_DOCS.map((doc) => (
						<div key={doc.id} className="flex items-start gap-3 rounded-xl border border-black/[0.06] bg-white/40 p-3 transition-colors hover:bg-white/70 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
							<div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/[0.03] dark:bg-white/[0.06]">
								<FileText size={18} className="text-text-muted dark:text-dark-accent/40" />
								<span className={`absolute -top-1.5 -right-1.5 rounded px-1 py-px text-[7px] font-bold ${TYPE_COLORS[doc.type] ?? "bg-black/[0.04] text-text-muted"}`}>
									{doc.type}
								</span>
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate text-[12.5px] font-semibold text-text-primary dark:text-dark-accent">{doc.name}</p>
								<p className="mt-0.5 text-[10px] text-text-muted dark:text-dark-accent/40" style={{ fontFamily: "var(--mono, monospace)" }}>
									{doc.size} &middot; {doc.date}
								</p>
							</div>
							<span className="shrink-0 rounded bg-black/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-text-muted dark:bg-white/[0.06] dark:text-dark-accent/40" style={{ fontFamily: "var(--mono, monospace)" }}>
								{doc.version}
							</span>
						</div>
					))}
				</div>

				{/* Drop zone */}
				<div className="mt-4 flex items-center justify-center rounded-xl border-[1.5px] border-dashed border-black/[0.1] py-6 text-[12px] text-text-muted transition-colors hover:border-amber-400 hover:text-amber-600 dark:border-white/[0.1] dark:text-dark-accent/40 dark:hover:border-amber-500 dark:hover:text-amber-400">
					Drop or click to attach
				</div>
			</div>

			{/* Related links */}
			<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
				<div className="mb-3 flex items-center gap-2">
					<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
					<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Related links</span>
				</div>
				<div className="flex flex-col gap-2">
					{SAMPLE_LINKS.map((link) => (
						<div key={link.name} className="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
							<LinkIcon size={14} className="shrink-0 text-text-muted dark:text-dark-accent/40" />
							<span className="text-[12.5px] font-medium text-text-primary dark:text-dark-accent">{link.name}</span>
							<span className="ml-auto text-[10px] text-text-muted dark:text-dark-accent/40" style={{ fontFamily: "var(--mono, monospace)" }}>{link.url}</span>
						</div>
					))}
				</div>
			</div>

			<p className="text-center text-[10px] text-text-muted dark:text-dark-accent/30" style={{ fontFamily: "var(--mono, monospace)" }}>
				Document uploads with real data coming in Phase 7
			</p>
		</div>
	);
}
