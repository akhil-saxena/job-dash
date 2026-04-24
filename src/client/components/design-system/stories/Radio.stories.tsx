import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Radio, RadioGroup } from "../Radio";

const meta: Meta<typeof Radio> = {
	title: "Design System/Radio",
	component: Radio,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Single radio button + a `RadioGroup` helper for controlled mutually-exclusive options.",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof Radio>;

export const Single: Story = {
	render: () => {
		const [v, setV] = useState("remote");
		return (
			<div className="flex flex-col gap-2">
				<Radio
					name="loc"
					value="remote"
					checked={v === "remote"}
					onChange={() => setV("remote")}
					label="Remote"
				/>
				<Radio
					name="loc"
					value="hybrid"
					checked={v === "hybrid"}
					onChange={() => setV("hybrid")}
					label="Hybrid"
				/>
				<Radio
					name="loc"
					value="onsite"
					checked={v === "onsite"}
					onChange={() => setV("onsite")}
					label="Onsite"
				/>
			</div>
		);
	},
};

export const Group: Story = {
	render: () => {
		const [v, setV] = useState("medium");
		return (
			<RadioGroup
				name="priority"
				label="Priority"
				value={v}
				onChange={setV}
				options={[
					{ label: "Low", value: "low" },
					{ label: "Medium", value: "medium" },
					{ label: "High", value: "high" },
					{ label: "Urgent", value: "urgent", disabled: true },
				]}
			/>
		);
	},
};
