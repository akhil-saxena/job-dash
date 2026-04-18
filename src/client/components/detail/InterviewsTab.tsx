import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";

interface InterviewsTabProps {
	app: ApplicationDetail;
}

const SAMPLE_INTERVIEWS = [
	{ id: "1", title: "Recruiter Screen", kind: "Phone", interviewer: "Sarah Chen", platform: "Google Meet", duration: "30 min", date: "2025-01-20", time: "10:00 AM", status: "done" as const, month: "Jan", day: "20", weekday: "Mon" },
	{ id: "2", title: "Technical Round 1", kind: "Technical", interviewer: "Mike Lee", platform: "Zoom", duration: "60 min", date: "2025-01-25", time: "2:00 PM", status: "done" as const, month: "Jan", day: "25", weekday: "Sat" },
	{ id: "3", title: "System Design", kind: "System Design", interviewer: "Priya Sharma", platform: "On-site", duration: "90 min", date: "2025-02-01", time: "11:00 AM", status: "upcoming" as const, month: "Feb", day: "01", weekday: "Sat" },
];

const STATUS_STYLES: Record<string, string> = {
	upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
	done: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
	passed: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
	pending: "bg-black/[0.04] text-text-muted dark:bg-white/[0.06] dark:text-dark-accent/40",
};

export function InterviewsTab({ app: _app }: InterviewsTabProps) {
	return (
		<div className="flex flex-col gap-4">
			{/* Main schedule card */}
			<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
				{/* Header row */}
				<div className="mb-5 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
						<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Interview schedule</span>
					</div>
					<button
						type="button"
						className="rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-amber-600 transition-colors"
					>
						Add interview
					</button>
				</div>

				{/* Interview rows */}
				<div className="flex flex-col gap-3">
					{SAMPLE_INTERVIEWS.map((interview) => {
						const isNext = interview.status === "upcoming";
						return (
							<div
								key={interview.id}
								className={`flex items-start gap-4 rounded-xl p-3 ${isNext ? "bg-amber-50/60 border border-amber-200/30 dark:bg-amber-500/[0.06] dark:border-amber-500/20" : "border border-transparent"}`}
							>
								{/* Date block */}
								<div className="flex w-12 shrink-0 flex-col items-center">
									<span className="text-[9px] font-bold uppercase text-text-muted dark:text-dark-accent/40" style={{ fontFamily: "var(--mono, monospace)" }}>{interview.month}</span>
									<span className="text-[22px] font-extrabold leading-none text-text-primary dark:text-dark-accent">{interview.day}</span>
									<span className="text-[9px] text-text-muted dark:text-dark-accent/40">{interview.weekday}</span>
								</div>

								{/* Body */}
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<span className="text-[13px] font-semibold text-text-primary dark:text-dark-accent">{interview.title}</span>
										<span className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-text-muted dark:bg-white/[0.06] dark:text-dark-accent/40">{interview.kind}</span>
									</div>
									<p className="mt-1 text-[11px] text-text-secondary dark:text-dark-accent/60">
										{interview.interviewer} &middot; {interview.platform} &middot; {interview.duration}
									</p>
								</div>

								{/* Right: status + time */}
								<div className="flex shrink-0 flex-col items-end gap-1">
									<span className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold capitalize ${STATUS_STYLES[interview.status] ?? STATUS_STYLES.pending}`}>
										{interview.status}
									</span>
									<span className="text-[10px] text-text-muted dark:text-dark-accent/40" style={{ fontFamily: "var(--mono, monospace)" }}>{interview.time}</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Prep notes */}
			<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
				<div className="mb-3 flex items-center gap-2">
					<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
					<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Prep notes</span>
				</div>
				<ul className="space-y-2 text-[12.5px] text-text-secondary dark:text-dark-accent/60">
					<li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />Review system design fundamentals</li>
					<li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />Prepare STAR stories for behavioral questions</li>
					<li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />Research company's recent product launches</li>
				</ul>
			</div>

			<p className="text-center text-[10px] text-text-muted dark:text-dark-accent/30" style={{ fontFamily: "var(--mono, monospace)" }}>
				Interview tracking with real data coming in Phase 5
			</p>
		</div>
	);
}
