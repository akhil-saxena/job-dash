import type { ReactNode } from "react";

interface CardProps {
	className?: string;
	hover?: boolean;
	padding?: string;
	children: ReactNode;
}

export function Card({
	className = "",
	hover = false,
	padding = "p-4",
	children,
}: CardProps) {
	return (
		<div
			className={`glass rounded-[var(--radius-card)] ${hover ? "glass-hover" : ""} ${padding} ${className}`}
		>
			{children}
		</div>
	);
}
