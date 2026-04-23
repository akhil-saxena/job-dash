import { useEffect, useState } from "react";
import { Card } from "@/client/components/design-system/Card";
import { Button } from "@/client/components/design-system/Button";
import { ThresholdRow } from "./ThresholdRow";
import {
	useAnalyticsThresholds,
	useResetAnalyticsThresholds,
	useUpdateAnalyticsThresholds,
} from "@/client/hooks/useAnalyticsThresholds";
import { useDebouncedMutate } from "@/client/hooks/useDebouncedMutate";
import type { AnalyticsThresholds } from "@/shared/validators/analytics";

/**
 * Settings > Analytics — threshold editor for the Response Time table colours.
 * One row per stage transition. Debounced save (500ms) on change, immediate
 * save on blur (per UI-SPEC). Reset button confirms via native confirm().
 */
export function AnalyticsThresholdsSection() {
	const { data: thresholds } = useAnalyticsThresholds();
	const update = useUpdateAnalyticsThresholds();
	const reset = useResetAnalyticsThresholds();

	// Local staged values — so partial edits don't flash through every keystroke
	// to the response-time recolour. The debouncedMutate emits the whole object.
	const [staged, setStaged] = useState<AnalyticsThresholds>(thresholds);
	useEffect(() => {
		setStaged(thresholds);
	}, [thresholds]);

	// "Saving…" / "Saved" indicator
	const [indicator, setIndicator] = useState<"idle" | "saving" | "saved">(
		"idle",
	);
	useEffect(() => {
		if (indicator !== "saved") return;
		const t = setTimeout(() => setIndicator("idle"), 1500);
		return () => clearTimeout(t);
	}, [indicator]);

	const debounced = useDebouncedMutate((fields) => {
		setIndicator("saving");
		update.mutate(fields as unknown as AnalyticsThresholds, {
			onSuccess: () => setIndicator("saved"),
			onError: () => setIndicator("idle"),
		});
	}, 500);

	const commit = (next: AnalyticsThresholds) => {
		setStaged(next);
		debounced(next as unknown as Record<string, unknown>);
	};

	const handleReset = () => {
		if (
			typeof window !== "undefined" &&
			window.confirm("Reset analytics thresholds to defaults?")
		) {
			reset.mutate();
		}
	};

	return (
		<div>
			<div className="mb-4 flex items-end justify-between gap-3">
				<div>
					<h2 className="text-xl font-semibold text-text-primary dark:text-dark-accent">
						Analytics
					</h2>
					<p className="mt-1 text-sm text-text-secondary dark:text-dark-accent/70">
						Response-time color thresholds (days)
					</p>
				</div>
				{indicator === "saving" ? (
					<div className="text-xs text-text-muted dark:text-dark-accent/40">
						Saving…
					</div>
				) : indicator === "saved" ? (
					<div className="text-xs text-text-muted dark:text-dark-accent/40">
						Saved
					</div>
				) : null}
			</div>

			<Card padding="p-6">
				<div className="space-y-5">
					<ThresholdRow
						transitionLabel="Applied → Screening"
						threshold={staged.appliedScreening}
						onChange={(next) =>
							commit({ ...staged, appliedScreening: next })
						}
					/>
					<ThresholdRow
						transitionLabel="Screening → Interviewing"
						threshold={staged.screeningInterviewing}
						onChange={(next) =>
							commit({ ...staged, screeningInterviewing: next })
						}
					/>
					<ThresholdRow
						transitionLabel="Interviewing → Offer"
						threshold={staged.interviewingOffer}
						onChange={(next) =>
							commit({ ...staged, interviewingOffer: next })
						}
					/>
					<div className="flex items-center justify-end">
						<Button
							variant="outline"
							size="sm"
							onClick={handleReset}
						>
							Reset defaults
						</Button>
					</div>
				</div>
			</Card>

			<p className="mt-3 text-xs text-text-muted dark:text-dark-accent/40">
				Applied to the Response Time table on the Analytics page. Values
				beyond Amber are Red.
			</p>
		</div>
	);
}
