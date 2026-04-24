import type { Preview } from "@storybook/react";
import "../src/client/index.css";

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			default: "JobDash Warm",
			values: [
				{
					name: "JobDash Warm",
					value: "linear-gradient(145deg, #f5f3f0, #ece8e3, #e8e4df)",
				},
				{ name: "Dark", value: "#18181b" },
				{ name: "Plain white", value: "#ffffff" },
			],
		},
		layout: "padded",
	},
	globalTypes: {
		theme: {
			name: "Theme",
			description: "Light / dark mode",
			defaultValue: "light",
			toolbar: {
				icon: "circlehollow",
				items: [
					{ value: "light", icon: "sun", title: "Light" },
					{ value: "dark", icon: "moon", title: "Dark" },
				],
				dynamicTitle: true,
			},
		},
	},
	decorators: [
		(Story, context) => {
			const theme = context.globals.theme as "light" | "dark";
			if (typeof document !== "undefined") {
				document.documentElement.classList.toggle("dark", theme === "dark");
			}
			return Story();
		},
	],
};

export default preview;
