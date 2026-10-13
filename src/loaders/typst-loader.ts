import { execSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import type { Loader, LoaderContext } from "astro/loaders";
import { z } from "astro/zod";

interface TypFile {
	slug: string;
	lang: string;
	filePath: string;
}

const INDEX_TYP = /^index(?:\.([a-zA-Z]{2}))?\.typ$/;

/** Derive { slug, lang } from an absolute path, or null if it isn't a post file. */
function parseTypPath(
	contentDir: string,
	filePath: string,
	langs: string[],
	defaultLang: string,
): TypFile | null {
	const parts = relative(contentDir, filePath).split(sep);
	if (parts.length !== 2) return null;

	const [slug, file] = parts;
	if (!slug || slug.startsWith("_") || slug.startsWith(".")) return null;

	const match = file.match(INDEX_TYP);
	if (!match) return null;

	const lang = match[1] || defaultLang;
	if (!langs.includes(lang)) return null;

	return { slug, lang, filePath };
}

/** Collect all post files inside immediate subdirectories of `contentDir`. */
function findTypFiles(
	contentDir: string,
	langs: string[],
	defaultLang: string,
): TypFile[] {
	const results: TypFile[] = [];

	for (const entry of readdirSync(contentDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;

		for (const file of readdirSync(join(contentDir, entry.name))) {
			const parsed = parseTypPath(
				contentDir,
				join(contentDir, entry.name, file),
				langs,
				defaultLang,
			);
			if (parsed) results.push(parsed);
		}
	}

	return results;
}

/**
 * Extract frontmatter from a .typ file using typst eval.
 * Expects: #metadata((title: "...", date: datetime(...), ...))<frontmatter>
 *
 * @param root - project root passed to `typst eval --root` so that relative
 *               imports across subdirectories don't fail the sandbox check.
 */
function parseFrontmatter(filePath: string, root: string) {
	try {
		const out = execSync(
			`typst eval --root "${root}" 'query(<frontmatter>)' --in "${filePath}" --format json`,
			{ timeout: 10_000, stdio: "pipe", encoding: "utf-8" },
		);
		const parsed = JSON.parse(out);
		const meta = parsed?.[0]?.value;
		if (!meta) return null;

		const dateStr = String(meta.date || "");
		const date = dateStr.replace(
			/^datetime\(year:\s*(\d+),\s*month:\s*(\d+),\s*day:\s*(\d+).*\)$/,
			"$1-$2-$3",
		);

		return {
			title: String(meta.title || "Untitled"),
			date,
			draft: meta.draft === true,
			tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [],
			description: String(meta.description || ""),
		};
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		throw new Error(
			`typst eval failed for ${filePath}. Is typst installed? ${msg}`,
		);
	}
}

/** Parse + compile one post file and store the entry. */
async function syncEntry(
	ctx: Pick<LoaderContext, "store" | "parseData">,
	contentDir: string,
	{ slug, lang, filePath }: TypFile,
) {
	// Pass contentDir as --root so that `../_template.typ` and other relative
	// imports resolve while staying inside the typst sandbox.
	const metadata = parseFrontmatter(filePath, contentDir);
	if (!metadata) return false;

	// Compile to HTML in a throwaway temp dir.
	const workDir = mkdtempSync(join(tmpdir(), "astro-typst-"));
	const outFile = join(workDir, "out.html");
	try {
		execSync(
			`typst compile --root "${contentDir}" --features html --format html "${filePath}" "${outFile}"`,
			{ timeout: 15_000, stdio: "pipe" },
		);
		const fullHtml = readFileSync(outFile, "utf-8");
		const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
		const bodyContent = bodyMatch ? bodyMatch[1].trim() : fullHtml;

		// One entry per language: id = "<lang>/<slug>"
		const id = `${lang}/${slug}`;
		const data = await ctx.parseData<Record<string, unknown>>({
			id,
			data: { ...metadata, lang, slug, body: bodyContent },
		});
		ctx.store.set({ id, data });
		return true;
	} finally {
		rmSync(workDir, { recursive: true, force: true });
	}
}

export function typstLoader(options: {
	dir: string;
	langs: string[];
	defaultLang: string;
}): Loader {
	const { langs, defaultLang } = options;

	return {
		name: "typst-loader",

		load: async ({ store, parseData, logger, watcher }) => {
			const contentDir = resolve(options.dir);
			const files = findTypFiles(contentDir, langs, defaultLang);

			for (const file of files) {
				const ok = await syncEntry({ store, parseData }, contentDir, file);
				if (!ok) {
					logger.warn(`Skipping ${file.lang}/${file.slug}: no frontmatter found`);
				}
			}

			// Dev only: watch the content dir and recompile on change/add/unlink
			// so `astro dev` hot-reloads without a manual rebuild.
			if (!watcher) return;

			watcher.add(contentDir);

			const known = new Map<string, TypFile>(
				files.map((f) => [f.filePath, f]),
			);

			const resolveFile = (filePath: string) =>
				parseTypPath(contentDir, filePath, langs, defaultLang);

			const onAddOrChange = async (filePath: string) => {
				const parsed = resolveFile(filePath);
				if (!parsed) return;
				known.set(filePath, parsed);
				try {
					await syncEntry({ store, parseData }, contentDir, parsed);
					logger.info(`Reloaded ${parsed.lang}/${parsed.slug}`);
				} catch (err) {
					const msg = err instanceof Error ? err.message : String(err);
					logger.error(`Failed to reload ${parsed.lang}/${parsed.slug}: ${msg}`);
				}
			};

			watcher.on("add", onAddOrChange);
			watcher.on("change", onAddOrChange);
			watcher.on("unlink", (filePath: string) => {
				const parsed = known.get(filePath) ?? resolveFile(filePath);
				if (!parsed) return;
				known.delete(filePath);
				store.delete(`${parsed.lang}/${parsed.slug}`);
			});
		},

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
	};
}