interface PlaceholderTabProps {
	name: string;
}

export function PlaceholderTab({ name }: PlaceholderTabProps) {
	return (
		<div className="py-12 text-center">
			<p className="text-sm text-text-muted dark:text-dark-accent/40">
				{name} tab coming soon.
			</p>
		</div>
	);
}
