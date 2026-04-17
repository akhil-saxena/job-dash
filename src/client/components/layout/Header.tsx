import { useMatches, useRouter } from "@tanstack/react-router";
import { Sun, Moon, Monitor } from "lucide-react";
import { SearchBar } from "@/client/components/design-system/SearchBar";
import { Button } from "@/client/components/design-system/Button";
import { useTheme } from "@/client/hooks/useTheme";
import { authClient } from "@/client/lib/auth-client";
import type { ThemeMode } from "@/client/hooks/useTheme";

const ROUTE_TITLES: Record<string, string> = {
	"/board": "Board",
	"/list": "List",
	"/calendar": "Calendar",
	"/analytics": "Analytics",
	"/settings": "Settings",
};

function getPageTitle(pathname: string): string {
	// Check exact match first
	if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
	// Check app detail route
	if (pathname.startsWith("/app/")) return "Application";
	return "JobDash";
}

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
	light: "dark",
	dark: "system",
	system: "light",
};

const MODE_ICONS = {
	light: Sun,
	dark: Moon,
	system: Monitor,
} as const;

function getCompanyColor(name: string): string {
	const colors = [
		"#ef4444",
		"#f97316",
		"#f59e0b",
		"#84cc16",
		"#22c55e",
		"#14b8a6",
		"#06b6d4",
		"#3b82f6",
		"#6366f1",
		"#8b5cf6",
		"#a855f7",
		"#ec4899",
	];
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return colors[Math.abs(hash) % colors.length];
}

export function Header() {
	const matches = useMatches();
	const router = useRouter();
	const { mode, setMode } = useTheme();
	const { data: session } = authClient.useSession();

	// Get the deepest matched route path to determine page title
	const currentPath = matches[matches.length - 1]?.fullPath ?? "/";
	const pageTitle = getPageTitle(currentPath);

	const ThemeIcon = MODE_ICONS[mode];
	const userName = session?.user?.name ?? "User";
	const userInitial = userName.charAt(0).toUpperCase();
	const avatarColor = getCompanyColor(userName);

	async function handleSignOut() {
		await authClient.signOut();
		router.navigate({ to: "/login" });
	}

	return (
		<header className="flex items-center gap-3 border-b border-black/[0.06] px-4 py-3 dark:border-white/[0.08] md:px-6">
			{/* Page title */}
			<h1 className="text-lg font-semibold text-text-primary dark:text-dark-accent">
				{pageTitle}
			</h1>

			{/* Spacer */}
			<div className="flex-1" />

			{/* Search bar -- display-only for Phase 3 */}
			<div className="hidden w-64 sm:block lg:w-80">
				<SearchBar
					variant="glass"
					placeholder="Search applications..."
				/>
			</div>

			{/* + Add button */}
			<Button variant="filled" size="sm">
				<span className="hidden sm:inline">+ Add Application</span>
				<span className="sm:hidden">+ Add</span>
			</Button>

			{/* Theme toggle */}
			<button
				type="button"
				onClick={() => setMode(NEXT_MODE[mode])}
				className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-btn)] text-text-secondary transition-colors hover:bg-black/[0.05] dark:text-dark-accent/60 dark:hover:bg-white/[0.1]"
				aria-label={`Switch to ${NEXT_MODE[mode]} mode`}
			>
				<ThemeIcon size={18} />
			</button>

			{/* User avatar -- sign out on click */}
			<button
				type="button"
				onClick={handleSignOut}
				className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-80"
				style={{ backgroundColor: avatarColor }}
				aria-label={`Signed in as ${userName}. Click to sign out.`}
			>
				{userInitial}
			</button>
		</header>
	);
}
