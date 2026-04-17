interface FilterChipItem {
	label: string;
	value: string;
	count?: number;
}

interface FilterChipsProps {
	items: FilterChipItem[];
	active: string;
	onChange: (value: string) => void;
	variant?: "tab" | "outlined" | "underline";
}

export function FilterChips({
	items,
	active,
	onChange,
	variant = "tab",
}: FilterChipsProps) {
	return (
		<div className="flex gap-2 overflow-x-auto scrollbar-none">
			{items.map((item) => {
				const isActive = item.value === active;

				if (variant === "underline") {
					return (
						<button
							key={item.value}
							type="button"
							onClick={() => onChange(item.value)}
							className={`shrink-0 border-b-2 px-2 py-1.5 text-xs font-semibold transition-colors ${
								isActive
									? "border-surface-accent text-text-primary dark:border-dark-accent dark:text-dark-accent"
									: "border-transparent text-text-muted hover:text-text-secondary dark:text-dark-accent/50 dark:hover:text-dark-accent/70"
							}`}
						>
							{item.label}
							{item.count != null ? (
								<span className="ml-1 text-text-muted dark:text-dark-accent/40">
									{item.count}
								</span>
							) : null}
						</button>
					);
				}

				if (variant === "outlined") {
					return (
						<button
							key={item.value}
							type="button"
							onClick={() => onChange(item.value)}
							className={`shrink-0 rounded-[var(--radius-pill)] border px-3 py-1 text-xs font-semibold transition-colors ${
								isActive
									? "border-surface-accent/40 bg-black/[0.04] text-text-primary dark:border-dark-accent/30 dark:bg-white/[0.06] dark:text-dark-accent"
									: "border-black/10 text-text-secondary hover:border-black/20 dark:border-white/10 dark:text-dark-accent/60 dark:hover:border-white/20"
							}`}
						>
							{item.label}
							{item.count != null ? (
								<span className="ml-1 opacity-60">{item.count}</span>
							) : null}
						</button>
					);
				}

				// tab (default)
				return (
					<button
						key={item.value}
						type="button"
						onClick={() => onChange(item.value)}
						className={`shrink-0 rounded-[var(--radius-btn)] px-3 py-1.5 text-xs font-semibold transition-colors ${
							isActive
								? "bg-black/[0.06] text-text-primary dark:bg-white/[0.08] dark:text-dark-accent"
								: "text-text-secondary hover:bg-black/[0.03] dark:text-dark-accent/60 dark:hover:bg-white/[0.04]"
						}`}
					>
						{item.label}
						{item.count != null ? (
							<span className="ml-1 opacity-60">{item.count}</span>
						) : null}
					</button>
				);
			})}
		</div>
	);
}
