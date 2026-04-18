import type { ReactNode } from "react";

interface AuthLayoutProps {
	children: ReactNode;
	title: string;
	subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f5f3f0] via-[#ece8e3] to-[#e8e4df] px-4">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<img src="/logo-lockup.svg" alt="JobDash" className="mx-auto mb-4 h-10" />
					<h2 className="text-lg font-semibold text-text-primary">{title}</h2>
					{subtitle && (
						<p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
					)}
				</div>
				<div className="glass rounded-[var(--radius-modal)] border border-white/40 p-6 shadow-sm">
					{children}
				</div>
			</div>
		</div>
	);
}
