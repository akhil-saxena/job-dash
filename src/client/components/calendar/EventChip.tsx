import { Link } from "@tanstack/react-router";

export type EventChipKind = "interview" | "deadline";

export type DeadlineChipType =
	| "application_close"
	| "offer_expiry"
	| "follow_up"
	| "custom";

interface EventChipProps {
	kind: EventChipKind;
	/** Deadline type — ignored when kind === "interview". */
	deadlineType?: DeadlineChipType | string;
	label: string;
	time?: string;
	slug: string;
	isPast: boolean;
}

// UI-SPEC § "Calendar event chip colors (D-05)"
const INTERVIEW_HEX = "#3b82f6"; // blue
const DEADLINE_PAST_HEX = "#ef4444"; // red — any past deadline

const DEADLINE_HEX: Record<string, string> = {
	application_close: "#f59e0b", // amber
	offer_expiry: "#22c55e", // green
	follow_up: "#8b5cf6", // violet
	custom: "#64748b", // slate
};

// Converts #rrggbb → "r, g, b" so we can compose rgba(..., alpha) strings
// matching the UI-SPEC ("chip bg rgba(..., 0.12)", "border rgba(..., 0.20)").
function hexToRgb(hex: string): string {
	const h = hex.replace("#", "");
	const r = Number.parseInt(h.slice(0, 2), 16);
	const g = Number.parseInt(h.slice(2, 4), 16);
	const b = Number.parseInt(h.slice(4, 6), 16);
	return `${r}, ${g}, ${b}`;
}

function resolveColor(
	kind: EventChipKind,
	deadlineType: string | undefined,
	isPast: boolean,
): string {
	if (kind === "interview") return INTERVIEW_HEX;
	if (isPast) return DEADLINE_PAST_HEX;
	return (
		(deadlineType && DEADLINE_HEX[deadlineType]) ?? DEADLINE_HEX.custom
	);
}

export function EventChip({
	kind,
	deadlineType,
	label,
	time,
	slug,
	isPast,
}: EventChipProps) {
	const hex = resolveColor(kind, deadlineType, isPast);
	const rgb = hexToRgb(hex);
	const tab = kind === "interview" ? "interviews" : "overview";

	// Past interviews keep the blue hue but render at 70% opacity per UI-SPEC.
	// Past deadlines already got the red override; keep them at 70% too as a
	// secondary "past" cue on top of the red colour.
	const pastDim = isPast ? "opacity-70" : "";

	const chipStyle: React.CSSProperties = {
		backgroundColor: `rgba(${rgb}, 0.12)`,
		borderColor: `rgba(${rgb}, 0.20)`,
		color: hex,
	};
	const dotStyle: React.CSSProperties = { backgroundColor: hex };

	const describedById = isPast ? `past-${kind}-${slug}` : undefined;

	return (
		<Link
			to="/app/$slug"
			params={{ slug }}
			search={{ tab } as any}
			className={`group inline-flex h-5 w-full items-center gap-1 truncate rounded-[var(--radius-pill)] border px-2 text-xs font-medium transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-surface-accent/40 dark:focus-visible:ring-dark-accent/40 ${pastDim}`}
			style={chipStyle}
			aria-describedby={describedById}
		>
			<span
				className="inline-block h-2 w-2 flex-none rounded-full"
				style={dotStyle}
				aria-hidden="true"
			/>
			{time ? (
				<span className="flex-none tabular-nums opacity-80">{time}</span>
			) : null}
			<span className="truncate">{label}</span>
			{isPast ? (
				<span id={describedById} className="sr-only">
					Past event
				</span>
			) : null}
		</Link>
	);
}
