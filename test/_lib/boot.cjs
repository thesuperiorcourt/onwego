/* Shared test bootstrap. Loads the real www/index.html into jsdom (for the
   DOM shell, styles and body markup), then imports the real
   www/app/main.js as a genuine ES module via Node's own loader -- jsdom
   itself can't execute type="module" scripts (unimplemented; still true
   as of jsdom 30), so this bypasses that entirely rather than working
   around it.

   G(code) is a drop-in replacement for the old `dom.window.eval(code)`
   pattern: it runs the string inside main.js's own module scope (which
   imports every named export from every module), so existing test code
   like G("openSlots(App.W, App.W.tracks[0])") keeps working unchanged.

   Each call gets a fresh module instance via a cache-busting query string
   -- Node's ESM loader caches by exact URL, and several suites boot more
   than once per process expecting a clean slate each time. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const INDEX_HTML = path.join(__dirname, '..', '..', 'www', 'index.html');
const MAIN_JS = path.join(__dirname, '..', '..', 'www', 'app', 'main.js');
let seq = 0;

async function bootApp(opts = {}) {
  let html = fs.readFileSync(INDEX_HTML, 'utf8');
  if (opts.configOverride) {
    html = html.replace(
      '<script src="./config.js"></script>',
      `<script>window.ONWEGO_CONFIG=${JSON.stringify(opts.configOverride)};</script>`
    );
  }
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: opts.url || 'https://x.test/'
  });
  dom.window.addEventListener('error', e => console.log('PAGE ERROR:', e.message));

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.localStorage = dom.window.localStorage;
  global.location = dom.window.location;
  global.__ONWEGO_TEST__ = true;
  /* App code calls bare fetch(...), which Node resolves against its own
     global -- not dom.window.fetch. A thin pass-through, re-read on every
     call, means a test's usual `window.fetch = stub` still reaches it. */
  global.fetch = (...args) => dom.window.fetch(...args);

  await import('file://' + MAIN_JS + '?boot=' + (seq++));
  await new Promise(r => setTimeout(r, opts.wait ?? 800));

  return {
    dom,
    document: dom.window.document,
    G: code => dom.window.__onwegoEval(code)
  };
}

module.exports = { bootApp };
