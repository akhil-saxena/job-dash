import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../Card";

const meta: Meta<typeof Card> = {
	title: "Design System/Card",
	component: Card,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Glass-surface card. The foundational container for analytics panels, stat cards, settings sections, and the calendar `This Week` list. Pass `hover` to enable a subtle hover lift, and `padding` to override the default `p-4`.",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Basic: Story = {
	args: {
		children: "Glass card with default padding.",
	},
};

export const Padded: Story = {
	args: {
		padding: "p-6",
		children: "Card with `p-6` padding — used by analytics panels.",
	},
};

export const Hoverable: Story = {
	args: {
		hover: true,
		padding: "p-6",
		children: "Hover me — subtle lift via `.glass-hover`.",
	},
};

export const StatCardExample: Story = {
	render: () => (
		<Card padding="p-4" className="w-[180px]">
			<div className="flex flex-col gap-2">
				<div className="text-xs font-semibold uppercase tracking-wider text-text-muted">
					TOTAL APPS
				</div>
				<div className="text-[28px] font-semibold leading-none tabular-nums text-text-primary dark:text-dark-accent">
					42
				</div>
			</div>
		</Card>
	),
};
