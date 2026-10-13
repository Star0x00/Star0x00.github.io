#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const enTitle = process.argv[2];
const zhTitle = process.argv[3] || enTitle;
if (!enTitle) {
	console.error('Usage: pnpm new-post "English Title" ["中文标题"]');
	process.exit(1);
}

const slug = enTitle
	.toLowerCase()
	.replace(/[^a-z0-9]+/g, "-")
	.replace(/^-|-$/g, "");

const now = new Date();
const date = `datetime(year: ${now.getFullYear()}, month: ${now.getMonth() + 1}, day: ${now.getDate()})`;

// Each post is a folder containing index.<lang>.typ + its own images.
// `index.en.typ` builds the /blog/... page, `index.zh.typ` the /zh/blog/... page.
const postDir = path.join("src/content/blog", slug);

if (fs.existsSync(postDir)) {
	console.error(`Post already exists: ${postDir}`);
	process.exit(1);
}

const template = (title) => `#import "../_template.typ": *

#show: post.with(
  title: "${title.replace(/"/g, '\\"')}",
  date: ${date},
  tags: (),
  description: "",
)

= ${title}

Write your post here.
`;

fs.mkdirSync(postDir, { recursive: true });

const enFile = path.join(postDir, "index.en.typ");
const zhFile = path.join(postDir, "index.zh.typ");
fs.writeFileSync(enFile, template(enTitle));
fs.writeFileSync(zhFile, template(zhTitle));

console.log(`Created: ${enFile}`);
console.log(`Created: ${zhFile}`);
console.log(`Images for this post go in: ${postDir}/`);