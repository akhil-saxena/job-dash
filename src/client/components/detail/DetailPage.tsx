import { useState } from "react";
import { TabBar } from "@/client/components/design-system/TabBar";
import { DetailHero } from "./DetailHero";
import { OverviewTab } from "./OverviewTab";
import { PlaceholderTab } from "./PlaceholderTab";
import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";

interface DetailPageProps {
	app: ApplicationDetail;
}

const TAB_ITEMS = [
	{ label: "Overview", value: "overview" },
	{ label: "Interviews", value: "interviews", count: 0 },
	{ label: "JD", value: "jd" },
	{ label: "Docs", value: "docs", count: 0 },
	{ label: "Timeline", value: "timeline" },
];

const TAB_LABELS: Record<string, string> = {
	interviews: "Interviews",
	jd: "JD",
	docs: "Documents",
	timeline: "Timeline",
};

export function DetailPage({ app }: DetailPageProps) {
	const [activeTab, setActiveTab] = useState("overview");

	return (
		<div className="min-h-full">
			<DetailHero app={app} />
			<div className="px-6 py-4">
				<TabBar
					variant="underline"
					items={TAB_ITEMS}
					active={activeTab}
					onChange={setActiveTab}
				/>
				<div className="mt-4">
					{activeTab === "overview" ? (
						<OverviewTab app={app} />
					) : (
						<PlaceholderTab
							name={TAB_LABELS[activeTab] ?? activeTab}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
