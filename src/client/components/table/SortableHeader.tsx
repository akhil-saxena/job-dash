import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortableHeaderProps {
	label: string;
	field: string;
	activeSort: string | undefined;
	activeOrder: string | undefined;
	onSort: (field: string) => void;
}

export function SortableHeader({
	label,
	field,
	activeSort,
	activeOrder,
	onSort,
}: SortableHeaderProps) {
	const isActive = activeSort === field;

	return (
		<th
			className="cursor-pointer select-none px-3 py-2.5 text-left"
			onClick={() => onSort(field)}
		>
			<span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-text-secondary dark:text-dark-accent/60">
				{label}
				{isActive && activeOrder === "asc" ? (
					<ArrowUp size={12} strokeWidth={1.8} className="shrink-0" />
				) : isActive && activeOrder === "desc" ? (
					<ArrowDown size={12} strokeWidth={1.8} className="shrink-0" />
				) : (
					<ArrowUpDown
						size={12}
						strokeWidth={1.8}
						className="shrink-0 opacity-40"
					/>
				)}
			</span>
		</th>
	);
}
