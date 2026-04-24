import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MarkdownField } from "../MarkdownField";

const meta: Meta<typeof MarkdownField> = {
	title: "Design System/MarkdownField",
	component: MarkdownField,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Markdown-aware notes field with an explicit **Edit / Preview** segmented toggle. Used for every note surface across the app (application notes, company research, interview feedback, Q&A answers). Parent components are responsible for save state, debouncing, and dirty tracking — this primitive only handles edit/preview switching and rendering.",
			},
		},
	},
	argTypes: {
		tone: { control: "radio", options: ["amber", "accent"] },
	},
};
export default meta;
type Story = StoryObj<typeof MarkdownField>;

const SAMPLE = `## Prep notes

- **Recruiter call** with Sarah on Monday
- Review their [careers page](https://example.com) for tech stack
- Ask about *remote flexibility* and \`equity split\`

> They mentioned runway is 18 months — dig into that.`;

function Wrapper({ initial = "" }: { initial?: string }) {
	const [v, setV] = useState(initial);
	return <MarkdownField value={v} onChange={setV} placeholder="Start writing…" />;
}

export const Empty: Story = {
	render: () => <Wrapper />,
};

export const WithContent: Story = {
	render: () => <Wrapper initial={SAMPLE} />,
};

export const AmberTone: Story = {
	render: () => {
		const [v, setV] = useState(SAMPLE);
		return (
			<MarkdownField
				value={v}
				onChange={setV}
				tone="amber"
				placeholder="Start writing…"
			/>
		);
	},
};

export const AccentTone: Story = {
	render: () => {
		const [v, setV] = useState(SAMPLE);
		return (
			<MarkdownField
				value={v}
				onChange={setV}
				tone="accent"
				placeholder="Start writing…"
			/>
		);
	},
};
