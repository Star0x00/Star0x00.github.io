export const languages = {
	en: "English",
	zh: "中文",
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = "en";

export const site = {
	url: "https://blog.qwerhyy.cyou", // change this to your actual domain
	favicon: "/favicon.svg", // path to your favicon
} as const;

export const siteMeta: Record<Lang, { title: string; description: string }> = {
	en: {
		title: "Stardust Notebook",
		description: "A minimalist Typst-powered blog.",
	},
	zh: {
		title: "星尘笔记",
		description: "一个极简的 Typst 博客。",
	},
};

export const pagination = {
	pageSize: 5,
} as const;

export const navItems = [
	{ key: "home", href: "/" },
	{ key: "tags", href: "/tags" },
	{ key: "about", href: "/about" },
] as const;

export const ui = {
	en: {
		nav: { home: "Home", tags: "Tags", about: "About" },
		footer: "© 2026 Blog. Built with Astro & Typst.",
		tagline: "Words first. Nothing else.",
		searchPlaceholder: "Search posts…",
		noResults: "No results.",
		noPosts: "No posts yet.",
		noTags: "No tags yet.",
		tagsHint: "Scroll to zoom · Hover to highlight · Click to navigate",
		backToTags: "Back to tags",
		postLabel: (n: number) => `${n} post${n === 1 ? "" : "s"}`,
		previous: "← Previous",
		next: "Next →",
		theme: "Theme",
		language: "Language",
		outline: "Outline",
		aboutTitle: "About",
		aboutBody:
			'<p>This blog is built with <a href="https://astro.build">Astro</a> and <a href="https://typst.app">Typst</a>.</p><p>Words first. Nothing else.</p>',
	},
	zh: {
		nav: { home: "首页", tags: "标签", about: "关于" },
		footer: "© 2026 博客。由 Astro 与 Typst 驱动。",
		tagline: "文字优先，仅此而已。",
		searchPlaceholder: "搜索文章…",
		noResults: "没有结果。",
		noPosts: "还没有文章。",
		noTags: "还没有标签。",
		tagsHint: "滚轮缩放 · 悬停高亮 · 点击跳转",
		backToTags: "返回标签",
		postLabel: (n: number) => `${n} 篇文章`,
		previous: "← 上一页",
		next: "下一页 →",
		theme: "主题",
		language: "语言",
		outline: "目录",
		aboutTitle: "关于",
		aboutBody:
			'<p>本站使用 <a href="https://astro.build">Astro</a> 与 <a href="https://typst.app">Typst</a> 构建。</p><p>文字优先，仅此而已。</p>',
	},
} as const;

/** Prefix a root-relative path with the language segment (default lang has no prefix). */
export function langPath(lang: Lang, path: string): string {
	const clean = path.startsWith("/") ? path : `/${path}`;
	if (lang === defaultLang) return clean;
	return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

/** URL of the same page in the other language (prefix swap). */
export function switchLangUrl(current: Lang, pathname: string): string {
	const other: Lang = current === "en" ? "zh" : "en";
	let path = pathname;
	if (current !== defaultLang) {
		path = path.replace(new RegExp(`^/${current}(?=/|$)`), "") || "/";
	}
	return langPath(other, path);
}