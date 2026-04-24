import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: [
		"../src/client/components/design-system/stories/**/*.mdx",
		"../src/client/components/design-system/stories/**/*.stories.@(ts|tsx)",
	],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
	],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	typescript: {
		reactDocgen: "react-docgen-typescript",
	},
	docs: {
		autodocs: "tag",
	},
	core: {
		disableTelemetry: true,
	},
};

export default config;
