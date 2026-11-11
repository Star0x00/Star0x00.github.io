import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from "astro";
import { site, siteMeta } from "../../../../config";
import { renderOgPng } from "../../../../utils/og";
import { getAllPosts } from "../../../../utils/posts";

export const getStaticPaths = (async () => {
	const posts = await getAllPosts();
	return posts
		.filter((post) => post.data.lang === "zh")
		.map((post) => ({
			params: { slug: post.data.slug },
			props: { title: post.data.title, date: post.data.date },
		}));
}) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ props }) => {
	const png = await renderOgPng({
		title: props.title,
		site: siteMeta.zh.title,
		date: props.date.toLocaleDateString("zh-CN", {
			year: "numeric",
			month: "short",
			day: "numeric",
		}),
		url: new URL(site.url).host,
	});

	return new Response(png, {
		headers: { "content-type": "image/png" },
	});
};
