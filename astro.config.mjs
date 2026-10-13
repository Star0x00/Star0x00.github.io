// @ts-check

import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://yourdomain.com",
	i18n: {
		defaultLocale: "en",
		locales: ["en", "zh"],
		routing: {
			prefixDefaultLocale: false,
		},
	},
	integrations: [sitemap()],
});