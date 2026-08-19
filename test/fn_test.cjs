const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(require('path').join(__dirname,'..','www','index.html'),'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/'});
dom.window.addEventListener('error',e=>console.log('PAGE ERROR:',e.message));
setTimeout(()=>{const d=dom.window.document;
 d.querySelector('[data-log=boss]').click();
 setTimeout(()=>{
  console.log('stats:',[...d.querySelectorAll('.stat b')].map(e=>e.textContent).join(' / '));
  const drop=d.querySelector('.drop');
  console.log('loot modal:',!!drop,drop?drop.querySelector('h2').textContent:'','role',drop&&drop.getAttribute('role'));
  if(drop) d.querySelector('.drop [data-close]').click();
  d.querySelector('[data-view=hoard]').click();
  console.log('loot tiles:',d.querySelectorAll('.loot').length,'rarity label:',(d.querySelector('.loot small')||{}).textContent);
  d.querySelector('[data-view=grove]').click();
  console.log('grove h1:',d.querySelector('h1').textContent);
  dom.window.close();
  process.exit(0);
 },300);
},900);
