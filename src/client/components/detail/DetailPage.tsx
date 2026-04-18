import { useState } from "react";
import { DetailHero } from "./DetailHero";
import { OverviewTab } from "./OverviewTab";
import { PlaceholderTab } from "./PlaceholderTab";
import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";

interface DetailPageProps {
	app: ApplicationDetail;
}

interface TabDef {
	label: string;
	value: string;
	count?: number;
}

const TAB_LABELS: Record<string, string> = {
	interviews: "Interviews",
	jd: "JD",
	docs: "Documents",
	timeline: "Timeline",
};

export function DetailPage({ app }: DetailPageProps) {
	const [activeTab, setActiveTab] = useState("overview");

	const tabs: TabDef[] = [
		{ label: "Overview", value: "overview" },
		{ label: "Interviews", value: "interviews", count: 2 },
		{ label: "JD", value: "jd" },
		{ label: "Docs", value: "docs", count: 3 },
		{ label: "Timeline", value: "timeline" },
	];

	return (
		<div className="min-h-full">
			<DetailHero app={app} />

			{/* Tabs — Combo A style: amber underline, mono count badges */}
			<div className="flex gap-0.5 border-b border-black/[0.08] px-6 dark:border-white/[0.06]">
				{tabs.map((tab) => {
					const isActive = activeTab === tab.value;
					return (
						<button
							key={tab.value}
							type="button"
							onClick={() => setActiveTab(tab.value)}
							className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors ${
								isActive
									? "border-amber-500 font-bold text-text-primary dark:text-dark-accent"
									: "border-transparent text-text-muted hover:text-text-secondary dark:text-dark-accent/40 dark:hover:text-dark-accent/60"
							}`}
						>
							{tab.label}
							{tab.count != null && tab.count > 0 && (
								<span
									className={`rounded px-1.5 py-px text-[10px] font-medium ${
										isActive
											? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
											: "bg-black/[0.04] text-text-muted dark:bg-white/[0.06] dark:text-dark-accent/40"
									}`}
									style={{ fontFamily: "var(--mono, monospace)" }}
								>
									{tab.count}
								</span>
							)}
						</button>
					);
				})}
			</div>

			{/* Tab content */}
			<div className="px-6 py-5">
				{activeTab === "overview" ? (
					<OverviewTab app={app} />
				) : (
					<PlaceholderTab name={TAB_LABELS[activeTab] ?? activeTab} />
				)}
			</div>
		</div>
	);
}
