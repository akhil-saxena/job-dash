import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SearchBar } from "../SearchBar";

const meta: Meta<typeof SearchBar> = {
	title: "Design System/SearchBar",
	component: SearchBar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Search input with a leading search icon. Used in the top-nav Header for global application search (Cmd+K focuses it).",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Basic: Story = {
	render: () => {
		const [q, setQ] = useState("");
		return (
			<div className="w-80">
				<SearchBar
					placeholder="Search applications…"
					value={q}
					onChange={setQ}
				/>
			</div>
		);
	},
};

export const Filled: Story = {
	render: () => {
		const [q, setQ] = useState("google");
		return (
			<div className="w-80">
				<SearchBar
					placeholder="Search applications…"
					value={q}
					onChange={setQ}
				/>
			</div>
		);
	},
};
