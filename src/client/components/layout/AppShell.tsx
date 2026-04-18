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
					className="relative flex-1 overflow-y-auto pb-[58px] md:pb-0"
					style={{
						backgroundColor: "#f5f3f0",
						backgroundImage: "radial-gradient(circle, rgba(41,37,36,0.13) 1px, transparent 1.2px)",
						backgroundSize: "16px 16px",
					}}
				>
					{/* Decorative amber arc rings — fixed to viewport bottom-right */}
					<div
						className="pointer-events-none fixed bottom-0 right-0 z-0 h-screen w-screen"
						aria-hidden="true"
					>
						<svg
							className="absolute bottom-0 right-0"
							width="100%"
							height="100%"
							viewBox="0 0 1000 1000"
							preserveAspectRatio="xMaxYMax meet"
						>
							<g fill="none" stroke="#f59e0b" strokeWidth="1">
								<circle cx="1000" cy="1000" r="150" opacity="0.18" />
								<circle cx="1000" cy="1000" r="280" opacity="0.14" />
								<circle cx="1000" cy="1000" r="420" opacity="0.11" />
								<circle cx="1000" cy="1000" r="580" opacity="0.08" />
								<circle cx="1000" cy="1000" r="760" opacity="0.06" />
								<circle cx="1000" cy="1000" r="960" opacity="0.04" />
							</g>
						</svg>
					</div>
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
