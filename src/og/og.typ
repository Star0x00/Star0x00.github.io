// Open Graph 卡片模板（1200×630 px，用 --ppi 72 编译即 1pt = 1px）
// 输入：typst compile --input title="…" --input site="…" --input date="…" --input url="…"
// 配色固定为 Catppuccin Mocha，明暗主题下都好看。

#let input(key, default) = sys.inputs.at(key, default: default)

#let title = input("title", "Untitled")
#let site = input("site", "")
#let date = input("date", "")
#let url = input("url", "")

#set page(width: 1200pt, height: 630pt, margin: 72pt, fill: rgb("#1e1e2e"))
#set text(
  // 按顺序逐字形回退：CJK 标题用 Noto Sans CJK，缺字体时退回 DejaVu / 内置字体
  font: (
    "Noto Sans CJK SC",
    "Noto Sans",
    "DejaVu Sans",
    "New Computer Modern",
  ),
  fill: rgb("#cdd6f4"),
  size: 28pt,
  lang: "en",
)

#let title-size = if title.len() > 90 {
  44pt
} else if title.len() > 60 {
  52pt
} else if title.len() > 40 {
  60pt
} else {
  72pt
}

#grid(
  rows: (1fr, auto),
  align(
    left + top,
    {
      set text(size: 20pt, weight: 600, fill: rgb("#89b4fa"))
      upper(site)
      v(26pt, weak: true)
      set text(size: title-size, weight: 700, fill: rgb("#cdd6f4"))
      set par(leading: 0.65em)
      title
    },
  ),
  align(
    left + bottom,
    {
      line(length: 100%, stroke: 1pt + rgb("#313244"))
      v(18pt, weak: true)
      set text(size: 22pt, fill: rgb("#a6adc8"))
      set par(leading: 0.6em)
      grid(
        columns: (1fr, auto),
        date,
        url,
      )
    },
  ),
)
