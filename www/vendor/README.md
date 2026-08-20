# Auth SDK — vendored, not fetched

`auth.mjs` is Neon's Managed Better Auth client (`@neondatabase/neon-js@0.7.0-beta/auth`),
fetched from esm.sh's bundler and vendored here instead of imported from
esm.sh at runtime. `process.mjs`, `events.mjs`, `tty.mjs` and
`async_hooks.mjs` are its Node-shim dependencies, pulled in the same way —
the auth library references a couple of Node globals even in browser code.

Removes a third party (`esm.sh`) from every page load, removes the risk of
a CDN resolving "latest" out from under a pinned version, and makes the
iOS build work offline on first run — the native shell can't reach an
external CDN before the WebView has a network connection.

## Where this came from

```
https://esm.sh/@neondatabase/neon-js@0.7.0-beta/auth?bundle
```

The `?bundle` flag collapses the whole dependency graph into one file
(`auth.bundle.mjs`, renamed `auth.mjs` here) instead of esm.sh's usual
per-package import chain, which resolves against esm.sh's own domain and
would break once moved. Its remaining imports were the four Node shims
above; each one's absolute `/node/...` import path was rewritten to a
relative `./...` path so they resolve against this folder instead of
esm.sh's. Nothing else was changed — the auth bundle itself is untouched
except for one import line and the trailing `sourceMappingURL` comment
(dropped, since the source map wasn't vendored — cosmetic only, it only
affects devtools stepping into the SDK's own minified code).

`AUTH_CONFIG.sdk` in `www/index.html` points at `./vendor/auth.mjs`.

## Updating the version

Pinned deliberately — an unpinned CDN resolving "latest" is how an earlier
dependency outage happened. To move to a newer `neon-js` release: fetch
`https://esm.sh/@neondatabase/neon-js@<version>/auth?bundle`, follow its
`import` line to the real bundle file and fetch that, apply the same
relative-path rewrite to any Node-shim imports it still has (check with
`grep -n "^import" auth.mjs`, a version bump could add or drop one), and
replace the files here. Confirm `createAuthClient` is still among the
bundle's exports before shipping it.
