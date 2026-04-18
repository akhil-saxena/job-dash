import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
	value: number | null;
	onChange?: (rating: number | null) => void;
	readOnly?: boolean;
	size?: number;
}

export function StarRating({ value, onChange, readOnly = false, size = 16 }: StarRatingProps) {
	const [hovered, setHovered] = useState<number | null>(null);
	const display = hovered ?? value ?? 0;

	return (
		<div className="flex gap-0.5" onMouseLeave={() => !readOnly && setHovered(null)}>
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					type="button"
					disabled={readOnly}
					onClick={() => onChange?.(value === star ? null : star)}
					onMouseEnter={() => !readOnly && setHovered(star)}
					className={`${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
				>
					<Star
						size={size}
						className={star <= display
							? "fill-amber-400 text-amber-400"
							: "fill-transparent text-black/20 dark:text-white/20"}
					/>
				</button>
			))}
		</div>
	);
}
