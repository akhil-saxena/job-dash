import type { ReactNode } from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg";

interface AvatarProps {
	/** User-visible name — used as fallback for initials and alt text. */
	name: string;
	/** Optional explicit initials override. If omitted, derived from `name`. */
	initials?: string;
	/** Image URL. When present, takes precedence over initials. */
	src?: string;
	size?: AvatarSize;
	/** Presence dot — positions a small colored dot at the bottom-right. */
	status?: "online" | "away" | "offline";
	className?: string;
	onClick?: () => void;
}

const sizeClasses: Record<AvatarSize, string> = {
	xs: "h-6 w-6 text-[9px]",
	sm: "h-8 w-8 text-[11px]",
	md: "h-10 w-10 text-[13px]",
	lg: "h-12 w-12 text-[15px]",
};

const statusColor: Record<"online" | "away" | "offline", string> = {
	online: "bg-[#22c55e]",
	away: "bg-[#f59e0b]",
	offline: "bg-ink-5",
};

// Deterministic gradient derived from name so the same user always renders
// the same color. Palette picked from the DS reference.
const GRADIENT_POOL: Array<[string, string]> = [
	["#3b82f6", "#1d4ed8"],
	["#8b5cf6", "#6d28d9"],
	["#22c55e", "#15803d"],
	["#f59e0b", "#d97706"],
	["#ef4444", "#b91c1c"],
	["#ec4899", "#be185d"],
	["#06b6d4", "#0e7490"],
	["#c4a484", "#a0826d"],
];

function hashName(name: string): number {
	let h = 0;
	for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i);
	return Math.abs(h);
}

function deriveInitials(name: string): string {
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return "?";
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
	return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function Avatar({
	name,
	initials,
	src,
	size = "md",
	status,
	className = "",
	onClick,
}: AvatarProps) {
	const [from, to] = GRADIENT_POOL[hashName(name) % GRADIENT_POOL.length];
	const displayInitials = initials || deriveInitials(name);
	const statusSize = size === "xs" || size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";

	const base = (
		<span
			className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white ${sizeClasses[size]} ${onClick ? "cursor-pointer transition-opacity hover:opacity-85" : ""} ${className}`}
			style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
			title={name}
			onClick={onClick}
		>
			{src ? (
				<img
					src={src}
					alt={name}
					className="h-full w-full object-cover"
					loading="lazy"
				/>
			) : (
				<span aria-hidden="true">{displayInitials}</span>
			)}
			{status ? (
				<span
					className={`absolute bottom-0 right-0 rounded-full border-2 border-cream ${statusSize} ${statusColor[status]}`}
					aria-label={`status: ${status}`}
				/>
			) : null}
		</span>
	);

	return base;
}

interface AvatarStackProps {
	/** Users to render — first N show, remainder collapsed into "+X" chip. */
	users: Array<{ name: string; src?: string; initials?: string }>;
	max?: number;
	size?: AvatarSize;
	children?: ReactNode;
}

/** Avatar pile-up — overlapping avatars with a "+N" tail when exceeding max. */
export function AvatarStack({
	users,
	max = 4,
	size = "sm",
	children,
}: AvatarStackProps) {
	const shown = users.slice(0, max);
	const rest = users.length - shown.length;
	const offsetClass = size === "xs" ? "-ml-1.5" : size === "sm" ? "-ml-2" : "-ml-2.5";
	const ringClass = "border-2 border-cream dark:border-ink-2";
	const sizeStyle = sizeClasses[size];

	return (
		<div className="inline-flex items-center">
			{shown.map((u, i) => (
				<span
					key={`${u.name}-${i}`}
					className={`${i > 0 ? offsetClass : ""} ${ringClass} rounded-full`}
				>
					<Avatar name={u.name} src={u.src} initials={u.initials} size={size} />
				</span>
			))}
			{rest > 0 ? (
				<span
					className={`${offsetClass} ${ringClass} inline-flex items-center justify-center rounded-full bg-cream-2 font-bold text-ink-3 dark:bg-ink-2 dark:text-cream-2 ${sizeStyle}`}
				>
					+{rest}
				</span>
			) : null}
			{children}
		</div>
	);
}
