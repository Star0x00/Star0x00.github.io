import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
// 直接内联模板源码：构建产物里没有 src/ 目录，按 import.meta.url 定位会 ENOENT
import templateSource from "../og/og.typ?raw";

const execFileAsync = promisify(execFile);

let templatePath: string | null = null;
/** 把模板源码写到临时目录（typst 需要文件路径，不能读 stdin 当输入）。 */
function getTemplatePath(): string {
	if (!templatePath) {
		templatePath = join(mkdtempSync(join(tmpdir(), "astro-og-")), "og.typ");
		writeFileSync(templatePath, templateSource, "utf-8");
	}
	return templatePath;
}

export interface OgInputs {
	title: string;
	site: string;
	date?: string;
	url?: string;
}

/** 模板内容的哈希，模板一改，图片 URL 就跟着变（绕过平台缓存）。 */
const templateHash = createHash("sha256")
	.update(templateSource)
	.digest("hex")
	.slice(0, 8);

/** 给 OG 图片 URL 加上缓存刷新参数：模板或标题变了 URL 才变。 */
export function ogImageUrl(path: string, seed = ""): string {
	const v = createHash("sha256").update(templateHash).update(seed).digest("hex").slice(0, 8);
	return `${path}?v=${v}`;
}

/** 进程内缓存：同一张卡片在一次构建里只编译一次。 */
const cache = new Map<string, Uint8Array>();

/** 用 typst 把 OG 卡片编译成 PNG（1200×630）。 */
export async function renderOgPng(inputs: OgInputs): Promise<Uint8Array> {
	const key = JSON.stringify(inputs);
	const cached = cache.get(key);
	if (cached) return cached;

	const args = ["compile", getTemplatePath(), "-", "--format", "png", "--ppi", "72"];
	for (const [k, v] of Object.entries(inputs)) {
		if (v == null || v === "") continue;
		args.push("--input", `${k}=${v}`);
	}

	try {
		const { stdout } = await execFileAsync("typst", args, {
			encoding: "buffer",
			maxBuffer: 32 * 1024 * 1024,
		});
		const png = new Uint8Array(stdout);
		cache.set(key, png);
		return png;
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		throw new Error(`typst 编译 OG 图片失败（${inputs.title}）。typst 安装了吗？${msg}`);
	}
}
