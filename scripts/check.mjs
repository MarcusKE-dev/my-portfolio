import {readFile, stat, access} from 'node:fs/promises';
import {resolve, dirname, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ORIGIN} from '../src/site.mjs';
process.chdir(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const read=p=>readFile(p,'utf8');
const pages=JSON.parse(await read('src/pages.json'));
const targets=[{slug:'home',canonical:ORIGIN+'/',file:'index.html',indexable:true},{slug:'projects',canonical:ORIGIN+'/projects.html',file:'projects.html',indexable:true},...pages.map(p=>({...p,file:p.slug==='404'?'404.html':p.slug+'/index.html'}))];
const errors=[],warnings=[];let assertions=0;
const check=(condition,msg)=>{assertions++;if(!condition)errors.push(msg);};
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m=>[m[1].toLowerCase(),m[2]??m[3]]));
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&nbsp;/g,' ');
const plain=s=>decode(s.replace(/<!--[^]*?-->|<(script|style)\b[^>]*>[^]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
const cache=new Map();
async function html(file){if(!cache.has(file))cache.set(file,await read(file));return cache.get(file);}
const titleSet=new Set(),descSet=new Set(),mainTexts={};
const footer=await read('src/partials/footer.html');
const footerLinks=[...footer.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
const banned=['delve','leverage','seamless','seamlessly','robust','cutting-edge','state-of-the-art','world-class','next-level','elevate','unlock','unleash','empower','supercharge','game-changer','transform your business','revolutionize','holistic','synergy','tapestry','landscape','ever-evolving','fast-paced','realm','testament','pivotal','crucial','foster','bespoke','streamline','navigate the complexities','one-stop shop','take your business to the next level','tailored solutions','solutions','passionate about','dive into'];
for(const page of targets) {
 let source;try{source=await html(page.file);}catch{errors.push('Missing page: '+page.file);continue;}
 const label=page.file+': ', head=source.match(/<head\b[^>]*>([^]*?)<\/head>/i)?.[1]||'';
 const body=source.match(/<body\b[^>]*>([^]*?)<\/body>/i)?.[1]||'';
 const tags=[...head.matchAll(/<(meta|link)\b[^>]*>/gi)].map(m=>attrs(m[0]));
 const meta=key=>tags.find(t=>t.name===key||t.property===key)?.content;
 const title=decode(head.match(/<title>([^]*?)<\/title>/i)?.[1]||'').trim(), desc=decode(meta('description')||'');
 check(Boolean(title),label+'missing title');check(title.length>=30,label+'title shorter than 30');
 if(title.length>60)warnings.push(label+'title above 60 ('+title.length+')');
 check(!titleSet.has(title),label+'duplicate title');titleSet.add(title);
 check(desc.length>=120&&desc.length<=160,label+'description length '+desc.length+' (expected 120 to 160)');
 check(!descSet.has(desc),label+'duplicate description');descSet.add(desc);
 check(tags.find(t=>t.rel==='canonical')?.href===page.canonical,label+'canonical must equal '+page.canonical);
 for(const lang of ['en','x-default'])check(tags.some(t=>t.hreflang===lang&&t.href===page.canonical),label+'missing matching hreflang '+lang);
 for(const key of ['og:type','og:site_name','og:title','og:description','og:url','og:image','og:image:alt','og:locale','twitter:card','twitter:title','twitter:description','twitter:image'])check(Boolean(meta(key)),label+'missing '+key);
 check(meta('og:site_name')==='Dev John',label+'wrong site name');
 check(meta('og:url')===page.canonical,label+'wrong OG URL');
 check(meta('twitter:card')==='summary_large_image',label+'wrong Twitter card');
 const og=meta('og:image');if(og)check(await exists(new URL(og).pathname.slice(1)),label+'missing OG image file');
 check(meta('robots')===(page.indexable?'index, follow, max-image-preview:large, max-snippet:-1':'noindex'),label+'robots policy');
 const hs=[...body.matchAll(/<h([1-6])\b[^>]*>/gi)].map(m=>Number(m[1]));
 check(hs.filter(n=>n===1).length===1,label+'must have exactly one H1');
 let previous=0;for(const level of hs){check(level<=previous+1,label+'heading skips from H'+previous+' to H'+level);previous=level;}
 const blocks=[...source.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([^]*?)<\/script>/g)];
 check(blocks.length===1,label+'expected one JSON-LD graph');
 for(const block of blocks)try {
  const data=JSON.parse(block[1]);check(Array.isArray(data['@graph']),label+'missing graph');
  const definitions=new Set(),references=[];
  function walk(o){if(!o||typeof o!=='object')return;if(o['@id']){if(Object.keys(o).length>1)definitions.add(o['@id']);else references.push(o['@id']);}for(const v of Object.values(o))if(v&&typeof v==='object')Array.isArray(v)?v.forEach(walk):walk(v);}
  walk(data);for(const id of references)check(definitions.has(id),label+'undefined schema reference '+id);
  const faqNodes=data['@graph'].filter(o=>o['@type']==='FAQPage');
  for(const node of faqNodes) for(const q of node.mainEntity||[]) {check(plain(body).includes(q.name),label+'FAQ question not visible');check(plain(body).includes(q.acceptedAnswer.text),label+'FAQ answer not visible');}
 }catch(e){errors.push(label+'invalid JSON-LD: '+e.message);}
 for(const match of source.matchAll(/<(?:a|link|img|script|source|iframe|video|audio)\b[^>]*>/gi)) {
  const a=attrs(match[0]);
  for(const key of ['src','href'])if(a[key])await checkLink(a[key],page,label);
 }
 for(const match of source.matchAll(/<img\b[^>]*>/gi)) {const a=attrs(match[0]);for(const k of ['alt','width','height'])check(k in a&& (k==='alt'||Number(a[k])>0),label+'image lacks '+k+': '+a.src);}
 for(const href of new Set(footerLinks))check(source.includes('href="'+href+'"'),label+'missing footer link '+href);
 check(head.includes("localStorage.getItem('theme')"),label+'missing inline theme script');
 for(const path of ['/favicon.svg','/favicon.ico','/favicon-48.png','/favicon-192.png','/favicon-512.png','/apple-touch-icon.png'])check(tags.some(t=>t.href===path||t.href===path.slice(1)),label+'missing icon '+path);
 if(!['home','projects'].includes(page.slug)) {
  const main=source.match(/<main\b[^>]*>([^]*?)<\/main>/i)?.[1]||'';
  const text=plain(main);mainTexts[page.slug]=text;
  check(!/[\u2013\u2014]/u.test(plain(body)),label+'forbidden dash');
  check(!/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\u2300-\u23FF]/u.test(plain(body)),label+'emoji or symbol');
  check(!plain(body).includes('!'),label+'exclamation in body text');
  for(const word of banned)check(!new RegExp('\\b'+word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(text.replaceAll('Dalo Plumbing Solutions','Dalo Plumbing')),label+'banned phrase: '+word);
  const content=main.replace(/<nav\b[^>]*class="breadcrumbs"[^>]*>[^]*?<\/nav>/,'');
  const words=plain(content).split(/\s+/).length;
  const minimum=page.slug==='about'?800:['pricing','international-clients'].includes(page.slug)?900:page.slug==='contact'?300:page.slug==='services'||page.slug.startsWith('services/')||page.slug.startsWith('web-developer-')?600:0;
  check(words>=minimum,label+words+' words, minimum '+minimum);
  check(source.includes('href="#main"')&&source.includes('id="main"'),label+'missing skip target');
  check(source.includes('<header>')&&source.includes('<footer>'),label+'missing landmarks');
  if(page.slug!=='404')check(source.includes('https://wa.me/254741104469?text='),label+'missing prefilled closing WhatsApp CTA');
 }
}
async function exists(file){try{await access(file);return true;}catch{return false;}}
async function checkLink(raw,page,label) {
 const value=decode(raw);
 if(/^(?:mailto:|tel:|data:|javascript:)/i.test(value))return;
 let url;try{url=new URL(value,page.canonical);}catch{check(false,label+'invalid link '+value);return;}
 if(url.origin!==ORIGIN)return;
 let path=decodeURIComponent(url.pathname).replace(/^\//,'');
 if(!path||path.endsWith('/'))path+='index.html';
 let good=await exists(path);
 if(good){const st=await stat(path);if(st.isDirectory()){path+='/index.html';good=await exists(path);}}
 check(good,label+'broken local link '+value);if(!good)return;
 if(url.hash&&['.html','.htm'].includes(extname(path))){const doc=await html(path);const id=decodeURIComponent(url.hash.slice(1));check(id===''||[...doc.matchAll(/\bid=["']([^"']+)["']/g)].some(m=>m[1]===id),label+'missing anchor '+value);}
}
const locations=['web-developer-kenya','web-developer-east-africa','web-developer-nigeria','international-clients'];
function grams(s){const w=s.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/);return new Set(w.slice(0,-4).map((_,i)=>w.slice(i,i+5).join(' ')));}
for(let a=0;a<locations.length;a++)for(let b=a+1;b<locations.length;b++)if(mainTexts[locations[a]]&&mainTexts[locations[b]]){const x=grams(mainTexts[locations[a]]),y=grams(mainTexts[locations[b]]);const shared=[...x].filter(g=>y.has(g)).length/Math.min(x.size,y.size);check(shared<=.35,'Location overlap '+locations[a]+' / '+locations[b]+': '+(shared*100).toFixed(1)+'%');console.log('Location overlap: '+locations[a]+' / '+locations[b]+' '+(shared*100).toFixed(1)+'%');}
const homeForm=(await read('index.html')).match(/<form class="form" id="cform"[^]*?<\/form>/)?.[0];
const contactForm=(await read('contact/index.html')).match(/<form class="form" id="cform"[^]*?<\/form>/)?.[0];
const normalizeForm=s=>s?.replace(/<!--[^]*?-->/g,'').replaceAll(' – ',' to ').replaceAll('1–3','1 to 3').replace(/\s+/g,' ').trim();
check(Boolean(homeForm)&&normalizeForm(homeForm)===normalizeForm(contactForm),'Contact form differs from homepage beyond permitted range punctuation');
const sitemap=await read('sitemap.xml'),locs=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const wanted=targets.filter(p=>p.indexable).map(p=>p.canonical);
check(locs.length===wanted.length,'Sitemap count differs');for(const url of wanted)check(locs.filter(u=>u===url).length===1,'Sitemap must contain exactly once: '+url);for(const url of locs)check(wanted.includes(url),'Unexpected sitemap URL '+url);
check((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)||[]).length===wanted.length,'Missing sitemap lastmod');
check(await exists('robots.txt'),'Missing lowercase robots.txt');check(!await exists('Robots.txt'),'Uppercase Robots.txt still exists');
const robots=await read('robots.txt');check(robots.includes('Sitemap: '+ORIGIN+'/sitemap.xml'),'Missing robots sitemap');
for(const file of ['llms.txt','llms-full.txt'])check(await exists(file),'Missing '+file);
for(const w of warnings)console.warn('WARN '+w);
for(const e of errors)console.error('FAIL '+e);
console.log(`${assertions} checks, ${errors.length} failures, ${warnings.length} warnings across ${targets.length} pages.`);
process.exitCode=errors.length?1:0;
