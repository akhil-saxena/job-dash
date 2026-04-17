interface CompanyBadgeProps {
	companyName: string;
	size?: "sm" | "lg"; // sm=24px (desktop), lg=36px (mobile)
}

const BADGE_COLORS = [
	"#ef4444",
	"#f97316",
	"#f59e0b",
	"#84cc16",
	"#22c55e",
	"#14b8a6",
	"#06b6d4",
	"#3b82f6",
	"#6366f1",
	"#8b5cf6",
	"#a855f7",
	"#ec4899",
];

/** Deterministic color from company name using hash function (12 distinct colors) */
function getCompanyColor(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
}

export function CompanyBadge({ companyName, size = "sm" }: CompanyBadgeProps) {
	const px = size === "sm" ? 24 : 36;
	const color = getCompanyColor(companyName);
	const initial = companyName.charAt(0).toUpperCase();

	return (
		<div
			className="flex shrink-0 items-center justify-center rounded-md font-semibold text-white"
			style={{
				width: px,
				height: px,
				backgroundColor: color,
				fontSize: px * 0.5,
			}}
		>
			{initial}
		</div>
	);
}
