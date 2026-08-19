# NAMING — where the name lives

The app will probably be renamed again before launch. This is the complete inventory, so a rename is a checklist rather than an archaeology project.

Three forms of the name are in use, and they do different jobs:

| Form | Example | Used for |
|---|---|---|
| **slug** | `onwego` | storage keys, headers, repo, site, bundle ID, database store names |
| **display** | `On We Go` | anything a person reads: title, app name, docs |
| **global** | `ONWEGO_CONFIG` | the one config object on `window` |

---

## In code

Counts are approximate and drift — grep before trusting them.

| File | What's in it | Care needed |
|---|---|---|
| `www/index.html` | `Store.key = 'onwego.v1'`, legacy key list, `onwego.snaps`, `onwego.undo`, `onwego.probe`, `onwego.account`, `onwego.sync`, `window.ONWEGO_CONFIG`, `<title>`, apple web-app title, export filename, section comment banners | **Highest risk.** Storage keys are load-bearing: changing one orphans real user data |
| `netlify/functions/sync.mjs` | header comment, payload validation message | low |
| `www/config.js` | `window.ONWEGO_CONFIG` | must match `index.html` exactly |
| `package.json` | `name`, `description` | low |
| `capacitor.config.json` | `appId`, `appName` | **appId must match App Store Connect** — cannot be changed after first submission |
| `netlify.toml` | comment | none |
| `db/schema.sql` | comment | none |
| `README.md`, `HANDOFF.md`, `PARTS.md`, `BRAINSTORM.md`, `PUBLISH-FROM-IPHONE.md` | prose | low |
| `test/*.cjs` | storage key names in assertions | update or tests fail misleadingly |

### The three that actually break things

1. **Device storage keys** (`onwego.v1` and friends, in `index.html`). Rename these and every existing user's data becomes invisible — it's still on disk under the old key, just unread. **Always add the old key to the legacy fallback list rather than replacing it.** There's already a working example: the `questline` → `onwego` rename kept `questline.v1` as a fallback.

2. **The `window.ONWEGO_CONFIG` global.** Set in `config.js`, read in `index.html`. If only one changes, the app silently loses its auth URL and looks like sign-in broke.

3. **The bundle ID** in `capacitor.config.json`. Must match what's registered in App Store Connect, and it's effectively permanent once submitted. Pick the final one before the first TestFlight build if you can — and if the app name is still in flux, a neutral bundle ID (`com.yourname.owg`) ages better than a branded one.

Note there is no shared header name any more — auth moved to a standard `Authorization: Bearer` header, so the client/server naming trap that caused an earlier outage is gone.

---

## Outside the repo

These have to be changed by hand, in this order — some depend on others.

| Where | What | Notes |
|---|---|---|
| GitHub | repository name | old URLs redirect, so low risk |
| Netlify | site name, and therefore the URL | **changing the URL breaks things**: Neon trusted domains, `apiBase` in `config.js` for the iOS build, and any home-screen shortcut |
| Neon | project name (cosmetic), **trusted domains** (functional) | must include the current site URL or sign-in fails |
| Google Cloud | OAuth client name, authorised redirect URIs | redirect URI is functional |
| App Store Connect | app name, bundle ID, SKU | bundle ID is permanent after submission |
| Apple Developer | App ID / identifier | tied to bundle ID |
| Custom domain, if any | DNS, Netlify domain settings | also update trusted domains and redirect URIs |

---

## Rename checklist

1. Decide all three forms up front: slug, display name, bundle ID.
2. **Code, in one commit:** update the files in the table above. For every storage key, add the old key to the legacy list — don't replace it.
3. Update the test assertions that reference storage keys, and run the suites.
4. Rename the Netlify site. Note the new URL.
5. Update Neon trusted domains with the new URL.
6. Update the Google OAuth authorised redirect URI.
7. Update `apiBase` in `config.js` if the iOS build uses it.
8. Rename the GitHub repo (last — it's the least fragile).
9. App Store Connect and Apple Developer, if a build exists.
10. Deploy, then verify: site loads, sign-in works, existing data still appears, cloud sync still finds your account.

**Verification that matters most:** open the app on a device that had data *before* the rename and confirm the data is still there. That's the failure this document exists to prevent.

---

## When the legacy list can be trimmed

Old storage keys can be dropped once every device you care about has opened the new build at least once. Until then they cost nothing. Leave them.
