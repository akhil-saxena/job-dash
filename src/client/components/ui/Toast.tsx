import {
	useEffect,
	useState,
	createContext,
	useContext,
	useCallback,
	type ReactNode,
} from "react";

interface Toast {
	id: string;
	message: string;
	type: "error" | "success" | "info";
}

interface ToastContextValue {
	showToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue>({
	showToast: () => {},
});

export function useToast() {
	return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const showToast = useCallback(
		(message: string, type: Toast["type"] = "error") => {
			const id = Math.random().toString(36).slice(2);
			setToasts((prev) => [...prev, { id, message, type }]);
		},
		[],
	);

	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
				{toasts.map((toast) => (
					<ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
				))}
			</div>
		</ToastContext.Provider>
	);
}

function ToastItem({
	toast,
	onDismiss,
}: { toast: Toast; onDismiss: (id: string) => void }) {
	useEffect(() => {
		const timer = setTimeout(() => onDismiss(toast.id), 5000);
		return () => clearTimeout(timer);
	}, [toast.id, onDismiss]);

	const colors = {
		error: "bg-red-50 border-red-200 text-red-800",
		success: "bg-green-50 border-green-200 text-green-800",
		info: "bg-stone-50 border-stone-200 text-stone-800",
	};

	return (
		<div
			className={`rounded-lg border px-4 py-3 text-sm shadow-md ${colors[toast.type]}`}
		>
			<div className="flex items-center justify-between gap-3">
				<span>{toast.message}</span>
				<button
					type="button"
					onClick={() => onDismiss(toast.id)}
					className="text-current opacity-50 hover:opacity-100"
				>
					x
				</button>
			</div>
		</div>
	);
}
