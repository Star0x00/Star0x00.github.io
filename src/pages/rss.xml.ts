import rss from "@astrojs/rss";
import { defaultLang, langPath, site, siteMeta } from "../config";
import { getPosts } from "../utils/posts";

export const prerender = true;

export async function GET() {
	const published = await getPosts(defaultLang);

	return rss({
		title: siteMeta[defaultLang].title,
		description: siteMeta[defaultLang].description,
		site: site.url || "https://example.com",
		items: published.map((post) => ({
			title: post.data.title,
			pubDate: post.data.date,
			description: post.data.description,
			link: langPath(defaultLang, `/blog/${post.data.slug}/`),
		})),
	});
}