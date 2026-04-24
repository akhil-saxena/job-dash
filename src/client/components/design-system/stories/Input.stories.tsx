import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "../Input";

const meta: Meta<typeof Input> = {
	title: "Design System/Input",
	component: Input,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Single-line text input with optional label / hint / error. Also supports `as='textarea'` for a variant-sized multiline. Prefer the dedicated `Textarea` primitive for most multiline cases.",
			},
		},
	},
	args: { placeholder: "e.g. Acme Corp" },
	argTypes: {
		variant: { control: "radio", options: ["glass", "raised"] },
	},
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Raised: Story = {
	args: { variant: "raised", label: "Company" },
};

export const Glass: Story = {
	args: { variant: "glass", label: "Company" },
};

export const WithError: Story = {
	args: { variant: "raised", label: "Email", error: "Enter a valid email" },
};

export const WithHint: Story = {
	args: {
		variant: "raised",
		label: "Password",
		type: "password",
		hint: "Minimum 8 characters.",
	},
};

export const AsTextarea: Story = {
	args: {
		variant: "raised",
		as: "textarea",
		label: "Description",
		placeholder: "A few sentences…",
	},
};
