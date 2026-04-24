import { useState, useRef, useEffect } from "react";
import { useMatches, useRouter, Link } from "@tanstack/react-router";
import { Sun, Moon, Monitor, User, Settings, LogOut } from "lucide-react";
import { SearchBar } from "@/client/components/design-system/SearchBar";
import { Button } from "@/client/components/design-system/Button";
import { Avatar } from "@/client/components/design-system/Avatar";
import { useTheme } from "@/client/hooks/useTheme";
import { useQuickAdd } from "@/client/hooks/useQuickAdd";
import { useSearch } from "@/client/hooks/useSearch";
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

export function Header() {
	const matches = useMatches();
	const router = useRouter();
	const { mode, setMode } = useTheme();
	const { data: session } = authClient.useSession();
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		}
		if (menuOpen) document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [menuOpen]);

	const currentPath = matches[matches.length - 1]?.fullPath ?? "/";
	const pageTitle = getPageTitle(currentPath);

	const { setOpen: openQuickAdd } = useQuickAdd();
	const search = useSearch();
	const ThemeIcon = MODE_ICONS[mode];

	// Cmd+K / Ctrl+K to focus search bar
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				document.getElementById("global-search")?.focus();
			}
		}
		document.addEventListener("keydown", handleKeyDown);
			return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);
	const userName = session?.user?.name ?? "User";
	const userEmail = session?.user?.email ?? "";

	async function handleSignOut() {
		setMenuOpen(false);
		await authClient.signOut();
		router.navigate({ to: "/login" });
	}

	return (
		<header className="flex items-center gap-3 border-b border-black/[0.06] px-4 py-3 dark:border-white/[0.08] md:px-6">
			<h1 className="text-lg font-semibold text-text-primary dark:text-dark-accent">
				{pageTitle}
			</h1>

			<div className="flex-1" />

			<div className="hidden w-64 sm:block lg:w-80">
				<SearchBar
					variant="glass"
					placeholder="Search applications..."
					value={search.query}
					onChange={search.setQuery}
				/>
			</div>

			<Button variant="filled" size="sm" onClick={() => openQuickAdd(true)}>
				<span className="hidden sm:inline">+ Add Application</span>
				<span className="sm:hidden">+ Add</span>
			</Button>

			<button
				type="button"
				onClick={() => setMode(NEXT_MODE[mode])}
				className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-btn)] text-text-secondary transition-colors hover:bg-black/[0.05] dark:text-dark-accent/60 dark:hover:bg-white/[0.1]"
				aria-label={`Switch to ${NEXT_MODE[mode]} mode`}
			>
				<ThemeIcon size={18} />
			</button>

			{/* User avatar with dropdown */}
			<div className="relative" ref={menuRef}>
				<button
					type="button"
					onClick={() => setMenuOpen(!menuOpen)}
					className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/30"
					aria-label="Account menu"
				>
					<Avatar name={userName} size="sm" />
				</button>

				{menuOpen && (
					<div className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-[var(--radius-modal)] border border-white/50 bg-white/80 shadow-lg backdrop-blur-xl dark:border-white/[0.08] dark:bg-[var(--dark-card)]/90">
						{/* User info */}
						<div className="border-b border-black/[0.06] px-4 py-3 dark:border-white/[0.06]">
							<div className="text-sm font-semibold text-text-primary dark:text-dark-accent">
								{userName}
							</div>
							<div className="text-xs text-text-secondary dark:text-dark-accent/50">
								{userEmail}
							</div>
						</div>

						{/* Menu items */}
						<div className="py-1">
							<Link
								to="/settings"
								onClick={() => setMenuOpen(false)}
								className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-black/[0.04] dark:text-dark-accent/60 dark:hover:bg-white/[0.06]"
							>
								<User size={16} />
								Profile
							</Link>
							<Link
								to="/settings"
								onClick={() => setMenuOpen(false)}
								className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-black/[0.04] dark:text-dark-accent/60 dark:hover:bg-white/[0.06]"
							>
								<Settings size={16} />
								Settings
							</Link>
						</div>

						{/* Sign out */}
						<div className="border-t border-black/[0.06] py-1 dark:border-white/[0.06]">
							<button
								type="button"
								onClick={handleSignOut}
								className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/[0.08]"
							>
								<LogOut size={16} />
								Sign out
							</button>
						</div>
					</div>
				)}
			</div>
		</header>
	);
}
