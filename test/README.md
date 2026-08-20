# Tests

No framework — plain Node, using jsdom for the DOM shell and Node's own ES module loader for the real app code (`test/_lib/boot.cjs` loads `www/index.html` for the shell, then imports `www/app/main.js` for real — jsdom itself can't execute `type="module"` scripts). From the repo root:

```bash
npm install                      # once — jsdom is a pinned dependency
node test/qa_sweep.cjs           # clicks every screen and sheet, reports structural problems
node test/a11y_test.cjs          # landmarks, headings, names, dialogs, focus, motion
node test/a11y_tasks_test.cjs
node test/a11y_track_test.cjs
node test/task_test.cjs          # tasks: search, filter, edit, add, layout sections
node test/track_test.cjs         # anchors and impact captions
node test/ripple_test.cjs        # smooth / consume / pace anchors
node test/ripple_strain_test.cjs # the strain warning, trim, repeats
node test/missed_day_test.cjs        # missed-day detection and resolution (K1)
node test/missed_day_strain_test.cjs # strain warning on Timeline, honest redistribute
node test/fn_test.cjs            # logging, loot, rewards
node test/backup_test.cjs        # device storage, snapshots, restore, undo
node test/account_test.cjs       # signed-out behaviour, account status, client-side deletion flow
node test/error_report_test.cjs  # error.mjs + report.mjs — the Sentry envelope, or the log fallback
node test/sync_server_test.cjs   # the Netlify sync function, against a stubbed database and token verifier
python3 test/a11y_contrast.py    # every colour pairing in every theme pack
```

Two multi-phase suites are split across two files each (`ripple_test.cjs`/`ripple_strain_test.cjs`, `missed_day_test.cjs`/`missed_day_strain_test.cjs`) rather than chaining two boots in one process — Node's ES module cache doesn't refresh a second boot's imports within a single process, which breaks event listeners registered during the first boot. One process per file sidesteps that entirely.

Nothing to build first — the suites run straight against the source.
