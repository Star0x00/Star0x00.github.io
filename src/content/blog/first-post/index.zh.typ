#import "../_template.typ": *

#show: post.with(
  title: "我的第一篇文章",
  date: datetime(year: 2026, month: 7, day: 1),
  tags: ("typst", "astro"),
  description: "用 Typst 写的第一篇博客",
)

= 我的第一篇文章

这是我用 *Typst* 写的第一篇博客。

Typst 是一个现代的排版系统，非常适合写作。让我演示一些它的功能。

== 图片

这是一个带说明文字的测试图：

#figure(
  image("test-image.png", width: 100%),
  caption: [带 *样式* 说明文字的测试图。],
)

== 数学

行内公式：$x^2 + y^2 = z^2$

独立公式：

$ integral_0^infinity e^(-x^2) dif x = sqrt(pi) / 2 $

== 脚注

这句话有一个脚注。[#footnote[这是脚注内容，会显示在文章旁边。]]

这里还有另一个脚注。[#footnote[第二个脚注，用于测试。]]

== 列表

- Typst 很快
- Typst 语法很好
- Typst 能做数学

== 提示框

> Tip: 这是一个有用的提示。

> Warning: 这是一个需要注意的警告。

== 代码

Typst 代码可以用 `raw` 块展示：

```typc
#let greet(name) = [
  Hello, #name!
]
```