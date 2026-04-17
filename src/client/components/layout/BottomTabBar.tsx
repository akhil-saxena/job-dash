import { Link } from "@tanstack/react-router";
import {
	LayoutDashboard,
	List,
	Calendar,
	BarChart3,
	MoreHorizontal,
} from "lucide-react";

const TAB_ITEMS = [
	{ icon: LayoutDashboard, label: "Board", to: "/board" as const },
	{ icon: List, label: "List", to: "/list" as const },
	{ icon: Calendar, label: "Cal", to: "/calendar" as const },
	{ icon: BarChart3, label: "Stats", to: "/analytics" as const },
	{ icon: MoreHorizontal, label: "More", to: "/settings" as const },
] as const;

export function BottomTabBar() {
	return (
		<nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex h-[58px] items-center justify-around glass border-t border-white/30 dark:border-white/10">
			{TAB_ITEMS.map((item) => (
				<Link
					key={item.to}
					to={item.to}
					className="flex flex-col items-center gap-0.5 px-3 py-1 text-text-muted transition-colors dark:text-dark-accent/40"
					activeProps={{
						className: "text-text-primary dark:text-dark-accent",
					}}
				>
					<item.icon size={20} />
					<span className="text-[10px] font-medium leading-tight">
						{item.label}
					</span>
				</Link>
			))}
		</nav>
	);
}
