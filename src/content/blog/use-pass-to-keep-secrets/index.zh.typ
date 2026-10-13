#import "../_template.typ": *

#show: post.with(
  title: "用pass来存储加密内容",
  date: datetime(year: 2026, month: 10, day: 11),
  tags: ("linux", "gnu", "secrets"),
  description: "用gnu pass以及gpg来保存加密内容",
)

= 用pass来存储加密内容

在pc的使用过程中，不可避免的会遇到一些需要加密存储的内容，比如`api key`、`ssh key`等。市面上也有一些提供密码存储的软件，比如`1password`、`Bitwarden`等，下面将会介绍
如何使用开源的`pass`配合`gpg`来保存这些内容以及一些`gpg`的基础用法。

== gpg的基本用法
在使用`pass`前，需要先有至少一个`gpg`密钥，`gnupg`的数据目录默认路径是`~/.gnupg`，有需求覆盖这个路径的，可以通过设置`$GNUPGHOME`和使用`gpg --homedir path/to/dir`来进行更改。

接下来进行`Primary Key`的生成#footnote[`--gen-key`这个可以使用默认参数快速生成。]:
```shell-unix-generic
$ gpg --full-gen-key
```
然后会询问一些问题，如果不知道就保持默认即可。最后输入name，email，密码按需使用，这里选择不用密码#footnote[具体选项内容可以见#link("https://wiki.gentoo.org/wiki/GnuPG")[gentoo wiki]]。

完成后可以列出key来进行验证是否生成成功。
```shell-unix-generic
$ gpg --list-keys

[keyboxd]
---------
pub   ed25519 2026-10-12 [SC]
      F6C836EF60AF99A86AD3059024F9826E9B10CDE5
uid           [ultimate] qwerhyy (main key) <qwerhyy@test.com>
sub   cv25519 2026-10-12 [E]

$ gpg --list-secret-keys

[keyboxd]
---------
sec   ed25519 2026-10-12 [SC]
      F6C836EF60AF99A86AD3059024F9826E9B10CDE5
uid           [ultimate] qwerhyy (main key) <qwerhyy@test.com>
ssb   cv25519 2026-10-12 [E]
```
这里可以看到，`gpg`生成了一个负责签名和认证的`Primary Key`，同时也有个能加密的`Sub Key`，这是`--full-gen-key`默认生成的，可以根据需要调整这个行为。这个负责加密的子密钥就是后续`pass`要用到的。

密钥需要导出进行保存。
```shell-unix-generic
gpg --output larry.pub --export {key}                                       # 公钥
gpg --output {key}.secret.gpg --export-secret-keys {key}                    # 私钥
gpg --gen-revoke {key} > revoke.asc                                         # 吊销证书（可选）
```
后续可以通过`gpg --import`进行导入。

== pass的基本用法
可以`pass help`来查看`pass`的基本命令#footnote[有些系统的pass打包有man手册，fedora的我倒是没有找到]

当第一次使用`pass`命令的时候，他可能会提示进行初始化
```shell-unix-generic
$ pass

Error: password store is empty. Try "pass init".
```
这时候运行`pass init`进行初始化。
```shell-unix-generic
$ pass init F6C836EF60AF99A86AD3059024F9826E9B10CDE5
mkdir: created directory '/root/.password-store/'
Password store initialized for F6C836EF60AF99A86AD3059024F9826E9B10CDE5
```
完成初始化后，就可以输入加密内容了。
```shell-unix-generic
$ pass insert xxxx

Enter password for xxxx:
Retype password for xxxx:

$ pass

Password Store
└── xxxx
```
`pass`还自带了`pass git`进行管理。同样，`pass`也可以像其他密码管理应用一样生成密码，只需使用`pass generate pass-name length`。
