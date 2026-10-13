import { defineCollection, z } from "astro:content";
import { languages, defaultLang } from "./config";
import { typstLoader } from "./loaders/typst-loader";

const blog = defineCollection({
	loader: typstLoader({
		dir: "src/content/blog",
		langs: Object.keys(languages),
		defaultLang,
	}),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		draft: z.boolean().optional().default(false),
		tags: z.array(z.string()).optional().default([]),
		description: z.string().optional().default(""),
		lang: z.string(),
		slug: z.string(),
		body: z.string(),
	}),
});

export const collections = { blog };