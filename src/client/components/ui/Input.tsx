import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, className = "", id, ...props }, ref) => {
		const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
		return (
			<div className="space-y-1.5">
				<label
					htmlFor={inputId}
					className="block text-sm font-medium text-stone-700"
				>
					{label}
				</label>
				<input
					ref={ref}
					id={inputId}
					className={`block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500" : ""} ${className}`}
					{...props}
				/>
				{error && <p className="text-sm text-red-600">{error}</p>}
			</div>
		);
	},
);
Input.displayName = "Input";
