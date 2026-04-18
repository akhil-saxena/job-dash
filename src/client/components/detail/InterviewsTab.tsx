import { useState } from "react";
import { Plus } from "lucide-react";
import { useInterviews, useCreateRound } from "@/client/hooks/useInterviews";
import { InterviewRoundCard } from "./InterviewRoundCard";
import { INTERVIEW_ROUND_TYPES, ROUND_TYPE_LABELS } from "@/shared/constants";
import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";

interface InterviewsTabProps {
	app: ApplicationDetail;
}

export function InterviewsTab({ app }: InterviewsTabProps) {
	const { data: rounds, isLoading } = useInterviews(app.id);
	const createRound = useCreateRound(app.id);
	const [showAddForm, setShowAddForm] = useState(false);
	const [newRoundType, setNewRoundType] = useState<string>("technical");

	const handleAddRound = () => {
		createRound.mutate(
			{ roundType: newRoundType },
			{ onSuccess: () => setShowAddForm(false) },
		);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<span className="text-[13px] text-text-muted dark:text-dark-accent/40">Loading interviews...</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Header with Add button */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
					<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">
						Interview schedule
					</span>
					{rounds && rounds.length > 0 && (
						<span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" style={{ fontFamily: "var(--mono, monospace)" }}>
							{rounds.length}
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={() => setShowAddForm(!showAddForm)}
					className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-amber-600 transition-colors"
				>
					<Plus size={12} /> Add interview
				</button>
			</div>

			{/* Add round form (inline, toggled) */}
			{showAddForm && (
				<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-amber-200/40 p-4 dark:bg-zinc-800/50 dark:border-amber-500/20">
					<div className="flex items-end gap-3">
						<div className="flex-1">
							<label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40 mb-1">Round type</label>
							<select
								value={newRoundType}
								onChange={(e) => setNewRoundType(e.target.value)}
								className="w-full rounded-lg border border-black/[0.1] bg-transparent px-3 py-2 text-[13px] dark:border-white/[0.1] dark:text-dark-accent"
							>
								{INTERVIEW_ROUND_TYPES.map((t) => (
									<option key={t} value={t}>{ROUND_TYPE_LABELS[t]}</option>
								))}
							</select>
						</div>
						<button
							type="button"
							onClick={handleAddRound}
							disabled={createRound.isPending}
							className="rounded-lg bg-amber-500 px-4 py-2 text-[12px] font-bold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
						>
							{createRound.isPending ? "Adding..." : "Add"}
						</button>
						<button
							type="button"
							onClick={() => setShowAddForm(false)}
							className="rounded-lg border border-black/[0.1] px-4 py-2 text-[12px] text-text-muted hover:text-text-secondary dark:border-white/[0.1] dark:text-dark-accent/40"
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Round cards */}
			{rounds && rounds.length > 0 ? (
				rounds.map((round, i) => (
					<InterviewRoundCard
						key={round.id}
						round={round}
						index={i}
						applicationId={app.id}
					/>
				))
			) : (
				<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-8 text-center dark:bg-zinc-800/50 dark:border-white/10">
					<p className="text-[13px] text-text-muted dark:text-dark-accent/40">
						No interviews scheduled yet. Click "Add interview" to log your first round.
					</p>
				</div>
			)}
		</div>
	);
}
