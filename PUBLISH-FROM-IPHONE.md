# Publishing from an iPhone

Everything except the TestFlight build can be done on the phone. Roughly 15 minutes.

---

## What you need first

Download **onwego-repo.zip**, then in the **Files** app: long-press it → **Uncompress**. You'll get a `onwego` folder containing:

```
index.html              ← inside www/ — this one file IS the app
netlify.toml            settings, so Netlify asks you nothing
package.json            one dependency, for the sync function
capacitor.config.json   for the TestFlight build later
netlify/functions/sync.mjs   sync + cloud backups
README.md               the full documentation
test/                   the test suite
```

---

## Step 1 — See it running (1 minute, optional but do it)

1. Safari → **app.netlify.com/drop**
2. Tap the drop zone. The Files picker opens.
3. Go into `onwego` → `www` and pick **index.html** by itself.
4. You get a live URL in a few seconds. Tap it.

That's the whole app, minus sync. If something feels wrong, tell me now — it's much easier to change before the repo exists.

To keep this preview, tap **Claim** and sign in. Otherwise ignore it; it expires on its own.

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

GitHub's phone uploader can't create folders, but the file *namer* can.

**For `www`:**
1. **Add file** → **Create new file**
2. In the filename box type exactly: `www/placeholder.txt` — the `/` turns into a folder
3. Type anything in the body, then **Commit changes**
4. Tap into the new **www** folder → **Add file** → **Upload files** → pick **index.html** → **Commit changes**
5. Delete `placeholder.txt` (open it → the **⋯** or trash icon → **Commit changes**)

**For the sync function:** same trick.
1. **Add file** → **Create new file** → name it `netlify/functions/placeholder.txt` → commit
2. Tap into `netlify/functions` → **Add file** → **Upload files** → pick **sync.mjs** → commit
3. Delete the placeholder

The `test/` folder is optional on the phone — add it later from the Mac.

---

## Step 5 — Connect Netlify

1. Safari → **app.netlify.com** → sign in (use **Sign in with GitHub**, it saves a step)
2. **Add new site** → **Import an existing project** → **GitHub**
3. Authorise Netlify, then pick your `onwego` repo
4. **Don't change any settings** — `netlify.toml` already sets the publish folder, the functions folder, and "no build command"
5. **Deploy**

About a minute later you have a URL. Every push to `main` from now on redeploys it.

Rename it under **Site configuration → Change site name** — you'll be typing this URL into the app in a moment, so make it short.

---

## Step 6 — Put it on your home screen

1. Open your Netlify URL in Safari
2. Share button → **Add to Home Screen**
3. It launches full-screen, no address bar, like an app

---

## Step 7 — Turn on sync and backups

1. In the app: **Rewards** → **Settings** → **Sync across devices**
2. Enter a passphrase — 8+ characters, treat it like a password. There's no account and no recovery, so put it in your password manager now.
3. **Save and sync now**
4. Leave **Site address** blank here. It's only needed inside the iOS app later.

Then **Settings → Backups** should show all three layers: this device, on-device history, and cloud snapshots.

Do the same passphrase on your Mac browser and the two stay in step.

---

## Step 8 — TestFlight (this part needs the Mac)

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
2. In the app's sync sheet, fill in **Site address** with your Netlify URL. The native shell serves the HTML locally, so it needs the full address to reach the sync function.
3. In Xcode: pick your team under **Signing & Capabilities**, set version and build number.

Then **Product → Archive → Distribute App → TestFlight**.

Internal testers (you, up to 100 devices on your own account) install with no App Store review.

---

## Updating it later

- **Content and code changes:** push to `main`, Netlify redeploys, and the web version updates. The home-screen icon picks it up on next launch.
- **The TestFlight app:** `npx cap sync ios`, bump the build number, archive again. The iOS app bundles its own copy of the HTML, so it doesn't update from Netlify.

---

## If something goes wrong

| What you see | What it means |
|---|---|
| Netlify says "Page not found" | The publish folder is wrong — check `netlify.toml` made it into the repo root |
| The app loads but sync says "Couldn't reach the server" | `netlify/functions/sync.mjs` didn't upload, or it's in the wrong folder |
| Deploy fails mentioning npm | `package.json` didn't make it to the repo root |
| Everything works but nothing saves | Private browsing — the app warns about this on launch |
