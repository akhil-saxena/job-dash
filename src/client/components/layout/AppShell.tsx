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
			<div className="flex flex-1 flex-col">
				<Header />
				<main className="flex-1 pb-[58px] md:pb-0">{children}</main>
			</div>

			{/* Mobile bottom tab bar */}
			<BottomTabBar />

			{/* Quick-add modal (accessible from any authenticated page) */}
			<QuickAddModal open={isOpen} onClose={() => setOpen(false)} />
		</div>
	);
}
