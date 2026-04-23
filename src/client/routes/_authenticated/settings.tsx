import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsThresholdsSection } from "@/client/components/settings/AnalyticsThresholdsSection";

export const Route = createFileRoute("/_authenticated/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 pb-16 lg:p-6">
			<h1 className="text-[28px] font-semibold leading-tight text-text-primary dark:text-dark-accent">
				Settings
			</h1>
			<AnalyticsThresholdsSection />
		</div>
	);
}
