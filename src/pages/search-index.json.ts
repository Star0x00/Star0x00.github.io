import { defaultLang, langPath } from "../config";
import { getPosts } from "../utils/posts";

export const prerender = true;

export async function GET() {
	const published = await getPosts(defaultLang);

	const index = published.map((post) => ({
		id: post.data.slug,
		title: post.data.title,
		date: post.data.date.toISOString().slice(0, 10),
		description: post.data.description,
		tags: post.data.tags,
		url: langPath(defaultLang, `/blog/${post.data.slug}`),
	}));

	return new Response(JSON.stringify(index), {
		headers: { "Content-Type": "application/json" },
	});
}