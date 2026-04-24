import type { Meta, StoryObj } from "@storybook/react";
import { StickyNote } from "../StickyNote";

const meta: Meta<typeof StickyNote> = {
	title: "Design System/StickyNote",
	component: StickyNote,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Amber sticky-note surface — lived-in, slightly rotated card used in the Overview sidebar for quick-glance snippets. Renders as a `<button>` when `onClick` is provided so it's keyboard-navigable.",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof StickyNote>;

export const Basic: Story = {
	args: {
		children: "Reach out to David before screening. Research Jetpack vs WP.com split.",
		hint: "Click to expand",
	},
};

export const Clickable: Story = {
	args: {
		children: "Prep 3 questions for Maya: division scope, trial expectations, mentorship.",
		hint: "3 items",
		onClick: () => alert("Clicked sticky note"),
	},
};

export const Row: Story = {
	render: () => (
		<div className="grid grid-cols-3 gap-4">
			<StickyNote hint="Click to expand">
				Reach out to David before screening.
			</StickyNote>
			<StickyNote hint="3 items" rotate={0.4}>
				Prep 3 questions for Maya.
			</StickyNote>
			<StickyNote hint="Reminder" rotate={-0.8}>
				Follow up if no reply by May 2.
			</StickyNote>
		</div>
	),
};
