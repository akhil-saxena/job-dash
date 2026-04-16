import type { ReactNode } from "react";

interface AuthLayoutProps {
	children: ReactNode;
	title: string;
	subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<h1 className="text-2xl font-bold text-stone-800">JobDash</h1>
					<h2 className="mt-2 text-lg font-medium text-stone-700">{title}</h2>
					{subtitle && (
						<p className="mt-1 text-sm text-stone-500">{subtitle}</p>
					)}
				</div>
				<div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
					{children}
				</div>
			</div>
		</div>
	);
}
