const { bootApp } = require('./_lib/boot.cjs');

(async () => {
  const { dom, document: d } = await bootApp();
  d.querySelector('[data-log=boss]').click();
  setTimeout(() => {
    console.log('stats:', [...d.querySelectorAll('.stat b')].map(e => e.textContent).join(' / '));
    const drop = d.querySelector('.drop');
    console.log('loot modal:', !!drop, drop ? drop.querySelector('h2').textContent : '', 'role', drop && drop.getAttribute('role'));
    if (drop) d.querySelector('.drop [data-close]').click();
    d.querySelector('[data-view=hoard]').click();
    console.log('loot tiles:', d.querySelectorAll('.loot').length, 'rarity label:', (d.querySelector('.loot small') || {}).textContent);
    console.log('rewards h1:', d.querySelector('h1').textContent, '| garden section present:', !!d.getElementById('growH'), '| biomes section present:', !!d.getElementById('biomeH'));
    dom.window.close();
    process.exit(0);
  }, 300);
})();
