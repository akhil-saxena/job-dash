import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { Input } from "../Input";

const meta: Meta<typeof Modal> = {
	title: "Design System/Modal",
	component: Modal,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Overlay dialog. On desktop it renders as a centered glass card; on mobile it becomes a bottom sheet with a grab handle. Escape + backdrop click close automatically.",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof Modal>;

export const QuickAdd: Story = {
	render: () => {
		const [open, setOpen] = useState(true);
		return (
			<>
				<Button onClick={() => setOpen(true)}>Open Quick Add</Button>
				<Modal open={open} onClose={() => setOpen(false)} title="Add Application">
					<div className="space-y-4">
						<Input variant="glass" label="Company" placeholder="e.g. Acme" />
						<Input variant="glass" label="Role" placeholder="Senior Engineer" />
						<div className="flex justify-end gap-2 pt-2">
							<Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
								Discard
							</Button>
							<Button variant="filled" size="sm">
								Add
							</Button>
						</div>
					</div>
				</Modal>
			</>
		);
	},
};
