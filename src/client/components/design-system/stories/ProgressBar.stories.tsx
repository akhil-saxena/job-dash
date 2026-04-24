import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "../ProgressBar";

const meta: Meta<typeof ProgressBar> = {
	title: "Design System/ProgressBar",
	component: ProgressBar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Horizontal gradient-filled progress bar. Four tones map to semantic use: amber (completeness / generic), green (strong / success), blue (info), ink (neutral).",
			},
		},
	},
	argTypes: {
		tone: { control: "radio", options: ["amber", "green", "blue", "ink"] },
		value: { control: { type: "range", min: 0, max: 100 } },
	},
};
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Amber: Story = {
	args: {
		value: 72,
		label: "Application completeness",
		caption: "72% complete",
		tone: "amber",
	},
};

export const Green: Story = {
	args: {
		value: 78,
		label: "Fit score",
		caption: "78% · strong",
		tone: "green",
	},
};

export const Stack: Story = {
	render: () => (
		<div className="flex w-80 flex-col gap-4">
			<ProgressBar
				value={72}
				label="Application completeness"
				caption="72% complete"
				tone="amber"
			/>
			<ProgressBar value={78} label="Fit score" caption="78% · strong" tone="green" />
			<ProgressBar value={42} label="Interview prep" caption="42% prepared" tone="blue" />
			<ProgressBar
				value={100}
				label="Documents attached"
				caption="3 of 3"
				tone="ink"
			/>
		</div>
	),
};
