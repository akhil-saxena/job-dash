import { Search } from "lucide-react";

interface SearchBarProps {
	variant?: "glass" | "raised";
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
}

const variantClasses: Record<string, string> = {
	glass: "glass border-white/30 dark:border-white/10",
	raised:
		"bg-white/80 dark:bg-dark-card/80 shadow-sm border border-black/[0.06] dark:border-white/10",
};

export function SearchBar({
	variant = "glass",
	placeholder = "Search...",
	value,
	onChange,
}: SearchBarProps) {
	return (
		<div
			className={`flex items-center gap-2 rounded-[var(--radius-input)] px-3 py-2 ${variantClasses[variant]}`}
		>
			<Search
				size={16}
				strokeWidth={1.8}
				className="shrink-0 text-text-muted dark:text-dark-accent/40"
			/>
			<input
				id="global-search"
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange?.(e.target.value)}
				className="flex-1 bg-transparent text-sm text-text-primary dark:text-dark-accent placeholder:text-text-muted dark:placeholder:text-dark-accent/40 focus:outline-none"
			/>
			<kbd className="hidden shrink-0 rounded border border-black/10 bg-black/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-text-muted dark:border-white/10 dark:bg-white/[0.04] dark:text-dark-accent/40 sm:inline-block">
				⌘K
			</kbd>
		</div>
	);
}
