import { useRef, useCallback, useEffect } from "react";

export function useDebouncedMutate(
	mutate: (fields: Record<string, unknown>) => void,
	delay = 800,
) {
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const debouncedMutate = useCallback(
		(fields: Record<string, unknown>) => {
			if (timerRef.current) clearTimeout(timerRef.current);
			timerRef.current = setTimeout(() => mutate(fields), delay);
		},
		[mutate, delay],
	);
	useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
	return debouncedMutate;
}
