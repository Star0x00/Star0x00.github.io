#import "../_template.typ": *

#show: post.with(
  title: "Use pass to keep secrets",
  date: datetime(year: 2026, month: 10, day: 11),
  tags: ("linux", "gnu", "secrets"),
  description: "Use pass to keep secrets",
)

= Use pass to keep secrets

In our daily life, it is inevitable that we need to keep some secrets, such as API key, SSH key. There is software used to keep these secrets like `1Password` and `Bitwarden`. Below we will learn how to use pass, which is open-source,
together with gpg to keep them.

== How to use gpg
Before using pass, we need at least one gpg key. The default gnupg data directory is `~/.gnupg`. If you need to change it, you can set `$GNUPGHOME` or input `gpg --homedir path/to/dir`.

Then we can generate `Primary Key`#footnote[`--gen-key` can use default options to generate a key quickly]:
```shell-unix-generic
$ gpg --full-gen-key
```
It will ask some questions; if you don't know how to choose, keep the defaults. Finally we should enter a name, an email and a password. We don't set a password here#footnote[If necessary, see #link("https://wiki.gentoo.org/wiki/GnuPG")[gentoo wiki]].

After that, we can list keys to check whether it worked.
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
We can get that gpg has generated a `Primary Key` to sign and certify and a `Sub key` to encrypt.

The keys should be exported to back them up.
```shell-unix-generic
gpg --output larry.pub --export {key}                                       # Pub
gpg --output {key}.secret.gpg --export-secret-keys {key}                    # Secret
gpg --gen-revoke {key} > revoke.asc                                         # Rev(optional)
```
We can use `gpg --import` to import them from files.

== How to use pass
We can input `pass help` to see the basic command of pass#footnote[Some distros ship a man page for pass，but i couldn't find it on Fedora.].

When using pass for the first time, it will remind us to initialize.
```shell-unix-generic
$ pass

Error: password store is empty. Try "pass init".

$ pass init F6C836EF60AF99A86AD3059024F9826E9B10CDE5
mkdir: created directory '/root/.password-store/'
Password store initialized for F6C836EF60AF99A86AD3059024F9826E9B10CDE5
```
After that, we can insert secrets.
```shell-unix-generic
$ pass insert xxxx

Enter password for xxxx:
Retype password for xxxx:

$ pass

Password Store
└── xxxx
```
It also has `pass git` to manage the store. And it can generate password like others by using `pass generate pass-name length`.
