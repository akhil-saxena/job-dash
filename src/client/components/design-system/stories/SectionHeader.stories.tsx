import type { Meta, StoryObj } from "@storybook/react";
import { SectionHeader } from "../SectionHeader";
import { Button } from "../Button";

const meta: Meta<typeof SectionHeader> = {
	title: "Design System/SectionHeader",
	component: SectionHeader,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Repeated amber-bar + Archivo title + mono count + right-aligned actions pattern used throughout detail pages (Deadlines, Interviews, Notes, Company Research, Timeline, etc.). Using this primitive everywhere keeps spacing + typography consistent — tweak once, land everywhere.",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Basic: Story = {
	args: { title: "At a glance" },
};

export const WithCount: Story = {
	args: { title: "Deadlines", count: 3 },
};

export const WithCaption: Story = {
	args: {
		title: "Interview schedule",
		count: 2,
		caption: "Next: Apr 24 · 2 pm",
	},
};

export const WithActions: Story = {
	render: () => (
		<SectionHeader
			title="Documents"
			count={3}
			actions={
				<>
					<Button variant="ghost" size="sm">
						Upload
					</Button>
					<Button variant="amber" size="sm">
						+ Add
					</Button>
				</>
			}
		/>
	),
};

export const NoAccent: Story = {
	args: { title: "Subheading without accent bar", hideAccent: true },
};
