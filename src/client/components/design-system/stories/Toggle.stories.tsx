import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "../Toggle";

const meta: Meta<typeof Toggle> = {
	title: "Design System/Toggle",
	component: Toggle,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Amber-accented toggle switch. Functions as a checkbox at the HTML level (works inside `<form>`), shares focus-ring semantics with the rest of the DS.",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof Toggle>;

export const Basic: Story = {
	render: () => {
		const [on, setOn] = useState(true);
		return (
			<Toggle
				checked={on}
				onChange={(e) => setOn(e.currentTarget.checked)}
				label="Email notifications"
			/>
		);
	},
};

export const LabelLeft: Story = {
	render: () => {
		const [on, setOn] = useState(false);
		return (
			<Toggle
				checked={on}
				onChange={(e) => setOn(e.currentTarget.checked)}
				label="Dark mode"
				labelPosition="left"
			/>
		);
	},
};

export const WithHint: Story = {
	render: () => {
		const [on, setOn] = useState(true);
		return (
			<Toggle
				checked={on}
				onChange={(e) => setOn(e.currentTarget.checked)}
				label="Auto-advance stage"
				hint="Move to next pipeline stage when an interview is scheduled."
			/>
		);
	},
};

export const Stack: Story = {
	render: () => {
		const [s, setS] = useState({ notif: true, dark: false, auto: true });
		return (
			<div className="flex flex-col gap-3">
				<Toggle
					checked={s.notif}
					onChange={(e) => setS((p) => ({ ...p, notif: e.currentTarget.checked }))}
					label="Email notifications"
				/>
				<Toggle
					checked={s.dark}
					onChange={(e) => setS((p) => ({ ...p, dark: e.currentTarget.checked }))}
					label="Dark mode"
				/>
				<Toggle
					checked={s.auto}
					onChange={(e) => setS((p) => ({ ...p, auto: e.currentTarget.checked }))}
					label="Auto-advance stage"
				/>
			</div>
		);
	},
};
