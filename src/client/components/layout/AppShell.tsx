import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomTabBar } from "./BottomTabBar";
import { Header } from "./Header";

interface AppShellProps {
	children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
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
		</div>
	);
}
