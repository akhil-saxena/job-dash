import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "../Select";

const meta: Meta<typeof Select> = {
	title: "Design System/Select",
	component: Select,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Styled native `<select>` with a trailing chevron. Use for single-choice dropdowns where native OS affordances (keyboard, accessibility) matter more than deep custom theming.",
			},
		},
	},
	argTypes: {
		variant: { control: "radio", options: ["glass", "raised"] },
		size: { control: "radio", options: ["sm", "md"] },
	},
};
export default meta;
type Story = StoryObj<typeof Select>;

const statusOptions = [
	{ label: "Wishlist", value: "wishlist" },
	{ label: "Applied", value: "applied" },
	{ label: "Screening", value: "screening" },
	{ label: "Interviewing", value: "interviewing" },
	{ label: "Offer", value: "offer" },
	{ label: "Rejected", value: "rejected" },
	{ label: "Withdrawn", value: "withdrawn" },
];

export const Basic: Story = {
	args: {
		label: "Status",
		options: statusOptions,
		defaultValue: "applied",
	},
};

export const WithPlaceholder: Story = {
	args: {
		label: "Source",
		placeholder: "Select a source…",
		options: [
			{ label: "LinkedIn", value: "linkedin" },
			{ label: "Indeed", value: "indeed" },
			{ label: "Company site", value: "company" },
			{ label: "Referral", value: "referral" },
		],
	},
};

export const Small: Story = {
	args: {
		size: "sm",
		label: "Per page",
		options: [
			{ label: "10", value: "10" },
			{ label: "25", value: "25" },
			{ label: "50", value: "50" },
		],
	},
};

export const WithError: Story = {
	args: {
		label: "Deadline type",
		options: [
			{ label: "Follow-up", value: "follow_up" },
			{ label: "Application close", value: "application_close" },
		],
		error: "Pick a deadline type",
	},
};
