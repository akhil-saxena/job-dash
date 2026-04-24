import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { InlineDatePicker } from "../InlineDatePicker";

const meta: Meta<typeof InlineDatePicker> = {
	title: "Design System/InlineDatePicker",
	component: InlineDatePicker,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Custom popover calendar with amber today / selected highlight, optional event dots per day, and a selected-day event banner. Complements the native-input `DateField` when a richer, brand-consistent picker is preferred over native OS chrome.",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof InlineDatePicker>;

export const Basic: Story = {
	render: () => {
		const [v, setV] = useState<string | undefined>("2026-04-24");
		return (
			<div className="w-60">
				<InlineDatePicker
					label="Interview date"
					value={v}
					onChange={setV}
					today="2026-04-24"
				/>
			</div>
		);
	},
};

export const Empty: Story = {
	render: () => {
		const [v, setV] = useState<string | undefined>(undefined);
		return (
			<div className="w-60">
				<InlineDatePicker
					label="Deadline"
					value={v}
					onChange={setV}
					placeholder="Pick a date"
					today="2026-04-24"
				/>
			</div>
		);
	},
};

export const WithEvents: Story = {
	render: () => {
		const [v, setV] = useState<string | undefined>("2026-04-24");
		return (
			<div className="w-60">
				<InlineDatePicker
					label="Interview date"
					value={v}
					onChange={setV}
					today="2026-04-24"
					events={[
						{ date: "2026-04-24", label: "Recruiter intro" },
						{ date: "2026-04-29", label: "Tech screen" },
						{ date: "2026-05-08", label: "Trial kickoff" },
						{ date: "2026-05-15", label: "Final round" },
					]}
				/>
			</div>
		);
	},
};
