import { useState, type TextareaHTMLAttributes } from "react";
import Markdown from "react-markdown";
import { Pencil, Eye } from "lucide-react";

type Mode = "edit" | "preview";

type MarkdownFieldBaseProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	minHeight?: string;
	/** If true, preview is the default view when value is non-empty. */
	previewByDefault?: boolean;
	/** Tone: 'amber' (detail pages) or 'accent' (design-system default). */
	tone?: "amber" | "accent";
	/** Empty-state copy for preview mode. */
	emptyLabel?: string;
};

type MarkdownFieldProps = MarkdownFieldBaseProps &
	Omit<
		TextareaHTMLAttributes<HTMLTextAreaElement>,
		keyof MarkdownFieldBaseProps | "onChange" | "value"
	>;

/**
 * MarkdownField — a textarea with an explicit Edit/Preview toggle and
 * rendered markdown preview. Parents remain responsible for save state,
 * debouncing, dirty-tracking, and the card/section framing around it.
 *
 * Use this everywhere a user can write markdown notes: Overview notes,
 * Company Research notes, Interview Experience/Feedback, Q&A answers.
 */
export function MarkdownField({
	value,
	onChange,
	placeholder,
	minHeight = "120px",
	previewByDefault = true,
	tone = "amber",
	emptyLabel = "Nothing yet.",
	className = "",
	...textareaProps
}: MarkdownFieldProps) {
	const hasContent = !!value.trim();
	const [mode, setMode] = useState<Mode>(
		previewByDefault && hasContent ? "preview" : "edit",
	);

	const toneActive =
		tone === "amber"
			? "bg-amber-500 text-white"
			: "bg-surface-accent text-white dark:bg-dark-accent dark:text-dark-dominant";

	const toneInactive =
		"bg-transparent text-text-muted hover:text-text-secondary dark:text-dark-accent/50 dark:hover:text-dark-accent/70";

	const focusBorder =
		tone === "amber"
			? "focus:border-amber-400 dark:focus:border-amber-500"
			: "focus:border-surface-accent/40 dark:focus:border-dark-accent/40";

	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			{/* Mode toggle — compact segmented control */}
			<div className="flex items-center gap-1 self-start rounded-[var(--radius-btn)] bg-black/[0.04] p-0.5 dark:bg-white/[0.06]">
				<button
					type="button"
					onClick={() => setMode("edit")}
					className={`flex items-center gap-1 rounded-[calc(var(--radius-btn)-2px)] px-2 py-1 text-[11px] font-semibold transition-colors ${
						mode === "edit" ? toneActive : toneInactive
					}`}
					aria-pressed={mode === "edit"}
				>
					<Pencil size={11} />
					Edit
				</button>
				<button
					type="button"
					onClick={() => setMode("preview")}
					className={`flex items-center gap-1 rounded-[calc(var(--radius-btn)-2px)] px-2 py-1 text-[11px] font-semibold transition-colors ${
						mode === "preview" ? toneActive : toneInactive
					}`}
					aria-pressed={mode === "preview"}
				>
					<Eye size={11} />
					Preview
				</button>
			</div>

			{/* Content area */}
			{mode === "edit" ? (
				<>
					<textarea
						value={value}
						onChange={(e) => onChange(e.target.value)}
						placeholder={placeholder}
						className={`w-full rounded-lg border border-dashed border-black/[0.12] bg-transparent p-3 text-sm leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:outline-none resize-y dark:border-white/[0.1] dark:text-dark-accent dark:placeholder:text-dark-accent/30 ${focusBorder}`}
						style={{ minHeight }}
						{...textareaProps}
					/>
					<div
						className="text-[10px] text-text-muted dark:text-dark-accent/40"
						style={{ fontFamily: "var(--mono, monospace)" }}
					>
						**bold** *italic* - lists `code` — markdown supported
					</div>
				</>
			) : hasContent ? (
				<div
					className="jd-markdown prose prose-sm max-w-none rounded-lg border border-black/[0.06] bg-white/40 p-3 text-sm leading-relaxed text-text-primary dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-dark-accent dark:prose-invert"
					style={{ minHeight }}
				>
					<Markdown>{value}</Markdown>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setMode("edit")}
					className="flex items-center justify-center rounded-lg border border-dashed border-black/[0.12] bg-transparent p-6 text-sm text-text-muted transition-colors hover:border-amber-300 hover:text-text-secondary dark:border-white/[0.1] dark:text-dark-accent/40 dark:hover:border-amber-500/40"
					style={{ minHeight }}
				>
					{emptyLabel}
				</button>
			)}
		</div>
	);
}
