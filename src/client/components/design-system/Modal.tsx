import { type ReactNode, useEffect } from "react";

interface ModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
	useEffect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-40 flex items-center justify-center p-4 md:items-center md:p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			onKeyDown={() => {}}
			role="presentation"
		>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/30" />

			{/* Desktop: centered glass card, Mobile: bottom sheet */}
			<div className="relative z-50 w-full max-w-md md:mx-auto">
				{/* Mobile bottom sheet positioning */}
				<div className="fixed inset-x-0 bottom-0 md:static md:inset-auto">
					<div className="glass rounded-t-[var(--radius-modal)] md:rounded-[var(--radius-modal)] p-6 shadow-lg">
						{/* Grab handle (mobile only) */}
						<div className="mb-4 flex justify-center md:hidden">
							<div className="h-1 w-8 rounded-full bg-black/10 dark:bg-white/10" />
						</div>

						{/* Header */}
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-lg font-semibold text-text-primary dark:text-dark-accent">
								{title}
							</h2>
						</div>

						{/* Content */}
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}
