import rss from "@astrojs/rss";
import { langPath, site, siteMeta } from "../../config";
import { getPosts } from "../../utils/posts";

export const prerender = true;

export async function GET() {
	const lang = "zh";
	const published = await getPosts(lang);

	return rss({
		title: siteMeta[lang].title,
		description: siteMeta[lang].description,
		site: site.url || "https://example.com",
		items: published.map((post) => ({
			title: post.data.title,
			pubDate: post.data.date,
			description: post.data.description,
			link: langPath(lang, `/blog/${post.data.slug}/`),
		})),
	});
}