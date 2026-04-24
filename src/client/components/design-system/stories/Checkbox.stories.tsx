import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "../Checkbox";

const meta: Meta<typeof Checkbox> = {
	title: "Design System/Checkbox",
	component: Checkbox,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Amber-accented checkbox. Uses a hidden native `<input type=\"checkbox\">` under the hood so forms and keyboard semantics work correctly.",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Basic: Story = {
	render: () => {
		const [on, setOn] = useState(true);
		return (
			<Checkbox
				checked={on}
				onChange={(e) => setOn(e.currentTarget.checked)}
				label="Remote only"
			/>
		);
	},
};

export const WithHint: Story = {
	render: () => {
		const [on, setOn] = useState(false);
		return (
			<Checkbox
				checked={on}
				onChange={(e) => setOn(e.currentTarget.checked)}
				label="Send follow-up digest"
				hint="Weekly summary of stale applications."
			/>
		);
	},
};

export const Disabled: Story = {
	args: { label: "Locked option", disabled: true, checked: true },
};

export const Group: Story = {
	render: () => {
		const [s, setS] = useState({ remote: true, referral: false, cover: false });
		return (
			<div className="flex flex-col gap-2.5">
				<Checkbox
					checked={s.remote}
					onChange={(e) => setS((p) => ({ ...p, remote: e.currentTarget.checked }))}
					label="Remote only"
				/>
				<Checkbox
					checked={s.referral}
					onChange={(e) => setS((p) => ({ ...p, referral: e.currentTarget.checked }))}
					label="Has referral"
				/>
				<Checkbox
					checked={s.cover}
					onChange={(e) => setS((p) => ({ ...p, cover: e.currentTarget.checked }))}
					label="Cover letter sent"
				/>
			</div>
		);
	},
};
