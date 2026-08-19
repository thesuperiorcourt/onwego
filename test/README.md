# Tests

No framework — plain Node with jsdom. From the repo root:

```bash
npm install jsdom          # once
node test/qa_sweep.cjs      # clicks every screen and sheet, reports structural problems
node test/a11y_test.cjs     # landmarks, headings, names, dialogs, focus, motion
node test/a11y_tasks_test.cjs
node test/a11y_track_test.cjs
node test/task_test.cjs     # tasks: search, filter, edit, add, layout sections
node test/track_test.cjs    # anchors and impact captions
node test/ripple_test.cjs   # smooth / consume / pace, strain warning, repeats
node test/fn_test.cjs       # logging, loot, grove
node test/backup_test.cjs   # device storage, snapshots, restore, undo
python3 test/a11y_contrast.py   # every colour pairing in every theme pack
node test/sync_server_test.cjs   # the Netlify function (needs @netlify/blobs stubbed or installed)
```

The tests load `www/index.html` directly, so there's nothing to build first.
