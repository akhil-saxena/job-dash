import { Upload, FileText, Trash2 } from "lucide-react";
import { useDocuments, useDeleteDocument } from "@/client/hooks/useDocuments";
import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";

interface DocsTabProps {
	app: ApplicationDetail;
}

const TYPE_COLORS: Record<string, string> = {
	PDF: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
	MD: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
	DOC: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
	DOCX: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
	TXT: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-400",
	PNG: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
	JPG: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
	JPEG: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
};

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: number): string {
	try {
		const d = new Date(ts * 1000);
		if (Number.isNaN(d.getTime())) return "--";
		return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	} catch {
		return "--";
	}
}

function getExtension(fileName: string): string {
	const parts = fileName.split(".");
	return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE";
}

export function DocsTab({ app }: DocsTabProps) {
	const { data: documents, isLoading } = useDocuments(app.id);
	const deleteDocument = useDeleteDocument(app.id);

	const handleDelete = (docId: string, fileName: string) => {
		if (confirm(`Delete "${fileName}"?`)) {
			deleteDocument.mutate(docId);
		}
	};

	const docs = documents ?? [];

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
						disabled
						title="File upload coming soon (requires R2 binding)"
						className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/50 px-3 py-1.5 text-[11px] font-bold text-white cursor-not-allowed"
					>
						<Upload size={12} />
						Upload
					</button>
				</div>

				{/* Loading state */}
				{isLoading && (
					<div className="flex items-center justify-center py-8">
						<span className="text-[12px] text-text-muted dark:text-dark-accent/40">Loading documents...</span>
					</div>
				)}

				{/* Empty state */}
				{!isLoading && docs.length === 0 && (
					<div className="flex flex-col items-center justify-center rounded-xl border-[1.5px] border-dashed border-black/[0.1] py-10 dark:border-white/[0.1]">
						<FileText size={24} className="mb-3 text-text-muted/40 dark:text-dark-accent/20" />
						<p className="text-[13px] font-medium text-text-muted dark:text-dark-accent/40">
							No documents attached yet
						</p>
						<p className="mt-1 text-[11px] text-text-muted/60 dark:text-dark-accent/30">
							Document uploads will be available when R2 storage is configured
						</p>
					</div>
				)}

				{/* 2-column doc grid */}
				{!isLoading && docs.length > 0 && (
					<div className="grid gap-3 sm:grid-cols-2">
						{docs.map((doc) => {
							const ext = getExtension(doc.fileName);
							return (
								<div key={doc.id} className="flex items-start gap-3 rounded-xl border border-black/[0.06] bg-white/40 p-3 transition-colors hover:bg-white/70 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
									<div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/[0.03] dark:bg-white/[0.06]">
										<FileText size={18} className="text-text-muted dark:text-dark-accent/40" />
										<span className={`absolute -top-1.5 -right-1.5 rounded px-1 py-px text-[7px] font-bold ${TYPE_COLORS[ext] ?? "bg-black/[0.04] text-text-muted"}`}>
											{ext}
										</span>
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-[12.5px] font-semibold text-text-primary dark:text-dark-accent">{doc.fileName}</p>
										<p className="mt-0.5 text-[10px] text-text-muted dark:text-dark-accent/40" style={{ fontFamily: "var(--mono, monospace)" }}>
											{formatFileSize(doc.fileSize)} &middot; {formatDate(doc.createdAt)}
										</p>
									</div>
									<button
										type="button"
										onClick={() => handleDelete(doc.id, doc.fileName)}
										className="shrink-0 rounded p-1 text-text-muted hover:text-red-500 transition-colors dark:text-dark-accent/40 dark:hover:text-red-400"
										title="Delete document"
									>
										<Trash2 size={14} />
									</button>
								</div>
							);
						})}
					</div>
				)}

				{/* Drop zone placeholder */}
				<div className="mt-4 flex items-center justify-center rounded-xl border-[1.5px] border-dashed border-black/[0.1] py-6 text-[12px] text-text-muted transition-colors hover:border-amber-400 hover:text-amber-600 dark:border-white/[0.1] dark:text-dark-accent/40 dark:hover:border-amber-500 dark:hover:text-amber-400">
					Drop or click to attach (R2 upload coming soon)
				</div>
			</div>
		</div>
	);
}
