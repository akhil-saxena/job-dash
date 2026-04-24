import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "../Textarea";

const meta: Meta<typeof Textarea> = {
	title: "Design System/Textarea",
	component: Textarea,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Plain multi-line input. Use this when you explicitly do NOT want markdown rendering. For markdown-supported fields use `MarkdownField`.",
			},
		},
	},
	argTypes: {
		variant: { control: "radio", options: ["glass", "raised"] },
	},
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Basic: Story = {
	args: {
		label: "Notes",
		placeholder: "A few sentences…",
		rows: 5,
	},
};

export const WithHint: Story = {
	args: {
		label: "Cover letter",
		placeholder: "Paste your cover letter",
		rows: 6,
		hint: "No formatting — plain text only.",
	},
};

export const WithError: Story = {
	args: {
		label: "Rejection reason",
		rows: 4,
		error: "Reason is required to archive.",
	},
};
