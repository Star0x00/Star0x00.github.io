import { getCollection } from "astro:content";
import type { Lang } from "../config";

/** Published posts of one language, newest first. */
export async function getPosts(lang: Lang) {
	const posts = await getCollection("blog");
	return posts
		.filter((p) => p.data.lang === lang && !p.data.draft)
		.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** All published posts, every language. */
export async function getAllPosts() {
	const posts = await getCollection("blog");
	return posts
		.filter((p) => !p.data.draft)
		.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}