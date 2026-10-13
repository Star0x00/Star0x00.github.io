import { langPath } from "../../config";
import { getPosts } from "../../utils/posts";

export const prerender = true;

export async function GET() {
	const lang = "zh";
	const published = await getPosts(lang);

	const index = published.map((post) => ({
		id: post.data.slug,
		title: post.data.title,
		date: post.data.date.toISOString().slice(0, 10),
		description: post.data.description,
		tags: post.data.tags,
		url: langPath(lang, `/blog/${post.data.slug}`),
	}));

	return new Response(JSON.stringify(index), {
		headers: { "Content-Type": "application/json" },
	});
}