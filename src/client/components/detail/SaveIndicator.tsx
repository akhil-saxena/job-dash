interface SaveIndicatorProps {
	isPending: boolean;
	hasUnsaved?: boolean;
}

export function SaveIndicator({ isPending, hasUnsaved = false }: SaveIndicatorProps) {
	if (isPending) {
		return <span className="text-[10px] text-text-muted dark:text-dark-accent/40">Saving...</span>;
	}
	if (!hasUnsaved) {
		return <span className="text-[10px] text-green-600 dark:text-green-400">Saved</span>;
	}
	return null;
}
