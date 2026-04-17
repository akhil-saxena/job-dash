import { create } from "zustand";

interface QuickAddStore {
	isOpen: boolean;
	setOpen: (open: boolean) => void;
}

export const useQuickAdd = create<QuickAddStore>((set) => ({
	isOpen: false,
	setOpen: (open) => set({ isOpen: open }),
}));
