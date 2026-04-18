import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomTabBar } from "./BottomTabBar";
import { Header } from "./Header";
import { QuickAddModal } from "@/client/components/modals/QuickAddModal";
import { useQuickAdd } from "@/client/hooks/useQuickAdd";

interface AppShellProps {
	children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
	const { isOpen, setOpen } = useQuickAdd();

	return (
		<div className="flex min-h-screen">
			{/* Desktop sidebar */}
			<Sidebar />

			{/* Main content area */}
			<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
				<Header />
				<main
					className="relative flex-1 overflow-y-auto overflow-x-hidden pb-[58px] md:pb-0"
					style={{
						backgroundColor: "#f5f3f0",
						backgroundImage: "radial-gradient(circle, rgba(41,37,36,0.13) 1px, transparent 1.2px)",
						backgroundSize: "16px 16px",
					}}
				>
					{/* Decorative amber arc rings — bottom-right corner */}
					<svg
						className="pointer-events-none fixed bottom-0 right-0 z-0"
						width="1200"
						height="1200"
						viewBox="0 0 1200 1200"
						aria-hidden="true"
					>
						<defs>
							<radialGradient id="arcFade" cx="100%" cy="100%" r="90%">
								<stop offset="0%" stopColor="#f59e0b" stopOpacity="0.20" />
								<stop offset="50%" stopColor="#f59e0b" stopOpacity="0.08" />
								<stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
							</radialGradient>
						</defs>
						<g fill="none" stroke="url(#arcFade)" strokeWidth="1.5">
							<circle cx="1200" cy="1200" r="200" />
							<circle cx="1200" cy="1200" r="340" />
							<circle cx="1200" cy="1200" r="500" />
							<circle cx="1200" cy="1200" r="680" />
							<circle cx="1200" cy="1200" r="880" />
							<circle cx="1200" cy="1200" r="1100" />
						</g>
					</svg>
					<div className="relative z-10">{children}</div>
				</main>
			</div>

			{/* Mobile bottom tab bar */}
			<BottomTabBar />

			{/* Quick-add modal (accessible from any authenticated page) */}
			<QuickAddModal open={isOpen} onClose={() => setOpen(false)} />
		</div>
	);
}
