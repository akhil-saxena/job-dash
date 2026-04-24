import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarStack } from "../Avatar";

const meta: Meta<typeof Avatar> = {
	title: "Design System/Avatar",
	component: Avatar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Circular avatar with deterministic gradient derived from the name (same user → same color across sessions). Supports image src, initials fallback, presence dots, and a stacked pile-up variant.",
			},
		},
	},
	argTypes: {
		size: { control: "radio", options: ["xs", "sm", "md", "lg"] },
		status: {
			control: "radio",
			options: [undefined, "online", "away", "offline"],
		},
	},
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {
	args: { name: "Maya Chen", size: "md" },
};

export const WithPresence: Story = {
	args: { name: "David Swanson", size: "lg", status: "online" },
};

export const WithImage: Story = {
	args: {
		name: "Jane Doe",
		size: "lg",
		src: "https://i.pravatar.cc/150?img=47",
	},
};

export const AllSizes: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<Avatar name="Ava P" size="xs" />
			<Avatar name="Ben Q" size="sm" />
			<Avatar name="Cara R" size="md" />
			<Avatar name="Dan S" size="lg" />
		</div>
	),
};

export const Stack: Story = {
	render: () => (
		<AvatarStack
			users={[
				{ name: "Maya Chen" },
				{ name: "David Swanson" },
				{ name: "Jake Kim" },
				{ name: "Alex Park" },
				{ name: "Lin Wu" },
				{ name: "Priya Rao" },
				{ name: "Sam Tan" },
			]}
			max={4}
			size="sm"
		/>
	),
};

export const Presence: Story = {
	render: () => (
		<div className="flex items-center gap-6">
			<Avatar name="Online Person" size="md" status="online" />
			<Avatar name="Away Person" size="md" status="away" />
			<Avatar name="Offline Person" size="md" status="offline" />
		</div>
	),
};
