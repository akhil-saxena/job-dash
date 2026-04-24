import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../Badge";

const meta: Meta<typeof Badge> = {
	title: "Design System/Badge",
	component: Badge,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Compact status pill. Used for application status, tag chips, event types, and inline counts. Accepts a color prop for semantic hue.",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Statuses: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<Badge color="wishlist">Wishlist</Badge>
			<Badge color="applied">Applied</Badge>
			<Badge color="screening">Screening</Badge>
			<Badge color="interviewing">Interviewing</Badge>
			<Badge color="offer">Offer</Badge>
			<Badge color="rejected">Rejected</Badge>
			<Badge color="withdrawn">Withdrawn</Badge>
		</div>
	),
};

export const Filled: Story = {
	args: { variant: "filled", color: "applied", children: "Applied" },
};

export const Outlined: Story = {
	args: { variant: "outlined", color: "interviewing", children: "Interviewing" },
};

export const Dot: Story = {
	args: { variant: "dot", color: "offer", children: "Offer received" },
};

export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div>
				<p className="mb-2 text-xs font-semibold text-text-muted">Filled</p>
				<div className="flex flex-wrap gap-2">
					<Badge variant="filled" color="applied">Applied</Badge>
					<Badge variant="filled" color="screening">Screening</Badge>
					<Badge variant="filled" color="interviewing">Interviewing</Badge>
					<Badge variant="filled" color="offer">Offer</Badge>
					<Badge variant="filled" color="rejected">Rejected</Badge>
				</div>
			</div>
			<div>
				<p className="mb-2 text-xs font-semibold text-text-muted">Outlined</p>
				<div className="flex flex-wrap gap-2">
					<Badge variant="outlined" color="applied">Applied</Badge>
					<Badge variant="outlined" color="screening">Screening</Badge>
					<Badge variant="outlined" color="interviewing">Interviewing</Badge>
					<Badge variant="outlined" color="offer">Offer</Badge>
					<Badge variant="outlined" color="rejected">Rejected</Badge>
				</div>
			</div>
			<div>
				<p className="mb-2 text-xs font-semibold text-text-muted">Dot</p>
				<div className="flex flex-wrap gap-3">
					<Badge variant="dot" color="applied">Applied</Badge>
					<Badge variant="dot" color="interviewing">Interviewing</Badge>
					<Badge variant="dot" color="offer">Offer</Badge>
				</div>
			</div>
		</div>
	),
};
