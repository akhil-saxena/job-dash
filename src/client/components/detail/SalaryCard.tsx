import { useState, useCallback } from "react";
import { useUpdateApplication } from "@/client/hooks/useApplications";
import { useDebouncedMutate } from "@/client/hooks/useDebouncedMutate";
import { SaveIndicator } from "./SaveIndicator";
import { SALARY_CURRENCIES } from "@/shared/constants";
import type { ApplicationDetail } from "@/client/hooks/useApplicationDetail";

interface SalaryCardProps {
	app: ApplicationDetail;
}

export function SalaryCard({ app }: SalaryCardProps) {
	const updateApplication = useUpdateApplication();

	// Local state for all salary fields
	const [currency, setCurrency] = useState(app.salaryCurrency || "USD");
	const [salaryMin, setSalaryMin] = useState<string>(app.salaryMin != null ? String(app.salaryMin) : "");
	const [salaryMax, setSalaryMax] = useState<string>(app.salaryMax != null ? String(app.salaryMax) : "");
	const [salaryOffered, setSalaryOffered] = useState<string>(app.salaryOffered != null ? String(app.salaryOffered) : "");
	const [equity, setEquity] = useState(app.equity ?? "");
	const [bonus, setBonus] = useState(app.bonus ?? "");
	const [dirty, setDirty] = useState(false);

	const doMutate = useCallback(
		(fields: Record<string, unknown>) => {
			updateApplication.mutate({ id: app.id, slug: app.slug, ...fields }, {
				onSuccess: () => setDirty(false),
			});
		},
		[updateApplication, app.id, app.slug],
	);
	const debouncedMutate = useDebouncedMutate(doMutate);

	const handleCurrency = (val: string) => {
		setCurrency(val);
		setDirty(true);
		debouncedMutate({ salaryCurrency: val });
	};

	const handleNumber = (setter: (v: string) => void, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setter(val);
		setDirty(true);
		const num = val === "" ? null : Number(val);
		debouncedMutate({ [field]: num });
	};

	const handleText = (setter: (v: string) => void, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setter(val);
		setDirty(true);
		debouncedMutate({ [field]: val || null });
	};

	const inputClass = "rounded-lg border border-black/[0.1] bg-white/50 px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted/50 focus:border-amber-400 focus:outline-none dark:border-white/[0.1] dark:bg-zinc-800/50 dark:text-dark-accent dark:placeholder:text-dark-accent/30";

	return (
		<div className="rounded-[14px] bg-white/55 backdrop-blur-[14px] border border-white/50 p-5 dark:bg-zinc-800/50 dark:border-white/10">
			{/* Header */}
			<div className="mb-4 flex items-center gap-2">
				<span className="inline-block h-[15px] w-[4px] rounded-sm bg-amber-500" />
				<span className="text-[13px] font-bold tracking-tight text-text-secondary dark:text-dark-accent/60">Compensation</span>
				{(dirty || updateApplication.isPending) && (
					<SaveIndicator isPending={updateApplication.isPending} hasUnsaved={dirty} />
				)}
			</div>

			{/* Currency + Min/Max row */}
			<div className="grid grid-cols-[100px_1fr_auto_1fr] items-center gap-2 mb-3">
				<select
					value={currency}
					onChange={(e) => handleCurrency(e.target.value)}
					className={inputClass}
				>
					{SALARY_CURRENCIES.map((c) => (
						<option key={c} value={c}>{c}</option>
					))}
				</select>
				<input
					type="number"
					min={0}
					value={salaryMin}
					onChange={handleNumber(setSalaryMin, "salaryMin")}
					placeholder="Min"
					className={inputClass}
				/>
				<span className="text-[13px] text-text-muted dark:text-dark-accent/40">&ndash;</span>
				<input
					type="number"
					min={0}
					value={salaryMax}
					onChange={handleNumber(setSalaryMax, "salaryMax")}
					placeholder="Max"
					className={inputClass}
				/>
			</div>

			{/* Offered row */}
			<div className="mb-3">
				<label className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40">
					Offered
				</label>
				<input
					type="number"
					min={0}
					value={salaryOffered}
					onChange={handleNumber(setSalaryOffered, "salaryOffered")}
					placeholder="Offered amount"
					className={`${inputClass} w-full`}
				/>
			</div>

			{/* Equity + Bonus row */}
			<div className="grid grid-cols-2 gap-3">
				<div>
					<label className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40">
						Equity
					</label>
					<input
						type="text"
						value={equity}
						onChange={handleText(setEquity, "equity")}
						placeholder="e.g., 0.05% over 4 years"
						className={`${inputClass} w-full`}
					/>
				</div>
				<div>
					<label className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-accent/40">
						Bonus
					</label>
					<input
						type="text"
						value={bonus}
						onChange={handleText(setBonus, "bonus")}
						placeholder="e.g., 20K signing bonus"
						className={`${inputClass} w-full`}
					/>
				</div>
			</div>
		</div>
	);
}
