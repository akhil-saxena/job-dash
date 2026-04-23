import { useState, useCallback } from "react";
import { ChevronDown, Plus, Trash2, ExternalLink, Clock, User, Video, Calendar } from "lucide-react";
import { StarRating } from "./StarRating";
import { SaveIndicator } from "./SaveIndicator";
import { QACard } from "./QACard";
import { useUpdateRound, useDeleteRound, useCreateQA, useDeleteQA } from "@/client/hooks/useInterviews";
import type { InterviewRound } from "@/client/hooks/useInterviews";
import { useDebouncedMutate } from "@/client/hooks/useDebouncedMutate";
import { ROUND_TYPE_LABELS, INTERVIEW_STATUS_LABELS, INTERVIEW_STATUSES } from "@/shared/constants";
import type { InterviewRoundType, InterviewStatus } from "@/shared/constants";

interface InterviewRoundCardProps {
	round: InterviewRound;
	index: number;
	applicationId: string;
}

const STATUS_STYLES: Record<string, string> = {
	scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
	completed: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
	cancelled: "bg-black/[0.04] text-text-muted dark:bg-white/[0.06] dark:text-dark-accent/40",
	no_show: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

function formatScheduledDate(scheduledAt: string | null): string | null {
	if (!scheduledAt) return null;
	try {
		const ts = Number(scheduledAt);
		const d = Number.isNaN(ts) ? new Date(scheduledAt) : new Date(ts * 1000);
		if (Number.isNaN(d.getTime())) return null;
		return d.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		}) + " at " + d.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	} catch {
		return null;
	}
}

// datetime-local input expects "YYYY-MM-DDTHH:mm" in LOCAL time.
// Server stores a Date (unix timestamp); it's serialised as an ISO string
// (UTC). Convert in both directions so the user sees their local time.
function toLocalInputValue(scheduledAt: string | null): string {
	if (!scheduledAt) return "";
	const ts = Number(scheduledAt);
	const d = Number.isNaN(ts) ? new Date(scheduledAt) : new Date(ts * 1000);
	if (Number.isNaN(d.getTime())) return "";
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(value: string): string | null {
	if (!value) return null;
	// `new Date("YYYY-MM-DDTHH:mm")` interprets as LOCAL time (no Z suffix).
	// `.toISOString()` converts to UTC ISO, which is what the API's
	// `z.string().datetime()` expects.
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return null;
	return d.toISOString();
}

function isUpcoming(round: InterviewRound): boolean {
	if (round.status !== "scheduled" || !round.scheduledAt) return false;
	const ts = Number(round.scheduledAt);
	const scheduledMs = Number.isNaN(ts)
		? new Date(round.scheduledAt).getTime()
		: ts * 1000;
	return scheduledMs > Date.now();
}

export function InterviewRoundCard({ round, index, applicationId }: InterviewRoundCardProps) {
	const [expanded, setExpanded] = useState(false);
	const updateRound = useUpdateRound(applicationId);
	const deleteRound = useDeleteRound(applicationId);
	const createQA = useCreateQA(applicationId);
	const deleteQA = useDeleteQA(applicationId);

	// Local state for auto-save fields
	const [scheduledAtLocal, setScheduledAtLocal] = useState(() => toLocalInputValue(round.scheduledAt));
	const [interviewerName, setInterviewerName] = useState(round.interviewerName ?? "");
	const [interviewerRole, setInterviewerRole] = useState(round.interviewerRole ?? "");
	const [durationMinutes, setDurationMinutes] = useState(round.durationMinutes);
	const [meetingLink, setMeetingLink] = useState(round.meetingLink ?? "");
	const [experienceNotes, setExperienceNotes] = useState(round.experienceNotes ?? "");
	const [feedback, setFeedback] = useState(round.feedback ?? "");

	// Dirty flags for save indicators
	const [notesDirty, setNotesDirty] = useState(false);
	const [feedbackDirty, setFeedbackDirty] = useState(false);

	const doMutate = useCallback(
		(fields: Record<string, unknown>) => {
			updateRound.mutate({ roundId: round.id, ...fields });
		},
		[updateRound, round.id],
	);
	const debouncedMutate = useDebouncedMutate(doMutate);

	const doMutateNotes = useCallback(
		(fields: Record<string, unknown>) => {
			updateRound.mutate({ roundId: round.id, ...fields }, {
				onSuccess: () => setNotesDirty(false),
			});
		},
		[updateRound, round.id],
	);
	const debouncedNotes = useDebouncedMutate(doMutateNotes);

	const doMutateFeedback = useCallback(
		(fields: Record<string, unknown>) => {
			updateRound.mutate({ roundId: round.id, ...fields }, {
				onSuccess: () => setFeedbackDirty(false),
			});
		},
		[updateRound, round.id],
	);
	const debouncedFeedback = useDebouncedMutate(doMutateFeedback);

	const upcoming = isUpcoming(round);
	const dateStr = formatScheduledDate(round.scheduledAt);
	const typeLabel = round.roundType === "custom" && round.customTypeName
		? round.customTypeName
		: ROUND_TYPE_LABELS[round.roundType as InterviewRoundType] ?? round.roundType;

	const handleDelete = () => {
		if (window.confirm("Delete this round? Q&A pairs will also be deleted.")) {
			deleteRound.mutate({ roundId: round.id });
		}
	};

	return (
		<div
			className={`rounded-[14px] bg-white/55 backdrop-blur-[14px] border transition-colors ${
				upcoming
					? "border-amber-200/30 bg-amber-50/60 dark:bg-amber-500/[0.06] dark:border-amber-500/20"
					: "border-white/50 dark:bg-zinc-800/50 dark:border-white/10"
			}`}
		>
			{/* Collapsed header -- always visible */}
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="flex w-full items-center gap-3 p-4 text-left"
			>
				{/* Round badge */}
				<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
					R{index + 1}
				</span>

				{/* Type label */}
				<span className="text-[13px] font-semibold text-text-primary dark:text-dark-accent">
					{typeLabel}
				</span>

				{/* Date */}
				{dateStr && (
					<span className="text-[11px] text-text-muted dark:text-dark-accent/40">
						{dateStr}
					</span>
				)}

				{/* Interviewer */}
				{round.interviewerName && (
					<span className="hidden sm:inline text-[11px] text-text-secondary dark:text-dark-accent/60">
						{round.interviewerName}
					</span>
				)}

				{/* Spacer */}
				<span className="flex-1" />

				{/* Status badge */}
				<span className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${STATUS_STYLES[round.status] ?? STATUS_STYLES.cancelled}`}>
					{INTERVIEW_STATUS_LABELS[round.status as InterviewStatus] ?? round.status}
				</span>

				{/* Star rating (read-only in collapsed view) */}
				{round.rating != null && round.rating > 0 && (
					<span className="hidden sm:flex">
						<StarRating value={round.rating} readOnly size={14} />
					</span>
				)}

				{/* Chevron */}
				<ChevronDown
					size={16}
					className={`shrink-0 text-text-muted dark:text-dark-accent/40 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
				/>
			</button>

			{/* Expanded body */}
			{expanded && (
				<div className="px-4 pb-4">
					{/* A. Editable fields row */}
					<div className="flex flex-wrap gap-3 border-t border-black/[0.06] dark:border-white/[0.06] pt-4">
						{/* Scheduled at */}
						<div className="flex flex-col gap-1 min-w-[200px]">
							<label className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40">
								<Calendar size={10} /> Scheduled
							</label>
							<input
								type="datetime-local"
								value={scheduledAtLocal}
								onChange={(e) => {
									const v = e.target.value;
									setScheduledAtLocal(v);
									debouncedMutate({ scheduledAt: fromLocalInputValue(v) });
								}}
								className="rounded-lg border border-black/[0.08] bg-transparent px-2.5 py-1.5 text-[12px] text-text-primary focus:border-amber-400 focus:outline-none dark:border-white/[0.08] dark:text-dark-accent [color-scheme:light] dark:[color-scheme:dark]"
							/>
						</div>

						{/* Interviewer name */}
						<div className="flex flex-col gap-1 min-w-[140px]">
							<label className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40">
								<User size={10} /> Interviewer
							</label>
							<input
								type="text"
								value={interviewerName}
								onChange={(e) => { setInterviewerName(e.target.value); debouncedMutate({ interviewerName: e.target.value || null }); }}
								placeholder="Name"
								className="rounded-lg border border-black/[0.08] bg-transparent px-2.5 py-1.5 text-[12px] text-text-primary placeholder:text-text-muted/50 focus:border-amber-400 focus:outline-none dark:border-white/[0.08] dark:text-dark-accent dark:placeholder:text-dark-accent/30"
							/>
						</div>

						{/* Interviewer role */}
						<div className="flex flex-col gap-1 min-w-[120px]">
							<label className="text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40">
								Role
							</label>
							<input
								type="text"
								value={interviewerRole}
								onChange={(e) => { setInterviewerRole(e.target.value); debouncedMutate({ interviewerRole: e.target.value || null }); }}
								placeholder="e.g. Hiring Manager"
								className="rounded-lg border border-black/[0.08] bg-transparent px-2.5 py-1.5 text-[12px] text-text-primary placeholder:text-text-muted/50 focus:border-amber-400 focus:outline-none dark:border-white/[0.08] dark:text-dark-accent dark:placeholder:text-dark-accent/30"
							/>
						</div>

						{/* Duration */}
						<div className="flex flex-col gap-1 min-w-[90px]">
							<label className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40">
								<Clock size={10} /> Duration
							</label>
							<input
								type="number"
								min={5}
								max={480}
								value={durationMinutes}
								onChange={(e) => { const v = Number(e.target.value); setDurationMinutes(v); debouncedMutate({ durationMinutes: v }); }}
								className="rounded-lg border border-black/[0.08] bg-transparent px-2.5 py-1.5 text-[12px] text-text-primary focus:border-amber-400 focus:outline-none dark:border-white/[0.08] dark:text-dark-accent w-[80px]"
							/>
						</div>

						{/* Meeting link */}
						<div className="flex flex-col gap-1 min-w-[160px] flex-1">
							<label className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40">
								<Video size={10} /> Meeting link
							</label>
							<div className="flex items-center gap-1.5">
								<input
									type="url"
									value={meetingLink}
									onChange={(e) => { setMeetingLink(e.target.value); debouncedMutate({ meetingLink: e.target.value || null }); }}
									placeholder="https://..."
									className="min-w-0 flex-1 rounded-lg border border-black/[0.08] bg-transparent px-2.5 py-1.5 text-[12px] text-text-primary placeholder:text-text-muted/50 focus:border-amber-400 focus:outline-none dark:border-white/[0.08] dark:text-dark-accent dark:placeholder:text-dark-accent/30"
								/>
								{meetingLink && (
									<a href={meetingLink.startsWith("http") ? meetingLink : `https://${meetingLink}`} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-600">
										<ExternalLink size={14} />
									</a>
								)}
							</div>
						</div>

						{/* Status select */}
						<div className="flex flex-col gap-1 min-w-[120px]">
							<label className="text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40">
								Status
							</label>
							<select
								value={round.status}
								onChange={(e) => updateRound.mutate({ roundId: round.id, status: e.target.value })}
								className="rounded-lg border border-black/[0.08] bg-transparent px-2.5 py-1.5 text-[12px] text-text-primary focus:border-amber-400 focus:outline-none dark:border-white/[0.08] dark:text-dark-accent"
							>
								{INTERVIEW_STATUSES.map((s) => (
									<option key={s} value={s}>{INTERVIEW_STATUS_LABELS[s]}</option>
								))}
							</select>
						</div>

						{/* Rating */}
						<div className="flex flex-col gap-1">
							<label className="text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40">
								Rating
							</label>
							<StarRating
								value={round.rating}
								onChange={(rating) => updateRound.mutate({ roundId: round.id, rating })}
								size={18}
							/>
						</div>
					</div>

					{/* B. Experience notes */}
					<div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-4 mt-4">
						<div className="mb-2 flex items-center gap-2">
							<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
							<span className="text-[12px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Experience notes</span>
							{(notesDirty || updateRound.isPending) && (
								<SaveIndicator isPending={updateRound.isPending} hasUnsaved={notesDirty} />
							)}
						</div>
						<textarea
							value={experienceNotes}
							onChange={(e) => {
								setExperienceNotes(e.target.value);
								setNotesDirty(true);
								debouncedNotes({ experienceNotes: e.target.value || null });
							}}
							placeholder="How did it go? (markdown supported)"
							className="w-full min-h-[80px] rounded-lg border border-dashed border-black/[0.08] bg-transparent p-2.5 text-[12.5px] leading-relaxed text-text-secondary placeholder:text-text-muted/50 focus:border-amber-400 focus:outline-none resize-y dark:border-white/[0.08] dark:text-dark-accent/80 dark:placeholder:text-dark-accent/30"
						/>
						<div className="mt-1 text-[9px] text-text-muted dark:text-dark-accent/30" style={{ fontFamily: "var(--mono, monospace)" }}>
							**bold** *italic* - lists `code` -- markdown supported
						</div>
					</div>

					{/* C. Feedback */}
					<div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-4 mt-4">
						<div className="mb-2 flex items-center gap-2">
							<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
							<span className="text-[12px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Feedback</span>
							{(feedbackDirty || updateRound.isPending) && (
								<SaveIndicator isPending={updateRound.isPending} hasUnsaved={feedbackDirty} />
							)}
						</div>
						<textarea
							value={feedback}
							onChange={(e) => {
								setFeedback(e.target.value);
								setFeedbackDirty(true);
								debouncedFeedback({ feedback: e.target.value || null });
							}}
							placeholder="Interviewer feedback, areas to improve... (markdown supported)"
							className="w-full min-h-[80px] rounded-lg border border-dashed border-black/[0.08] bg-transparent p-2.5 text-[12.5px] leading-relaxed text-text-secondary placeholder:text-text-muted/50 focus:border-amber-400 focus:outline-none resize-y dark:border-white/[0.08] dark:text-dark-accent/80 dark:placeholder:text-dark-accent/30"
						/>
						<div className="mt-1 text-[9px] text-text-muted dark:text-dark-accent/30" style={{ fontFamily: "var(--mono, monospace)" }}>
							**bold** *italic* - lists `code` -- markdown supported
						</div>
					</div>

					{/* D. Q&A Pairs */}
					<div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-4 mt-4">
						<div className="mb-3 flex items-center gap-2">
							<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
							<span className="text-[12px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Questions & Answers</span>
							{round.qaPairs.length > 0 && (
								<span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" style={{ fontFamily: "var(--mono, monospace)" }}>
									{round.qaPairs.length}
								</span>
							)}
							<span className="flex-1" />
							<button
								type="button"
								onClick={() => createQA.mutate({ roundId: round.id, question: "New question" })}
								disabled={createQA.isPending}
								className="flex items-center gap-1 rounded-lg border border-amber-300/50 px-2.5 py-1 text-[11px] font-semibold text-amber-600 hover:bg-amber-50/80 transition-colors dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10"
							>
								<Plus size={12} /> Add Q&A
							</button>
						</div>

						{round.qaPairs.length > 0 ? (
							<div className="flex flex-col gap-2.5">
								{round.qaPairs.map((qa, qi) => (
									<QACard
										key={qa.id}
										qa={qa}
										applicationId={applicationId}
										index={qi}
										onDelete={() => deleteQA.mutate({ qaId: qa.id })}
									/>
								))}
							</div>
						) : (
							<p className="text-[12px] text-text-muted dark:text-dark-accent/40 py-2">
								No Q&A pairs yet. Click "Add Q&A" to start logging questions.
							</p>
						)}
					</div>

					{/* E. Footer actions */}
					<div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-4 mt-4 flex justify-end">
						<button
							type="button"
							onClick={handleDelete}
							disabled={deleteRound.isPending}
							className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-red-500 hover:bg-red-50/80 transition-colors dark:text-red-400 dark:hover:bg-red-500/10"
						>
							<Trash2 size={13} /> Delete round
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
