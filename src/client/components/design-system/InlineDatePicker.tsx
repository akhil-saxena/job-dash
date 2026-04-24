import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DateEvent {
	date: string; // YYYY-MM-DD
	label: string;
}

interface InlineDatePickerProps {
	/** Current value in YYYY-MM-DD (optional). */
	value?: string;
	/** Called with YYYY-MM-DD when the user picks a date. */
	onChange: (value: string) => void;
	/** Optional events indexed by YYYY-MM-DD — shown as a dot in the day cell. */
	events?: DateEvent[];
	/** ISO today string (defaults to current local date). Useful for tests. */
	today?: string;
	label?: string;
	placeholder?: string;
	className?: string;
}

function toISODate(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

function fromISODate(s: string): Date | null {
	const [y, m, d] = s.split("-").map(Number);
	if (!y || !m || !d) return null;
	return new Date(y, m - 1, d);
}

function monthLabel(d: Date): string {
	return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatInput(iso: string | undefined): string {
	if (!iso) return "";
	const d = fromISODate(iso);
	if (!d) return iso;
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Inline popover date picker — click-through calendar with amber today/
 * selected highlight and optional event dots. Pairs with the styled
 * read-only input per the DS reference.
 *
 * For a keyboard-first / natively-accessible date input, prefer
 * `DateField` which wraps `<input type="date">`. Use `InlineDatePicker`
 * for richer picker UX (multi-event month, range-like flows) or when a
 * consistent custom look across every browser matters.
 */
export function InlineDatePicker({
	value,
	onChange,
	events = [],
	today = toISODate(new Date()),
	label,
	placeholder = "Pick a date",
	className = "",
}: InlineDatePickerProps) {
	const [open, setOpen] = useState(false);
	const [viewMonth, setViewMonth] = useState<Date>(() =>
		value ? fromISODate(value) ?? new Date() : new Date(),
	);
	const wrapRef = useRef<HTMLDivElement | null>(null);

	// Close on outside click
	useEffect(() => {
		if (!open) return;
		function onClick(e: MouseEvent) {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", onClick);
		return () => document.removeEventListener("mousedown", onClick);
	}, [open]);

	// Close on Escape
	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open]);

	const eventsByDate = useMemo(() => {
		const map: Record<string, string> = {};
		for (const e of events) map[e.date] = e.label;
		return map;
	}, [events]);

	const days = useMemo(() => {
		const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
		const last = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
		const leadBlanks = first.getDay();
		const arr: Array<Date | null> = [];
		for (let i = 0; i < leadBlanks; i++) arr.push(null);
		for (let d = 1; d <= last.getDate(); d++) {
			arr.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
		}
		return arr;
	}, [viewMonth]);

	const prev = () =>
		setViewMonth(
			(m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
		);
	const next = () =>
		setViewMonth(
			(m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
		);

	const activeEventLabel = value ? eventsByDate[value] : undefined;

	return (
		<div className={`flex flex-col gap-1.5 ${className}`} ref={wrapRef}>
			{label ? <span className="ds-label">{label}</span> : null}
			<div className="relative">
				<button
					type="button"
					onClick={() => setOpen((o) => !o)}
					className={`flex h-[36px] w-full items-center gap-2 rounded-[var(--radius-input)] border bg-white/60 px-3 text-[13px] text-ink transition-colors hover:border-black/[0.15] dark:bg-white/[0.06] dark:text-cream-2 ${open ? "border-amber shadow-[0_0_0_3px_rgba(245,158,11,0.12)]" : "border-black/[0.08] dark:border-white/10"}`}
				>
					<Calendar
						size={14}
						className="text-ink-3 dark:text-ink-4"
						aria-hidden="true"
					/>
					<span className={value ? "font-mono text-[12px]" : "text-ink-4"}>
						{value ? formatInput(value) : placeholder}
					</span>
				</button>
				{open ? (
					<div className="glass absolute left-0 right-0 top-full z-40 mt-1 rounded-[var(--radius-modal)] p-3 shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
						<div className="mb-2 flex items-center justify-between">
							<button
								type="button"
								onClick={prev}
								className="flex h-7 w-7 items-center justify-center rounded-[6px] text-ink-2 transition-colors hover:bg-cream-2 dark:text-cream-2 dark:hover:bg-white/[0.06]"
								aria-label="Previous month"
							>
								<ChevronLeft size={14} />
							</button>
							<span className="font-display text-[13px] font-bold">
								{monthLabel(viewMonth)}
							</span>
							<button
								type="button"
								onClick={next}
								className="flex h-7 w-7 items-center justify-center rounded-[6px] text-ink-2 transition-colors hover:bg-cream-2 dark:text-cream-2 dark:hover:bg-white/[0.06]"
								aria-label="Next month"
							>
								<ChevronRight size={14} />
							</button>
						</div>
						<div className="grid grid-cols-7 gap-0.5">
							{WEEKDAYS.map((w) => (
								<div
									key={w}
									className="pb-1 text-center font-mono text-[9px] font-semibold tracking-wider text-ink-4"
								>
									{w}
								</div>
							))}
							{days.map((d, i) => {
								if (!d)
									return <div key={`blank-${i}`} className="h-8" aria-hidden="true" />;
								const iso = toISODate(d);
								const isSelected = value === iso;
								const isToday = today === iso;
								const hasEvent = !!eventsByDate[iso];
								return (
									<button
										key={iso}
										type="button"
										onClick={() => {
											onChange(iso);
											setOpen(false);
										}}
										className={`relative flex h-8 w-8 items-center justify-center rounded-[6px] text-[12px] transition-colors ${
											isSelected
												? "bg-amber font-bold text-white"
												: isToday
													? "bg-amber-l font-semibold text-amber-d"
													: "text-ink hover:bg-cream-2 dark:text-cream-2 dark:hover:bg-white/[0.06]"
										}`}
										aria-pressed={isSelected}
										aria-label={d.toLocaleDateString("en-US", {
											weekday: "long",
											month: "long",
											day: "numeric",
											year: "numeric",
										})}
									>
										{d.getDate()}
										{hasEvent ? (
											<span
												className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? "bg-white" : "bg-amber"}`}
												aria-hidden="true"
											/>
										) : null}
									</button>
								);
							})}
						</div>
						{activeEventLabel ? (
							<div className="mt-2 rounded-[6px] border border-amber/20 bg-amber-l px-2.5 py-2 font-mono text-[10px] font-semibold text-amber-d">
								{activeEventLabel} · {formatInput(value)}
							</div>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	);
}
