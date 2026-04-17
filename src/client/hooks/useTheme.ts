import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeStore {
	mode: ThemeMode;
	resolved: "light" | "dark";
	setMode: (mode: ThemeMode) => void;
}

function getSystemTheme(): "light" | "dark" {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
	return mode === "system" ? getSystemTheme() : mode;
}

function applyTheme(resolved: "light" | "dark") {
	document.documentElement.classList.toggle("dark", resolved === "dark");
}

const stored = localStorage.getItem("theme") as ThemeMode | null;
const initialMode: ThemeMode = stored || "system";
const initialResolved = resolveTheme(initialMode);
applyTheme(initialResolved);

export const useTheme = create<ThemeStore>((set) => ({
	mode: initialMode,
	resolved: initialResolved,
	setMode: (mode) => {
		const resolved = resolveTheme(mode);
		localStorage.setItem("theme", mode);
		applyTheme(resolved);
		set({ mode, resolved });
	},
}));

// Listen for system preference changes when in system mode
window
	.matchMedia("(prefers-color-scheme: dark)")
	.addEventListener("change", () => {
		const { mode } = useTheme.getState();
		if (mode === "system") {
			const resolved = getSystemTheme();
			applyTheme(resolved);
			useTheme.setState({ resolved });
		}
	});
