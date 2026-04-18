import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";

interface TimelineTabProps {
	app: ApplicationDetail;
}

const EVENT_CONFIG: Record<string, { label: string; color: string }> = {
	created: { label: "Created", color: "#f59e0b" },
	status_change: { label: "Status changed", color: "#3b82f6" },
	archived: { label: "Archived", color: "#64748b" },
	unarchived: { label: "Restored", color: "#22c55e" },
	pinned: { label: "Pinned", color: "#f59e0b" },
	unpinned: { label: "Unpinned", color: "#a8a29e" },
	deleted: { label: "Deleted", color: "#ef4444" },
	restored: { label: "Restored", color: "#22c55e" },
};

function formatEventDate(dateStr: string): { date: string; time: string } {
	const d = new Date(dateStr);
	return {
		date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
		time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
	};
}

export function TimelineTab({ app }: TimelineTabProps) {
	// Sort events newest first
	const events = [...app.timeline].sort(
		(a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
	);

	return (
		<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
			{/* Header row */}
			<div className="mb-5 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
					<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Full activity</span>
				</div>
				<span className="text-[10px] text-text-muted dark:text-dark-accent/30" style={{ fontFamily: "var(--mono, monospace)" }}>
					All events &middot; newest first
				</span>
			</div>

			{/* Timeline */}
			{events.length === 0 ? (
				<p className="py-8 text-center text-[13px] text-text-muted dark:text-dark-accent/40">No activity yet</p>
			) : (
				<div className="relative ml-3">
					{/* Vertical line */}
					<div className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-black/[0.08] dark:bg-white/[0.08]" />

					{events.map((event, i) => {
						const config = EVENT_CONFIG[event.eventType] ?? { label: event.eventType, color: "#a8a29e" };
						const { date, time } = formatEventDate(event.occurredAt);
						const isFirst = i === 0;

						return (
							<div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
								{/* Circle marker */}
								<div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center" style={{ marginLeft: "-10px" }}>
									{isFirst ? (
										<span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
									) : (
										<span className="h-2.5 w-2.5 rounded-full border-[1.5px]" style={{ borderColor: config.color, backgroundColor: "transparent" }} />
									)}
								</div>

								{/* When column */}
								<div className="w-20 shrink-0 pt-0.5">
									<p className="text-[11px] font-semibold text-text-primary dark:text-dark-accent" style={{ fontFamily: "var(--mono, monospace)" }}>{date}</p>
									<p className="text-[10px] text-text-muted dark:text-dark-accent/40" style={{ fontFamily: "var(--mono, monospace)" }}>{time}</p>
								</div>

								{/* Body */}
								<div className="min-w-0 flex-1 pt-0.5">
									<p className="text-[12.5px] font-semibold text-text-primary dark:text-dark-accent">{config.label}</p>
									<p className="mt-0.5 text-[11.5px] text-text-secondary dark:text-dark-accent/60">{event.description}</p>
								</div>

								{/* Act label */}
								<span
									className="shrink-0 self-start rounded bg-black/[0.04] px-1.5 py-0.5 text-[9px] font-medium uppercase text-text-muted dark:bg-white/[0.06] dark:text-dark-accent/40"
									style={{ fontFamily: "var(--mono, monospace)" }}
								>
									{event.eventType.replace("_", " ")}
								</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
