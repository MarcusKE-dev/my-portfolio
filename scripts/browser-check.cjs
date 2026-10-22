// Optional browser QA. Uses an existing Playwright installation, not a site dependency.
// Set PLAYWRIGHT_MODULE and CHROMIUM_PATH if the tools are outside node_modules.
// Optional DEVJOHN_FONT_DIR holds devjohn-{outfit,space,mono}.ttf for offline font checks.
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
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
 const fontFiles=['outfit','space','mono'].map(n=>path.join(process.env.DEVJOHN_FONT_DIR||'/tmp','devjohn-'+n+'.ttf'));
 const fontCSS=fontFiles.every(f=>fs.existsSync(f))?[['Outfit','outfit'],['Space Grotesk','space'],['JetBrains Mono','mono']].map(([family,file])=>`@font-face{font-family:'${family}';src:url(data:font/ttf;base64,${fs.readFileSync(path.join(process.env.DEVJOHN_FONT_DIR||'/tmp','devjohn-'+file+'.ttf')).toString('base64')});font-weight:100 900;font-display:swap;}`).join(''):null;
 const routeResources=route=>route.request().url().startsWith(origin)?route.continue():fontCSS&&route.request().url().startsWith('https://fonts.googleapis.com/')?route.fulfill({status:200,contentType:'text/css',body:fontCSS}):route.abort();
 const records=[],errors=[],paths=['/','/projects.html',...JSON.parse(fs.readFileSync(root+'/src/pages.json')).map(p=>p.slug==='404'?'/404.html':'/'+p.slug+'/')];
 try{
 const matrix=[]; for(const theme of ['dark','light'])for(const width of [360,768,1024,1440])matrix.push({theme,width});
 const run=async({theme,width})=>{
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await context.addInitScript(theme=>localStorage.setItem('theme',theme),theme);
  // Keep tests deterministic when external font/CDN services cannot be reached.
  await context.route('**/*',routeResources);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const url of paths){
   await page.goto(origin+url,{waitUntil:'load'}); await page.evaluate(()=>document.fonts.ready);
   // Reach all reveals and lazy images, then inspect top, middle and footer.
   const height=await page.evaluate(()=>document.documentElement.scrollHeight);
   for(let y=0;y<height;y+=700){await page.evaluate(y=>window.scrollTo({top:y,left:0,behavior:"instant"}),y);await page.waitForTimeout(8);}
   await page.evaluate(async()=>{const images=[...document.images].filter(i=>i.getAttribute('src').startsWith('/images/')||i.getAttribute('src').startsWith('images/'));images.forEach(i=>i.loading='eager');await Promise.all(images.map(i=>i.decode().catch(()=>{})));window.scrollTo({top:0,left:0,behavior:"instant"});});
   const result=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelector('h1')?.textContent.trim(),theme:document.documentElement.classList.contains('light')?'light':'dark',broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).filter(i=>i.getAttribute('src').startsWith('/images/')||i.getAttribute('src').startsWith('images/')).map(i=>i.src),animations:document.getAnimations().filter(a=>a.playState==='running').length}));
   assert.equal(result.scroll,width,url+' horizontal page overflow '+width+' '+theme);assert.equal(result.theme,theme);assert.deepEqual(result.broken,[]); if(url!=='/')assert.equal(result.animations,0,url+' reduced-motion animation');
   // Tab through the page; closed drawer links must never be focused.
   await page.keyboard.press('Tab');
   if(url!=='/')assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Skip to content',url+' first focus');
   if(url!=='/'){
    await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'main');
    const total=await page.locator('a,button,input:not([type=hidden]),textarea,[tabindex="0"],summary').count();
    for(let n=0;n<total+2;n++){
     await page.keyboard.press('Tab');
     assert.equal(await page.evaluate(()=>!!document.activeElement.closest('#drawer')&&!document.querySelector('#drawer').classList.contains('open')),false,url+' hidden menu focus');
    }
   }
   // Keyboard menu and focus loop at every width where a drawer is used.
   if(await page.locator('#navtoggle').isVisible()){
    await page.locator('#navtoggle').focus();await page.keyboard.press('Enter');await page.waitForTimeout(15);
    assert.equal(await page.locator('#navtoggle').getAttribute('aria-expanded'),'true');
    const menuBounds=await page.locator('#drawer').evaluate(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,header:document.getElementById('nav').getBoundingClientRect().bottom,height:innerHeight}));
    assert(menuBounds.top>=menuBounds.header-.5&&menuBounds.bottom<=menuBounds.height+.5,url+' drawer outside available viewport');
    assert.equal(await page.locator('#drawer a').first().textContent(),'All services');
    assert.equal(await page.locator('#drawer a').first().getAttribute('href'),'/services/');
    await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.closest('#drawer')?.id),'drawer');
    await page.keyboard.press('Escape');
    if(url!=='/')assert.equal(await page.evaluate(()=>document.activeElement.id),'navtoggle');
   }
   if(url==='/pricing/'){
    const wrap=page.locator('.table-scroll');await wrap.evaluate(e=>e.scrollLeft=e.scrollWidth);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
   }
   // Screenshot representative page regions for visual inspection.
   if(['/about/','/pricing/','/contact/','/international-clients/','/services/','/projects.html','/'].includes(url)&&[360,1440].includes(width)){
    await page.evaluate(()=>{window.scrollTo({top:0,left:0,behavior:"instant"});document.querySelectorAll('.price-scroller,.table-scroll').forEach(e=>e.scrollLeft=0);});
    await page.screenshot({path:`/tmp/devjohn-${url.replaceAll('/','').replace('.html','')||'home'}-${theme}-${width}.png`,fullPage:true});
   }
   records.push({url,width,theme,...result}); fs.writeFileSync('/tmp/devjohn-browser-progress.json',JSON.stringify(records)); console.log('PASS',theme,width,url);
  }
  await context.close();
 };
 for(let start=0;start<matrix.length;start+=2){const outcomes=await Promise.allSettled(matrix.slice(start,start+2).map(run));for(const result of outcomes)if(result.status==='rejected')throw result.reason;}
 const context=await browser.newContext({viewport:{width:360,height:900},reducedMotion:'no-preference'});
 await context.route('**/*',routeResources);
 const p=await context.newPage();
 for(const url of paths.filter(p=>p!=='/')){
  await p.goto(origin+url,{waitUntil:'load'});
  await p.locator('#themeToggle').click();await p.waitForTimeout(1550);
  assert.equal(await p.evaluate(()=>document.documentElement.classList.contains('light')),true,url+' animated toggle');
  await p.locator('#themeToggle').click();await p.waitForTimeout(1550);
  assert.equal(await p.evaluate(()=>document.documentElement.classList.contains('light')),false);
 }
 await p.goto(origin+'/about/',{waitUntil:'load'});
 await p.locator('.marquee').scrollIntoViewIfNeeded();await p.mouse.move(0,0);
 const techRows=await p.locator('.marq-row').evaluateAll(rows=>rows.map(r=>({animation:getComputedStyle(r).animationName,direction:getComputedStyle(r).animationDirection,wrap:getComputedStyle(r).flexWrap})));
 assert.deepEqual(techRows,[{animation:'marq',direction:'normal',wrap:'nowrap'},{animation:'marq',direction:'reverse',wrap:'nowrap'}]);
 await p.goto(origin+'/contact/',{waitUntil:'load'});
 for(const select of await p.locator('.custom-select').all()){
  const trigger=select.locator('.custom-select-trigger');await trigger.focus();await p.keyboard.press('ArrowDown');
  assert.equal(await p.evaluate(()=>document.activeElement.getAttribute('role')),'option');
  await p.keyboard.press('Enter');assert.notEqual(await select.locator('input').inputValue(),'');
 }
 await p.locator('#fname').fill('Local QA');await p.locator('#femail').fill('qa@example.invalid');await p.locator('#fmessage').fill('Local browser test. This request is intercepted and is not delivered.');
 await p.route('https://api.web3forms.com/submit',route=>route.fulfill({status:200,contentType:'application/json',body:'{"success":true}'}));
 await p.locator('#fsub').click();await p.locator('[role=status]').waitFor();
 assert.equal(await p.locator('[role=status]').textContent(),'Message sent successfullyI will get back to you within 24 hours.');
 assert.equal(await p.evaluate(()=>document.activeElement.getAttribute('role')),'status');
 const unknown=await p.goto(origin+'/missing-page-for-qa/');assert.equal(unknown.status(),404);assert.equal(await p.locator('h1').textContent(),'Page not found');
 await context.close();
 fs.writeFileSync('/tmp/devjohn-browser-results.json',JSON.stringify({records,errors,form:'Intercepted successful response, no external submission sent',animatedThemePages:16},null,2));
 assert.deepEqual(errors,[]);console.log(JSON.stringify({renders:records.length,errors,form:'Passed with intercepted response',animations:'Both theme directions checked on every inner page',notFound:'404 response and custom page verified locally'}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
