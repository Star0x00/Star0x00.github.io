import type { APIRoute } from "astro";
import { site, siteMeta } from "../config";
import { renderOgPng } from "../utils/og";

export const GET: APIRoute = async () => {
	const png = await renderOgPng({
		title: siteMeta.en.description,
		site: siteMeta.en.title,
		url: new URL(site.url).host,
	});

	return new Response(png, {
		headers: { "content-type": "image/png" },
	});
};
