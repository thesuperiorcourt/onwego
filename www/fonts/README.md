# Fonts — vendored, not fetched

Figtree and Fraunces, both SIL Open Font License — free to redistribute and
self-host. Downloaded straight from Google Fonts' CDN (`fonts.gstatic.com`),
byte-identical to what Google was serving; only where they live changed.

Removes a third party (`fonts.googleapis.com`/`fonts.gstatic.com`) from
every page load, and makes the iOS build work offline on first run — it
can't reach an external CDN before the WebView has a network connection.

## Where these came from

Fetched from the CSS Google Fonts generated for this exact query:

```
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,400..800,50,1;1,9..144,400..700,50,1&family=Figtree:wght@400;500;600;800&display=swap
```

Both are variable fonts — one file per unicode range covers every weight
(and, for Fraunces, the `opsz`/`SOFT`/`WONK` axes the app's CSS uses via
`font-variation-settings`). Google's CSS declares the same file under
several `font-weight` values; here each is collapsed to a single
`@font-face` with a weight *range* (`400 800`), which is the standard way
to self-host a variable font and behaves identically.

| File | Family | Style | Weight | Unicode range |
|---|---|---|---|---|
| `figtree-latin.woff2` | Figtree | normal | 400–800 | latin |
| `figtree-latin-ext.woff2` | Figtree | normal | 400–800 | latin-ext |
| `fraunces-normal-latin.woff2` | Fraunces | normal | 400–800 | latin |
| `fraunces-normal-latin-ext.woff2` | Fraunces | normal | 400–800 | latin-ext |
| `fraunces-normal-vietnamese.woff2` | Fraunces | normal | 400–800 | vietnamese |
| `fraunces-italic-latin.woff2` | Fraunces | italic | 400–700 | latin |
| `fraunces-italic-latin-ext.woff2` | Fraunces | italic | 400–700 | latin-ext |
| `fraunces-italic-vietnamese.woff2` | Fraunces | italic | 400–700 | vietnamese |

The `@font-face` rules themselves live in `www/index.html`, right after the
opening `<style>` tag.

## Updating a version

Google occasionally revises a font's outlines (a new `v` number in the
gstatic path). To pick up a new version: fetch the CSS from the URL above,
find the `.woff2` URLs it references, download those, replace the files
here with the same names, and confirm the unicode-range values in
`index.html` still match — they rarely change, but check.
