import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FilterChips } from "../FilterChips";

const meta: Meta<typeof FilterChips> = {
	title: "Design System/FilterChips",
	component: FilterChips,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Horizontal row of mutually-exclusive filter chips. Three visual variants: `tab` (default pill with filled active state), `outlined` (bordered), `underline` (flat with bottom border on active). Optional counts shown inline.",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof FilterChips>;

const STATUS_ITEMS = [
	{ label: "All", value: "all", count: 42 },
	{ label: "Wishlist", value: "wishlist", count: 5 },
	{ label: "Applied", value: "applied", count: 18 },
	{ label: "Screening", value: "screening", count: 7 },
	{ label: "Interviewing", value: "interviewing", count: 4 },
	{ label: "Offer", value: "offer", count: 2 },
];

export const TabVariant: Story = {
	render: () => {
		const [active, setActive] = useState("all");
		return (
			<FilterChips
				variant="tab"
				items={STATUS_ITEMS}
				active={active}
				onChange={setActive}
			/>
		);
	},
};

export const OutlinedVariant: Story = {
	render: () => {
		const [active, setActive] = useState("applied");
		return (
			<FilterChips
				variant="outlined"
				items={STATUS_ITEMS}
				active={active}
				onChange={setActive}
			/>
		);
	},
};

export const UnderlineVariant: Story = {
	render: () => {
		const [active, setActive] = useState("interviewing");
		return (
			<FilterChips
				variant="underline"
				items={STATUS_ITEMS}
				active={active}
				onChange={setActive}
			/>
		);
	},
};

export const DateRange: Story = {
	render: () => {
		const [active, setActive] = useState("all");
		return (
			<FilterChips
				variant="tab"
				active={active}
				onChange={setActive}
				items={[
					{ label: "Last 30 days", value: "30d" },
					{ label: "Last 90 days", value: "90d" },
					{ label: "Year to date", value: "ytd" },
					{ label: "All time", value: "all" },
					{ label: "Custom", value: "custom" },
				]}
			/>
		);
	},
};
