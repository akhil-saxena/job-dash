import { Link, useRouter } from "@tanstack/react-router";
import {
	LayoutDashboard,
	List,
	Calendar,
	BarChart3,
	Settings,
	LogOut,
} from "lucide-react";
import { authClient } from "@/client/lib/auth-client";

const NAV_ITEMS = [
	{ icon: LayoutDashboard, label: "Board", to: "/board" as const },
	{ icon: List, label: "List", to: "/list" as const },
	{ icon: Calendar, label: "Calendar", to: "/calendar" as const },
	{ icon: BarChart3, label: "Analytics", to: "/analytics" as const },
	{ icon: Settings, label: "Settings", to: "/settings" as const },
] as const;

export function Sidebar() {
	const router = useRouter();

	async function handleSignOut() {
		await authClient.signOut();
		router.navigate({ to: "/login" });
	}

	return (
		<aside className="hidden md:flex flex-col items-center w-[72px] h-screen sticky top-0 left-0 glass border-r border-white/30 dark:border-white/10 py-4">
			{/* Logo area */}
			<div className="mb-6 flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] bg-surface-accent text-white text-sm font-semibold dark:bg-dark-accent dark:text-dark-dominant">
				JD
			</div>

			{/* Nav items */}
			<nav className="flex flex-1 flex-col items-center gap-1">
				{NAV_ITEMS.map((item) => (
					<Link
						key={item.to}
						to={item.to}
						className="group relative flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] text-text-secondary transition-colors hover:bg-black/[0.06] dark:text-dark-accent/60 dark:hover:bg-white/[0.08]"
						activeProps={{
							className:
								"bg-black/[0.08] text-text-primary dark:bg-white/[0.12] dark:text-dark-accent",
						}}
					>
						<item.icon size={20} />
						{/* Tooltip */}
						<span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-[var(--radius-btn)] bg-surface-accent px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-dark-card dark:text-dark-accent">
							{item.label}
						</span>
					</Link>
				))}
			</nav>

			{/* Sign out */}
			<button
				type="button"
				onClick={handleSignOut}
				className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] text-text-muted transition-colors hover:bg-black/[0.06] hover:text-text-secondary dark:text-dark-accent/40 dark:hover:bg-white/[0.08] dark:hover:text-dark-accent/60"
				aria-label="Sign out"
			>
				<LogOut size={20} />
			</button>
		</aside>
	);
}
