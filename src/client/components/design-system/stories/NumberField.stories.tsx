import type { Meta, StoryObj } from "@storybook/react";
import { NumberField } from "../NumberField";

const meta: Meta<typeof NumberField> = {
	title: "Design System/NumberField",
	component: NumberField,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Numeric input with optional `prefix` and `suffix` affixes (e.g. `$`, `d`, `%`). The input uses tabular numerals for aligned columns.",
			},
		},
	},
	argTypes: {
		variant: { control: "radio", options: ["glass", "raised"] },
		size: { control: "radio", options: ["sm", "md"] },
	},
};
export default meta;
type Story = StoryObj<typeof NumberField>;

export const Basic: Story = {
	args: { label: "Count", placeholder: "0", defaultValue: 42 },
};

export const WithSuffix: Story = {
	args: { label: "Days", suffix: "d", defaultValue: 7 },
};

export const WithPrefix: Story = {
	args: { label: "Salary", prefix: "$", defaultValue: 120000, placeholder: "0" },
};

export const WithBoth: Story = {
	args: {
		label: "Response time",
		prefix: "≤",
		suffix: "d",
		defaultValue: 14,
	},
};

export const Small: Story = {
	args: { label: "Green zone", size: "sm", suffix: "d", defaultValue: 7 },
};

export const WithError: Story = {
	args: {
		label: "Threshold",
		suffix: "d",
		defaultValue: 3,
		error: "Green must be less than amber",
	},
};
