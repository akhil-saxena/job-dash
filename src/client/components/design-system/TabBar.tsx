interface TabItem {
	label: string;
	value: string;
	count?: number;
}

interface TabBarProps {
	items: TabItem[];
	active: string;
	onChange: (value: string) => void;
	variant?: "underline" | "chip";
}

export function TabBar({
	items,
	active,
	onChange,
	variant = "underline",
}: TabBarProps) {
	return (
		<div
			className="flex gap-1 overflow-x-auto"
			style={{
				scrollbarWidth: "none",
				WebkitOverflowScrolling: "touch",
			}}
		>
			{items.map((item) => {
				const isActive = item.value === active;

				if (variant === "chip") {
					return (
						<button
							key={item.value}
							type="button"
							onClick={() => onChange(item.value)}
							className={`shrink-0 rounded-[var(--radius-btn)] px-3 py-1.5 text-sm transition-colors ${
								isActive
									? "bg-black/[0.06] font-semibold text-text-primary dark:bg-white/[0.08] dark:text-dark-accent"
									: "text-text-muted hover:bg-black/[0.03] dark:text-dark-accent/50 dark:hover:bg-white/[0.04]"
							}`}
						>
							{item.label}
							{item.count != null ? (
								<span className="ml-1 text-xs opacity-60">{item.count}</span>
							) : null}
						</button>
					);
				}

				// underline (default)
				return (
					<button
						key={item.value}
						type="button"
						onClick={() => onChange(item.value)}
						className={`shrink-0 border-b-2 px-3 pb-2 pt-1 text-sm transition-colors ${
							isActive
								? "border-surface-accent font-semibold text-text-primary dark:border-dark-accent dark:text-dark-accent"
								: "border-transparent text-text-muted hover:text-text-secondary dark:text-dark-accent/50 dark:hover:text-dark-accent/70"
						}`}
					>
						{item.label}
						{item.count != null ? (
							<span className="ml-1 text-xs opacity-60">{item.count}</span>
						) : null}
					</button>
				);
			})}
		</div>
	);
}
