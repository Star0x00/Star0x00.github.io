import { langPath, type Lang } from "../config";

interface GraphPost {
	id: string;
	data: { title: string; slug: string; tags?: string[] };
}

/**
 * Build the tags knowledge-graph data for one language.
 * Nodes = tags + posts, edges = post -> tag. Hrefs are language-prefixed.
 */
export function buildGraphData(posts: GraphPost[], lang: Lang) {
	const nodeId = (kind: "tag" | "post", name: string) => `${kind}:${name}`;

	const nodes: Array<{
		id: string;
		kind: "tag" | "post";
		label: string;
		href: string;
		size: number;
	}> = [];
	const links: Array<{ source: string; target: string }> = [];
	const seen = new Set<string>();

	for (const post of posts) {
		const pid = nodeId("post", post.id);
		if (!seen.has(pid)) {
			seen.add(pid);
			nodes.push({
				id: pid,
				kind: "post",
				label: post.data.title,
				href: langPath(lang, `/blog/${post.data.slug}`),
				size: 1,
			});
		}
		for (const tag of post.data.tags || []) {
			const tid = nodeId("tag", tag);
			if (!seen.has(tid)) {
				seen.add(tid);
				nodes.push({
					id: tid,
					kind: "tag",
					label: tag,
					href: langPath(lang, `/tags/${encodeURIComponent(tag)}`),
					size: 0,
				});
			}
			links.push({ source: pid, target: tid });
		}
	}

	// Tag node size = number of attached posts (more related, more prominent)
	const tagWeight = new Map<string, number>();
	for (const l of links) {
		const tag = nodes.find((n) => n.id === l.target);
		if (tag) tagWeight.set(tag.id, (tagWeight.get(tag.id) || 0) + 1);
	}
	for (const n of nodes) {
		if (n.kind === "tag") n.size = tagWeight.get(n.id) || 1;
	}

	return { nodes, links, graphData: JSON.stringify({ nodes, links }) };
}