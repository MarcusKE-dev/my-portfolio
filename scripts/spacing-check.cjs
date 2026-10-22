// Optional focused layout QA. Uses the same Playwright and font environment variables as browser-check.cjs.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 let file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+'/')){res.writeHead(403).end();return;}
 try {if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');}catch{}
 let status=200;if(!fs.existsSync(file)){file=path.join(root,'404.html');status=404;}
 res.writeHead(status,{'Content-Type':{'.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain','.xml':'application/xml'}[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
 const results=[],errors=[];
 const paths=['/','/projects.html',...JSON.parse(fs.readFileSync(root+'/src/pages.json')).map(p=>p.slug==='404'?'/404.html':'/'+p.slug+'/')];
 const fontCSS=[['Outfit','outfit'],['Space Grotesk','space'],['JetBrains Mono','mono']].map(([family,file])=>`@font-face{font-family:'${family}';src:url(data:font/ttf;base64,${fs.readFileSync(path.join(process.env.DEVJOHN_FONT_DIR||'/tmp','devjohn-'+file+'.ttf')).toString('base64')});font-weight:100 900;font-display:swap;}`).join('');
 const run=async(theme,width)=>{
  const context=await browser.newContext({viewport:{width,height:800},hasTouch:width<=1024,isMobile:width<=768,reducedMotion:'reduce'});await context.addInitScript(t=>localStorage.setItem('theme',t),theme);await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.request().url().startsWith('https://fonts.googleapis.com/')?r.fulfill({status:200,contentType:'text/css',body:fontCSS}):r.abort());
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  for(const url of paths){
   await p.goto(origin+url,{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);
   await p.evaluate(()=>{document.querySelectorAll('.fade').forEach(e=>e.classList.add('show'));});
   if(url==='/') {
    await p.waitForTimeout(550);
    const links=await p.locator('.section-more').evaluateAll(rows=>rows.map(row=>{const a=row.querySelector('a'),r=a.getBoundingClientRect(),b=row.getBoundingClientRect();return {text:a.textContent,link:r.toJSON(),row:b.toJSON(),href:a.getAttribute('href')};}));
    assert.equal(links.length,3);for(const {text,link,row}of links){assert(Math.abs(link.left+link.width/2-width/2)<1,text+' not horizontally centered');assert(link.top>=row.top-.1&&link.bottom<=row.bottom+.1,text+' outside wrapper');assert(link.height>=44,text+' small target');assert(Math.abs(link.top+link.height/2-(row.top+row.height/2))<1,text+' not vertically centered in its gap');}
    // Read the real touch layout while the CTA and Tech Stack are in view.
    await p.locator('#services .section-more').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(80);
    const gap=await p.evaluate(()=>{const r=e=>e.getBoundingClientRect();const card=r(document.querySelector('#services .svc-slot:last-child')),a=r(document.querySelector('#services .section-more a')),heading=r(document.querySelector('#expertise h2'));return {above:a.top-card.bottom,below:heading.top-a.bottom,button:a.toJSON(),heading:heading.toJSON(),flip:document.querySelector('#services .svc-slot:last-child .svc-inner').style.transform};});
    assert(gap.above>=20&&gap.below>=20,'Services button overlaps a neighbouring section');assert(Math.abs(gap.above-gap.below)<1.5,'Services button not vertically centered');
    if(width<=1024)assert.equal(gap.flip,'rotateY(180deg)','Last touch service card no longer flips');
    await p.screenshot({path:`/tmp/devjohn-space-home-services-${theme}-${width}.png`});
    for(const [id,label]of [['about','about'],['pricing','pricing']]){await p.locator('#'+id+' .section-more').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(40);if(width===360||width===1440)await p.screenshot({path:`/tmp/devjohn-space-home-${label}-${theme}-${width}.png`});}
    results.push({url,width,theme,ctaGap:{above:gap.above,below:gap.below}});
   } else if(url==='/projects.html'){
    const gap=await p.evaluate(()=>document.querySelector('.proj-card').getBoundingClientRect().top-document.querySelector('.page-header .sec-desc').getBoundingClientRect().bottom);
    assert(gap>=24&&gap<=40,'Project introduction gap remains large: '+gap);results.push({url,width,theme,firstProjectGap:gap});
    await p.screenshot({path:`/tmp/devjohn-space-projects-${theme}-${width}.png`});
   } else {
    const padding=width<=760?20:28;
    const sections=await p.locator('#main > section').evaluateAll(ss=>ss.map(s=>({title:s.querySelector('h2')?.textContent,paddingTop:parseFloat(getComputedStyle(s).paddingTop),paddingBottom:parseFloat(getComputedStyle(s).paddingBottom),gap:s.nextElementSibling?.tagName==='SECTION'?s.nextElementSibling.querySelector('h2')?.getBoundingClientRect().top-s.lastElementChild.getBoundingClientRect().bottom:null})));
    sections.forEach(s=>{assert.equal(s.paddingTop,padding,url+' wrong top spacing');assert.equal(s.paddingBottom,padding,url+' wrong bottom spacing');if(s.gap!==null)assert(s.gap>=-1&&s.gap<=padding*2+2,url+' oversized gap after '+s.title+': '+s.gap);});
    if(url==='/about/')for(const title of ['How I work','Languages and tools']){await p.locator('h2').filter({hasText:title}).first().evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.screenshot({path:`/tmp/devjohn-space-about-${title.split(' ')[0]}-${theme}-${width}.png`});}
    if(url==='/services/'){await p.locator('h2').filter({hasText:'Which one do I need?'}).evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.screenshot({path:`/tmp/devjohn-space-services-${theme}-${width}.png`});}
    results.push({url,width,theme,sectionPadding:padding});
   }
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),width,url+' horizontal overflow');console.log('PASS',theme,width,url);
  }await context.close();
 };
 try{for(const theme of ['dark','light'])for(const width of [360,768,1024,1440])await run(theme,width);
  assert.deepEqual(errors,[]);fs.writeFileSync('/tmp/devjohn-spacing-results.json',JSON.stringify({renders:results.length,widths:[360,768,1024,1440],themes:['dark','light'],touchWidths:[360,768,1024],errors,results},null,2));console.log(JSON.stringify({renders:results.length,errors,homeButtons:'Centered and non-overlapping',touchDeck:'Last card still flips',innerSectionPadding:'20px mobile, 28px desktop',projectIntroductionGap:'32px'}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});