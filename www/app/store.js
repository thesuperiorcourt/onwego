/* ============================================================
   ON WE GO — core: storage, theme packs, world engine
   ============================================================ */

/* ---------- storage: artifact sandbox OR plain browser (Netlify) ---------- */
export const Store = {
  key: 'onwego.v1',
  legacy: ['questline.v1'],          /* earlier name — read once, then migrated */
  async load() {
    for (const k of [this.key, ...this.legacy]) {
      try {
        if (window.storage) {
          const r = await window.storage.get(k);
          if (r && r.value) return JSON.parse(r.value);
          continue;
        }
      } catch (e) { /* key absent in sandbox */ }
      try {
        const v = localStorage.getItem(k);
        if (v) return JSON.parse(v);
      } catch (e) { return null; }
    }
    return null;
  },
  async save(data) {
    const s = JSON.stringify(data);
    try {
      if (window.storage) { await window.storage.set(this.key, s); return; }
    } catch (e) { /* fall through */ }
    try { localStorage.setItem(this.key, s); } catch (e) {}
  }
};
