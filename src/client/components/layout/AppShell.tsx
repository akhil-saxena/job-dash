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

			{/* Main content area — min-w-0 prevents flex child from overflowing viewport */}
			<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
				<Header />
				<main className="flex-1 overflow-y-auto overflow-x-hidden pb-[58px] md:pb-0">{children}</main>
			</div>

			{/* Mobile bottom tab bar */}
			<BottomTabBar />

			{/* Quick-add modal (accessible from any authenticated page) */}
			<QuickAddModal open={isOpen} onClose={() => setOpen(false)} />
		</div>
	);
}
