import type { Meta, StoryObj } from "@storybook/react";
import { DateField } from "../DateField";

const meta: Meta<typeof DateField> = {
	title: "Design System/DateField",
	component: DateField,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Native date / datetime / time input styled to match the design system, with a leading icon for at-rest affordance. The global `color-scheme` rule (see `src/client/index.css`) ensures the native picker chrome follows light/dark mode.",
			},
		},
	},
	argTypes: {
		type: { control: "radio", options: ["date", "datetime-local", "time", "month"] },
		variant: { control: "radio", options: ["glass", "raised"] },
		size: { control: "radio", options: ["sm", "md"] },
	},
};
export default meta;
type Story = StoryObj<typeof DateField>;

export const Date: Story = {
	args: { type: "date", label: "Applied on", defaultValue: "2026-04-24" },
};

export const DateTime: Story = {
	args: {
		type: "datetime-local",
		label: "Interview scheduled",
		defaultValue: "2026-04-30T10:30",
	},
};

export const Time: Story = {
	args: { type: "time", label: "Reminder", defaultValue: "09:00" },
};

export const Small: Story = {
	args: { type: "date", size: "sm", label: "From", defaultValue: "2026-04-01" },
};

export const WithError: Story = {
	args: {
		type: "date",
		label: "Due",
		defaultValue: "2026-03-01",
		error: "Due date must be in the future",
	},
};

export const Range: Story = {
	render: () => (
		<div className="grid max-w-md grid-cols-2 gap-3">
			<DateField type="date" label="From" defaultValue="2026-04-01" />
			<DateField type="date" label="To" defaultValue="2026-04-30" />
		</div>
	),
};
