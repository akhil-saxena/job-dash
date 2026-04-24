import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";

const meta: Meta<typeof Button> = {
	title: "Design System/Button",
	component: Button,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Primary action button. Three variants (`filled`, `outline`, `ghost`) × two sizes (`sm`, `md`) × two colors (`default`, `destructive`). `filled` + `default` is the canonical primary CTA.",
			},
		},
	},
	args: {
		children: "Add application",
	},
	argTypes: {
		variant: { control: "radio", options: ["filled", "outline", "ghost"] },
		size: { control: "radio", options: ["sm", "md"] },
		color: { control: "radio", options: ["default", "destructive"] },
		loading: { control: "boolean" },
		disabled: { control: "boolean" },
	},
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
	args: { variant: "filled", size: "md", color: "default" },
};

export const Outline: Story = {
	args: { variant: "outline", size: "md" },
};

export const Ghost: Story = {
	args: { variant: "ghost", size: "md" },
};

export const Destructive: Story = {
	args: { variant: "filled", color: "destructive", children: "Delete application" },
};

export const Loading: Story = {
	args: { loading: true, children: "Saving…" },
};

export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex gap-2">
				<Button variant="filled" size="sm">Small filled</Button>
				<Button variant="filled" size="md">Medium filled</Button>
			</div>
			<div className="flex gap-2">
				<Button variant="outline" size="sm">Small outline</Button>
				<Button variant="outline" size="md">Medium outline</Button>
			</div>
			<div className="flex gap-2">
				<Button variant="ghost" size="sm">Small ghost</Button>
				<Button variant="ghost" size="md">Medium ghost</Button>
			</div>
			<div className="flex gap-2">
				<Button variant="filled" color="destructive" size="sm">Delete</Button>
				<Button variant="outline" color="destructive" size="sm">Remove</Button>
				<Button variant="ghost" color="destructive" size="sm">Cancel</Button>
			</div>
		</div>
	),
};
