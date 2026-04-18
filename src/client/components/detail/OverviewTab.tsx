import { useState, useRef, useCallback, useEffect } from "react";
import { Input } from "@/client/components/design-system/Input";
import { Card } from "@/client/components/design-system/Card";
import { useUpdateApplication } from "@/client/hooks/useApplications";
import { LOCATION_TYPES } from "@/shared/constants";
import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";

interface OverviewTabProps {
	app: ApplicationDetail;
}

/**
 * Simple debounce hook using useRef + setTimeout.
 * Returns a stable callback that debounces the given function.
 */
function useDebouncedMutate(
	mutate: (fields: Record<string, unknown>) => void,
	delay = 500,
) {
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const debouncedMutate = useCallback(
		(fields: Record<string, unknown>) => {
			if (timerRef.current) clearTimeout(timerRef.current);
			timerRef.current = setTimeout(() => {
				mutate(fields);
			}, delay);
		},
		[mutate, delay],
	);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	return debouncedMutate;
}

function formatDateForInput(value: number | string | null | undefined): string {
	if (!value) return "";
	try {
		// Could be epoch seconds (number) or ISO string
		const d = typeof value === "number" ? new Date(value * 1000) : new Date(value);
		if (Number.isNaN(d.getTime())) return "";
		return d.toISOString().split("T")[0];
	} catch {
		return "";
	}
}

export function OverviewTab({ app }: OverviewTabProps) {
	const updateApplication = useUpdateApplication();

	// Local state for fields, initialized from app data
	const [jobPostingUrl, setJobPostingUrl] = useState(
		app.jobPostingUrl || "",
	);
	const [locationType, setLocationType] = useState(app.locationType || "");
	const [locationCity, setLocationCity] = useState(app.locationCity || "");
	const [salaryMin, setSalaryMin] = useState(
		app.salaryMin != null ? String(app.salaryMin) : "",
	);
	const [salaryMax, setSalaryMax] = useState(
		app.salaryMax != null ? String(app.salaryMax) : "",
	);
	const [salaryCurrency, setSalaryCurrency] = useState(
		app.salaryCurrency || "USD",
	);
	const [source, setSource] = useState(app.source || "");
	const [appliedAt, setAppliedAt] = useState(
		formatDateForInput(app.appliedAt),
	);
	const [notes, setNotes] = useState(app.notes || "");

	const doMutate = useCallback(
		(fields: Record<string, unknown>) => {
			updateApplication.mutate({ id: app.id, slug: app.slug, ...fields });
		},
		[updateApplication, app.id, app.slug],
	);

	const debouncedMutate = useDebouncedMutate(doMutate, 500);

	// Handlers for text fields (debounced)
	const handleJobPostingUrl = (val: string) => {
		setJobPostingUrl(val);
		debouncedMutate({ jobPostingUrl: val || null });
	};

	const handleLocationCity = (val: string) => {
		setLocationCity(val);
		debouncedMutate({ locationCity: val || null });
	};

	const handleSalaryMin = (val: string) => {
		setSalaryMin(val);
		debouncedMutate({ salaryMin: val ? Number(val) : null });
	};

	const handleSalaryMax = (val: string) => {
		setSalaryMax(val);
		debouncedMutate({ salaryMax: val ? Number(val) : null });
	};

	const handleSalaryCurrency = (val: string) => {
		setSalaryCurrency(val);
		debouncedMutate({ salaryCurrency: val || "USD" });
	};

	const handleSource = (val: string) => {
		setSource(val);
		debouncedMutate({ source: val || null });
	};

	const handleNotes = (val: string) => {
		setNotes(val);
		debouncedMutate({ notes: val || null });
	};

	// Handlers for selects/date (immediate)
	const handleLocationType = (val: string) => {
		setLocationType(val);
		doMutate({ locationType: val || null });
	};

	const handleAppliedAt = (val: string) => {
		setAppliedAt(val);
		if (!val) return;
		try {
			const d = new Date(val);
			if (Number.isNaN(d.getTime())) return;
			doMutate({ appliedAt: d.toISOString() });
		} catch {
			// Invalid date — ignore
		}
	};

	const selectClasses =
		"block w-full px-3 py-2 text-text-primary dark:text-dark-accent placeholder:text-text-muted dark:placeholder:text-dark-accent/40 focus:outline-none focus:ring-2 focus:ring-surface-accent/20 focus:border-surface-accent/40 dark:focus:ring-dark-accent/20 dark:focus:border-dark-accent/40 transition-colors rounded-[var(--radius-input)] glass border-white/30 dark:border-white/10";

	return (
		<div className="space-y-6">
			<div className="grid gap-6 md:grid-cols-2">
				{/* Left: editable fields */}
				<div className="space-y-4">
					<div className="space-y-1.5">
						<label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary dark:text-dark-accent/60">
							Job Posting URL
						</label>
						<div className="flex gap-2">
							<Input
								variant="glass"
								value={jobPostingUrl}
								onChange={(e) =>
									handleJobPostingUrl(
										(e.target as HTMLInputElement).value,
									)
								}
								placeholder="https://greenhouse.io/..."
							/>
							{jobPostingUrl && (
								<a
									href={jobPostingUrl.startsWith("http") ? jobPostingUrl : `https://${jobPostingUrl}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex h-[38px] shrink-0 items-center gap-1.5 rounded-[var(--radius-input)] border border-white/30 bg-white/50 px-3 text-xs font-semibold text-text-secondary transition-colors hover:bg-white/70 hover:text-text-primary dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
									onClick={(e) => e.stopPropagation()}
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
									Visit
								</a>
							)}
						</div>
						{jobPostingUrl && (
							<p className="truncate text-[10px] text-text-muted dark:text-dark-accent/40">
								{(() => { try { return new URL(jobPostingUrl.startsWith("http") ? jobPostingUrl : `https://${jobPostingUrl}`).hostname; } catch { return jobPostingUrl; } })()}
							</p>
						)}
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<label
								htmlFor="location-type"
								className="block text-xs font-semibold uppercase tracking-wide text-text-secondary dark:text-dark-accent/60"
							>
								Location Type
							</label>
							<select
								id="location-type"
								value={locationType}
								onChange={(e) =>
									handleLocationType(e.target.value)
								}
								className={selectClasses}
							>
								<option value="">Select...</option>
								{LOCATION_TYPES.map((lt) => (
									<option key={lt} value={lt}>
										{lt.charAt(0).toUpperCase() + lt.slice(1)}
									</option>
								))}
							</select>
						</div>
						<Input
							label="City"
							variant="glass"
							value={locationCity}
							onChange={(e) =>
								handleLocationCity(
									(e.target as HTMLInputElement).value,
								)
							}
							placeholder="Mountain View"
						/>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<Input
							label="Salary Min"
							type="number"
							variant="glass"
							value={salaryMin}
							onChange={(e) =>
								handleSalaryMin(
									(e.target as HTMLInputElement).value,
								)
							}
							placeholder="120000"
						/>
						<Input
							label="Salary Max"
							type="number"
							variant="glass"
							value={salaryMax}
							onChange={(e) =>
								handleSalaryMax(
									(e.target as HTMLInputElement).value,
								)
							}
							placeholder="180000"
						/>
						<Input
							label="Currency"
							variant="glass"
							value={salaryCurrency}
							onChange={(e) =>
								handleSalaryCurrency(
									(e.target as HTMLInputElement).value,
								)
							}
							placeholder="USD"
						/>
					</div>
					<Input
						label="Source"
						variant="glass"
						value={source}
						onChange={(e) =>
							handleSource(
								(e.target as HTMLInputElement).value,
							)
						}
						placeholder="LinkedIn, Referral, etc."
					/>
					<Input
						label="Applied Date"
						type="date"
						variant="glass"
						value={appliedAt}
						onChange={(e) =>
							handleAppliedAt(
								(e.target as HTMLInputElement).value,
							)
						}
					/>
				</div>

				{/* Right: notes textarea */}
				<div>
					<Input
						as="textarea"
						label="Notes"
						variant="glass"
						hint="**bold** *italic* - lists `code`"
						value={notes}
						onChange={(e) =>
							handleNotes(
								(e.target as HTMLTextAreaElement).value,
							)
						}
						className="min-h-[300px]"
					/>
				</div>
			</div>

			{/* Company research placeholder (per D-10) */}
			<Card padding="p-4">
				<p className="text-xs text-text-muted dark:text-dark-accent/40">
					Company research notes will be available in Phase 6.
				</p>
			</Card>
		</div>
	);
}
