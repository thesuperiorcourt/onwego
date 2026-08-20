# Publishing from an iPhone

Everything except the TestFlight build can be done on the phone. The client is now a folder of ES modules rather than one file, so there are more upload steps than there used to be — budget 25–30 minutes, most of it repetitive multi-select uploads.

---

## What you need first

Download **onwego-repo.zip**, then in the **Files** app: long-press it → **Uncompress**. You'll get a `onwego` folder. The pieces that matter for this walkthrough:

```
www/index.html                the page shell — not the whole app anymore
www/config.js                 your Auth URL and (for iOS) your site address
www/app/*.js                  the app itself — twelve files
www/app/screens/*.js          three more, for Today/Timeline/Rewards
www/seed/campaign.js          the example campaign — one file
www/fonts/*.woff2             self-hosted fonts (8 files) + a README
www/vendor/*.mjs              the self-hosted auth SDK (5 files) + a README
netlify.toml                  settings, so Netlify asks you nothing
package.json                  pinned dependencies, for the sync function
capacitor.config.json         for the TestFlight build later
netlify/functions/sync.mjs    sync + cloud backups + account deletion
netlify/functions/error.mjs   error reporting
netlify/functions/lib/report.mjs   shared by both functions above
db/schema.sql                 run once in Neon, creates the two app tables
db/rls_role.sql               optional hardening — see Step 8
README.md                     the full documentation
test/                         the test suite
```

---

## Step 1 — See it running (1 minute, optional but do it)

1. Safari → **app.netlify.com/drop**
2. Tap the drop zone. The Files picker opens.
3. Go into `onwego` → `www` and pick **index.html** by itself.
4. You get a live URL in a few seconds. Tap it.

You'll see the page shell boot, but the app itself won't load this way — the module files need to be served from their real relative paths, which a single-file drop can't give you. This step is just to confirm the zip extracted cleanly. If something looks obviously wrong, stop and check the download before going further.

---

## Step 2 — Make the GitHub repo

1. Safari → **github.com** → **+** → **New repository**
2. Name it `onwego`. **Private** is fine.
3. Tick **Add a README file** — this creates the main branch so the web editor works.
4. **Create repository**

If GitHub's buttons are cramped, tap **aA** in the address bar → **Request Desktop Website**. The upload menu is easier that way.

---

## Step 3 — Upload the root files

1. In the repo: **Add file** → **Upload files**
2. **Choose your files** → in the picker, select `netlify.toml`, `package.json`, `capacitor.config.json`, and `README.md` (tap and hold to multi-select)
3. **Commit changes**

---

## Step 4 — Make the folders, then fill them

GitHub's phone uploader can't create folders, but the file *namer* can: create a placeholder file with a `/` in its name, which becomes a folder, then upload the real files into it and delete the placeholder. Repeat this pattern for each folder below — the Files app's picker supports multi-select within one folder, so each of these is one upload action, not one per file.

**`www`** (just `index.html` and `config.js` at this level):
1. **Add file** → **Create new file** → type `www/placeholder.txt` → commit
2. Tap into **www** → **Add file** → **Upload files** → select `index.html` and `config.js` together → commit
3. Delete `placeholder.txt`

**`www/app`** (twelve files):
1. **Add file** → **Create new file** → type `www/app/placeholder.txt` → commit
2. Tap into **www/app** → **Upload files** → select all twelve `.js` files → commit
3. Delete `placeholder.txt`

**`www/app/screens`** (three files):
Same pattern: `www/app/screens/placeholder.txt`, upload `tonight.js`, `trail.js`, `hoard.js` together, delete the placeholder.

**`www/seed`** (one file):
`www/seed/placeholder.txt`, upload `campaign.js`, delete the placeholder.

**`www/fonts`** (eight `.woff2` files plus a README):
`www/fonts/placeholder.txt`, upload all nine files together, delete the placeholder.

**`www/vendor`** (five `.mjs` files plus a README):
`www/vendor/placeholder.txt`, upload all six files together, delete the placeholder.

**`netlify/functions`**:
`netlify/functions/placeholder.txt`, upload `sync.mjs` and `error.mjs` together, delete the placeholder.

**`netlify/functions/lib`**:
`netlify/functions/lib/placeholder.txt`, upload `report.mjs`, delete the placeholder.

**`db`**:
`db/placeholder.txt`, upload `schema.sql` and `rls_role.sql` together, delete the placeholder.

The `test/` folder is optional on the phone — add it later from the Mac.

---

## Step 5 — Connect Netlify

1. Safari → **app.netlify.com** → sign in (use **Sign in with GitHub**, it saves a step)
2. **Add new site** → **Import an existing project** → **GitHub**
3. Authorise Netlify, then pick your `onwego` repo
4. **Don't change any settings** — `netlify.toml` already sets the publish folder, the functions folder, and "no build command"
5. **Deploy**

About a minute later you have a URL.

Rename it under **Site configuration → Change site name** — you'll be typing this URL into the app in a moment, so make it short.

**On auto-deploy:** by default every push to `main` redeploys automatically. Once you're iterating heavily and pushing many small commits, consider turning that off (Site configuration → Build & deploy → Stop builds) and deploying deliberately instead with `netlify deploy --prod` from a Mac — see `STACK.md` for why this became worth doing.

---

## Step 6 — Set up Neon and turn on sync

This replaced the old passphrase system entirely — there's no shared secret to invent anymore, just signing in with Google or an emailed code.

1. Safari → **console.neon.tech** → create a project, then turn on **Auth** for it (your project → **Auth**). This gives you an Auth URL like `https://ep-....neonauth.....aws.neon.tech/neondb/auth`.
2. In Neon's **SQL Editor**, paste in `db/schema.sql` and run it once, against your main branch. Creates `app_state` and `app_snapshot`; Neon Auth already owns its own schema.
3. Back in Netlify — **Site configuration → Environment variables** — add:
   - `DATABASE_URL` — the **pooled** connection string from Neon's Connection Details, not the direct one
   - `NEON_AUTH_URL` — the Auth URL from step 1
   - `ALLOW_EMAILS` — optional, comma-separated invite list; leave unset for open signup
4. Point the client at your Auth URL — edit `authUrl` in `www/config.js` (through GitHub's file editor, the pencil icon) to the value from step 1 and commit, or leave it blank and paste it into the app's own **Settings → Account** sheet the first time you open it.
5. Open your Netlify URL → **Rewards → Settings → Account** → sign in with Google or an emailed code.

That's a working, synced app. The rest of this document (Step 8 onward, before TestFlight) is optional hardening you can do anytime after.

---

## Step 7 — Put it on your home screen

1. Open your Netlify URL in Safari
2. Share button → **Add to Home Screen**
3. It launches full-screen, no address bar, like an app

---

## Step 8 — Optional: account deletion, error monitoring, row-level security

None of these block a working app — skip this step entirely and come back later if you'd rather. Each is independent of the others.

**Account deletion reaching the login itself, not just the data** — three more Netlify env vars: `NEON_API_KEY` (Neon Console → account/org → API Keys), `NEON_PROJECT_ID` and `NEON_BRANCH_ID` (Neon Console → your project's settings, and the Branches tab — use the id that starts with `br-`, not the branch's display name). Without these, deletion still erases every row for the account; it just can't remove the login.

**Error monitoring** — sign up for Sentry's free tier, create a project (platform choice doesn't matter — this app posts errors directly, not through Sentry's SDK), copy its DSN from **Settings → Client Keys (DSN)**, set it as `SENTRY_DSN` in Netlify.

**Row-level security** — see `db/rls_role.sql` for the exact steps: creates a restricted database role so a bug in the sync function's own filtering isn't the only thing standing between one account's data and another's. Requires editing `DATABASE_URL` afterward, which is a real, live-traffic-affecting change — read the file's own comments before running it.

---

## Step 9 — TestFlight (this part needs the Mac)

```bash
git clone https://github.com/YOUR-NAME/onwego.git
cd onwego
npm install
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/ios@latest
npx cap add ios
npx cap sync ios
npx cap open ios
```

Before the first build:

1. In `capacitor.config.json`, change `appId` to your real bundle ID (`com.yourname.onwego`) and register that ID in App Store Connect.
2. In the app's Account sheet, fill in **Site address** with your Netlify URL. The native shell serves the HTML locally, so it needs the full address to reach the sync function.
3. In Xcode: pick your team under **Signing & Capabilities**, set version and build number.

Then **Product → Archive → Distribute App → TestFlight**.

Internal testers (you, up to 100 devices on your own account) install with no App Store review.

---

## Updating it later

- **Content and code changes:** push to `main` — if auto-deploy is still on, Netlify redeploys and the web version updates on its own; if you turned it off (Step 5), run `netlify deploy --prod` yourself. The home-screen icon picks up either kind of update on next launch.
- **The TestFlight app:** `npx cap sync ios`, bump the build number, archive again. The iOS app bundles its own copy of the HTML and JS, so it doesn't update from Netlify automatically.

---

## If something goes wrong

| What you see | What it means |
|---|---|
| Netlify says "Page not found" | The publish folder is wrong — check `netlify.toml` made it into the repo root |
| The page loads but is blank / stuck | A module file is missing or in the wrong folder — check the browser console, or re-check Step 4's uploads against the file list at the top of this document |
| The app loads but sync says "Couldn't reach the server" | `netlify/functions/sync.mjs` or its `lib/report.mjs` didn't upload, or `DATABASE_URL`/`NEON_AUTH_URL` aren't set |
| Deploy fails mentioning npm | `package.json` didn't make it to the repo root |
| Everything works but nothing saves | Private browsing — the app warns about this on launch |
| Sign-in works but nothing looks unlocked | `www/config.js`'s `authUrl` doesn't match what you set in Neon — they have to agree exactly |
