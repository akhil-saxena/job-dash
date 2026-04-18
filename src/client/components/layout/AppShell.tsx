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
						backgroundImage: [
							"radial-gradient(circle at 100% 100%, transparent 199px, rgba(245,158,11,0.10) 200px 201px, transparent 202px)",
							"radial-gradient(circle at 100% 100%, transparent 339px, rgba(245,158,11,0.09) 340px 341px, transparent 342px)",
							"radial-gradient(circle at 100% 100%, transparent 479px, rgba(245,158,11,0.08) 480px 481px, transparent 482px)",
							"radial-gradient(circle at 100% 100%, transparent 619px, rgba(245,158,11,0.07) 620px 621px, transparent 622px)",
							"radial-gradient(circle, rgba(41,37,36,0.13) 1px, transparent 1.2px)",
						].join(", "),
						backgroundSize: "100% 100%, 100% 100%, 100% 100%, 100% 100%, 16px 16px",
						backgroundAttachment: "fixed",
					}}
				>
					{children}
				</main>
			</div>

			{/* Mobile bottom tab bar */}
			<BottomTabBar />

			{/* Quick-add modal (accessible from any authenticated page) */}
			<QuickAddModal open={isOpen} onClose={() => setOpen(false)} />
		</div>
	);
}
