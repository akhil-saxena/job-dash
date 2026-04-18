import { useState } from "react";
import { Plus, X, Check, Clock, AlertTriangle } from "lucide-react";
import { useDeadlines, useCreateDeadline, useCompleteDeadline, useDeleteDeadline } from "@/client/hooks/useDeadlines";
import { DEADLINE_TYPES, DEADLINE_TYPE_LABELS } from "@/shared/constants";
import type { DeadlineType } from "@/shared/constants";

interface DeadlineSectionProps {
	applicationId: string;
}

function daysUntil(epochSeconds: number): number {
	const nowSec = Math.floor(Date.now() / 1000);
	return Math.floor((epochSeconds - nowSec) / 86400);
}

function formatDueDate(epochSeconds: number): string {
	const d = new Date(epochSeconds * 1000);
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function dueLabel(epochSeconds: number): { text: string; className: string } {
	const days = daysUntil(epochSeconds);
	if (days < 0) {
		return { text: `${Math.abs(days)}d overdue`, className: "text-red-500 dark:text-red-400" };
	}
	if (days === 0) {
		return { text: "Due today", className: "text-red-500 dark:text-red-400" };
	}
	if (days <= 3) {
		return { text: `${days}d left`, className: "text-amber-600 dark:text-amber-400" };
	}
	return { text: `${days}d left`, className: "text-text-muted dark:text-dark-accent/40" };
}

export function DeadlineSection({ applicationId }: DeadlineSectionProps) {
	const { data: deadlines } = useDeadlines(applicationId);
	const createDeadline = useCreateDeadline();
	const completeDeadline = useCompleteDeadline();
	const deleteDeadline = useDeleteDeadline();

	const [showAddForm, setShowAddForm] = useState(false);
	const [newType, setNewType] = useState<string>("follow_up");
	const [newDueAt, setNewDueAt] = useState("");
	const [newNotes, setNewNotes] = useState("");
	const [newCustomLabel, setNewCustomLabel] = useState("");

	function handleAdd() {
		if (!newDueAt) return;
		createDeadline.mutate(
			{
				appId: applicationId,
				deadlineType: newType,
				dueAt: newDueAt,
				customLabel: newType === "custom" && newCustomLabel ? newCustomLabel : undefined,
				notes: newNotes || undefined,
			},
			{
				onSuccess: () => {
					setShowAddForm(false);
					setNewDueAt("");
					setNewNotes("");
					setNewCustomLabel("");
				},
			},
		);
	}

	function handleComplete(deadlineId: string) {
		completeDeadline.mutate({ deadlineId });
	}

	function handleDelete(deadlineId: string) {
		deleteDeadline.mutate({ deadlineId });
	}

	const sortedDeadlines = [...(deadlines ?? [])].sort((a, b) => {
		// Completed at bottom, then sort by dueAt ascending
		if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
		return a.dueAt - b.dueAt;
	});

	return (
		<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
			<div className="mb-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
					<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Deadlines</span>
					{sortedDeadlines.length > 0 && (
						<span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" style={{ fontFamily: "var(--mono, monospace)" }}>
							{sortedDeadlines.filter((d) => !d.isCompleted).length}
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={() => setShowAddForm(!showAddForm)}
					className="flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-amber-600 transition-colors"
				>
					<Plus size={11} /> Add
				</button>
			</div>

			{/* Add form */}
			{showAddForm && (
				<div className="mb-3 rounded-xl border border-amber-200/40 bg-amber-50/30 p-3 dark:border-amber-500/20 dark:bg-amber-500/5">
					<div className="flex flex-col gap-2.5">
						<div>
							<label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40 mb-1">Type</label>
							<select
								value={newType}
								onChange={(e) => setNewType(e.target.value)}
								className="w-full rounded-lg border border-black/[0.1] bg-transparent px-2.5 py-1.5 text-[12px] dark:border-white/[0.1] dark:text-dark-accent"
							>
								{DEADLINE_TYPES.map((t) => (
									<option key={t} value={t}>{DEADLINE_TYPE_LABELS[t as DeadlineType]}</option>
								))}
							</select>
						</div>
						{newType === "custom" && (
							<div>
								<label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40 mb-1">Label</label>
								<input
									type="text"
									value={newCustomLabel}
									onChange={(e) => setNewCustomLabel(e.target.value)}
									placeholder="e.g., Reference check"
									className="w-full rounded-lg border border-black/[0.1] bg-transparent px-2.5 py-1.5 text-[12px] placeholder:text-text-muted/50 focus:border-amber-400 focus:outline-none dark:border-white/[0.1] dark:text-dark-accent"
								/>
							</div>
						)}
						<div>
							<label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40 mb-1">Due date</label>
							<input
								type="datetime-local"
								value={newDueAt}
								onChange={(e) => setNewDueAt(e.target.value)}
								className="w-full rounded-lg border border-black/[0.1] bg-transparent px-2.5 py-1.5 text-[12px] dark:border-white/[0.1] dark:text-dark-accent"
							/>
						</div>
						<div>
							<label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40 mb-1">Notes (optional)</label>
							<textarea
								value={newNotes}
								onChange={(e) => setNewNotes(e.target.value)}
								placeholder="Add notes..."
								rows={2}
								className="w-full rounded-lg border border-black/[0.1] bg-transparent px-2.5 py-1.5 text-[12px] placeholder:text-text-muted/50 focus:border-amber-400 focus:outline-none resize-none dark:border-white/[0.1] dark:text-dark-accent"
							/>
						</div>
						<div className="flex gap-1.5">
							<button
								type="button"
								onClick={handleAdd}
								disabled={!newDueAt || createDeadline.isPending}
								className="flex-1 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
							>
								{createDeadline.isPending ? "Adding..." : "Add deadline"}
							</button>
							<button
								type="button"
								onClick={() => setShowAddForm(false)}
								className="rounded-lg border border-black/[0.1] px-3 py-1.5 text-[11px] text-text-muted hover:text-text-secondary dark:border-white/[0.1] dark:text-dark-accent/40"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Deadline list */}
			{sortedDeadlines.length === 0 ? (
				<p className="text-[11px] text-text-muted dark:text-dark-accent/30 italic">No deadlines set</p>
			) : (
				<div className="flex flex-col gap-2">
					{sortedDeadlines.map((deadline) => {
						const due = dueLabel(deadline.dueAt);
						const typeLabel = DEADLINE_TYPE_LABELS[deadline.deadlineType as DeadlineType] ?? deadline.customLabel ?? deadline.deadlineType;
						const isOverdue = daysUntil(deadline.dueAt) < 0 && !deadline.isCompleted;

						return (
							<div
								key={deadline.id}
								className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
									deadline.isCompleted
										? "opacity-50"
										: isOverdue
											? "bg-red-50/40 dark:bg-red-500/5"
											: ""
								}`}
							>
								{/* Complete checkbox */}
								<button
									type="button"
									onClick={() => handleComplete(deadline.id)}
									disabled={!!deadline.isCompleted}
									className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
										deadline.isCompleted
											? "border-green-400/50 bg-green-100 dark:bg-green-500/20 dark:border-green-500/30"
											: "border-black/[0.15] hover:border-amber-400 dark:border-white/[0.15]"
									}`}
									title={deadline.isCompleted ? "Completed" : "Mark complete"}
								>
									{deadline.isCompleted ? (
										<Check size={12} className="text-green-600 dark:text-green-400" />
									) : null}
								</button>

								{/* Details */}
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<span className={`text-[9px] font-bold uppercase tracking-widest ${
											isOverdue && !deadline.isCompleted
												? "text-red-600 dark:text-red-400"
												: "text-text-muted dark:text-dark-accent/40"
										}`}>
											{typeLabel}
										</span>
										{isOverdue && !deadline.isCompleted && (
											<AlertTriangle size={10} className="text-red-500" />
										)}
									</div>
									<div className="flex items-center gap-2 mt-0.5">
										<span className={`text-[12px] font-medium ${deadline.isCompleted ? "line-through text-text-muted dark:text-dark-accent/30" : "text-text-primary dark:text-dark-accent"}`}>
											{formatDueDate(deadline.dueAt)}
										</span>
										{!deadline.isCompleted && (
											<span className={`text-[10px] font-semibold ${due.className}`} style={{ fontFamily: "var(--mono, monospace)" }}>
												{due.text}
											</span>
										)}
									</div>
									{deadline.notes && (
										<p className="mt-0.5 text-[10.5px] text-text-muted dark:text-dark-accent/40 truncate">
											{deadline.notes}
										</p>
									)}
								</div>

								{/* Delete */}
								<button
									type="button"
									onClick={() => handleDelete(deadline.id)}
									className="shrink-0 rounded-md p-1 text-text-muted hover:text-red-500 hover:bg-red-50/50 transition-colors dark:text-dark-accent/30 dark:hover:text-red-400 dark:hover:bg-red-500/10"
									title="Delete deadline"
								>
									<X size={12} />
								</button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
