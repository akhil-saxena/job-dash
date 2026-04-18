import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";

interface JDTabProps {
	app: ApplicationDetail;
}

const STAT_ITEMS = [
	{ label: "Role", value: "Senior Engineer" },
	{ label: "Seniority", value: "L5 / Senior" },
	{ label: "Team", value: "Platform" },
	{ label: "Stack", value: "React, TypeScript, Go" },
	{ label: "Work mode", value: "Hybrid" },
];

const SKILLS = [
	{ name: "React", match: true },
	{ name: "TypeScript", match: true },
	{ name: "Go", match: false },
	{ name: "System Design", match: true },
	{ name: "Kubernetes", match: false },
	{ name: "PostgreSQL", match: true },
	{ name: "GraphQL", match: false },
	{ name: "CI/CD", match: true },
];

export function JDTab({ app }: JDTabProps) {
	return (
		<div className="flex flex-col gap-4">
			{/* Role summary card */}
			<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
				<div className="mb-5 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
						<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Role summary</span>
					</div>
					{app.jobPostingUrl && (
						<a
							href={app.jobPostingUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-[11px] font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
						>
							Open full posting &rarr;
						</a>
					)}
				</div>

				{/* Stat grid */}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{STAT_ITEMS.map((item) => (
						<div key={item.label} className="rounded-lg bg-black/[0.02] p-3 dark:bg-white/[0.03]">
							<span className="text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40" style={{ fontFamily: "var(--mono, monospace)" }}>{item.label}</span>
							<p className="mt-1 text-[13px] font-semibold text-text-primary dark:text-dark-accent">{item.value}</p>
						</div>
					))}

					{/* Fit score */}
					<div className="rounded-lg bg-black/[0.02] p-3 dark:bg-white/[0.03]">
						<span className="text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40" style={{ fontFamily: "var(--mono, monospace)" }}>Fit score</span>
						<div className="mt-1.5 flex items-center gap-2">
							<div className="h-2 w-[100px] rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
								<div className="h-full rounded-full bg-green-500" style={{ width: "72%" }} />
							</div>
							<span className="text-[12px] font-bold text-green-600 dark:text-green-400" style={{ fontFamily: "var(--mono, monospace)" }}>72%</span>
						</div>
					</div>
				</div>
			</div>

			{/* JD text */}
			<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
				<h4 className="mb-2 text-[13px] font-bold text-text-primary dark:text-dark-accent">What you'll do</h4>
				<p className="mb-4 text-[12.5px] leading-relaxed text-text-secondary dark:text-dark-accent/60">
					Design, build, and maintain scalable platform services. Collaborate with product and design teams to deliver user-facing features. Mentor junior engineers and contribute to technical direction.
				</p>
				<h4 className="mb-2 text-[13px] font-bold text-text-primary dark:text-dark-accent">Requirements</h4>
				<p className="text-[12.5px] leading-relaxed text-text-secondary dark:text-dark-accent/60">
					5+ years of experience with modern web technologies. Strong system design fundamentals. Experience with cloud infrastructure and CI/CD pipelines.
				</p>
			</div>

			{/* Skill grid */}
			<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
				<div className="mb-3 flex items-center gap-2">
					<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
					<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Skills match</span>
				</div>
				<div className="flex flex-wrap gap-2">
					{SKILLS.map((skill) => (
						<span
							key={skill.name}
							className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
								skill.match
									? "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400"
									: "border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
							}`}
						>
							<span className={`h-1.5 w-1.5 rounded-full ${skill.match ? "bg-green-500" : "bg-red-400"}`} />
							{skill.name}
						</span>
					))}
				</div>
			</div>

			{/* Fit notes */}
			<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
				<div className="mb-3 flex items-center gap-2">
					<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
					<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">My fit notes</span>
				</div>
				<p className="text-[12.5px] leading-relaxed text-text-secondary dark:text-dark-accent/60">
					Strong match on frontend and system design. Need to brush up on Go and Kubernetes. The hybrid work model is ideal.
				</p>
			</div>

			<p className="text-center text-[10px] text-text-muted dark:text-dark-accent/30" style={{ fontFamily: "var(--mono, monospace)" }}>
				JD snapshots with real data coming in Phase 7
			</p>
		</div>
	);
}
