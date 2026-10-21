import {readFile, writeFile, mkdir, access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
import {LOCATION, ORIGIN, AREAS, SERVICES, entities} from '../src/site.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
const read=p=>readFile(p,'utf8');
export const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function plain(s) { return s.replace(/<!--[^]*?-->|<(script|style)\b[^>]*>[^]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim(); }
const pages=JSON.parse(await read('src/pages.json'));
const packages=JSON.parse(await read('src/pricing.json'));
const projectData=JSON.parse(await read('src/projects.json'));
const partials=Object.fromEntries(await Promise.all(['head','nav','footer'].map(async n=>[n,await read('src/partials/'+n+'.html')])));
const render=(s,data)=>s.replace(/{{(\w+)}}/g,(_,k)=>data[k]??'');
export function offers() {
 return packages.flatMap((p,i)=>p.usd?['KES','USD'].map(currency=>({'@type':'Offer','@id':ORIGIN+'/pricing/#offer-'+i+'-'+currency,name:p.name+' starting price ('+currency+')',url:ORIGIN+'/pricing/#package-'+i,itemOffered:{'@type':'Service',name:p.name},seller:{'@id':ORIGIN+'/#john'},priceSpecification:{'@type':'PriceSpecification',priceCurrency:currency,minPrice:Number((currency==='KES'?p.kes:p.usd).replace(/[^\d]/g,''))}})):[{'@type':'Offer','@id':ORIGIN+'/pricing/#offer-'+i,name:p.name+' custom quote',url:ORIGIN+'/pricing/#package-'+i,itemOffered:{'@type':'Service',name:p.name},seller:{'@id':ORIGIN+'/#john'},description:'Custom quote after agreeing the scope.'}]);
}
export function graph(page,content='') {
 const url=page.canonical, g=entities();
 const breadcrumb={'@type':'BreadcrumbList','@id':url+'#breadcrumbs',itemListElement:page.breadcrumbs.map((b,i)=>({'@type':'ListItem',position:i+1,name:b.name,item:ORIGIN+b.url}))};
 const type=page.schemaType==='Service'?'WebPage':page.schemaType;
 const web={'@type':type,'@id':url+'#page',url,name:page.title,description:page.description,inLanguage:'en',isPartOf:{'@id':ORIGIN+'/#website'},author:{'@id':ORIGIN+'/#john'},breadcrumb:{'@id':url+'#breadcrumbs'}};
 g.push(web,breadcrumb);
 if(type==='ProfilePage') web.mainEntity={'@id':ORIGIN+'/#john'};
 if(type==='ContactPage') web.mainEntity=[{'@id':ORIGIN+'/#john'},{'@id':ORIGIN+'/#business'}];
 const questions=[...content.matchAll(/<details\b[^>]*>\s*<summary[^>]*>([^]*?)<\/summary>([^]*?)<\/details>/g)].map(m=>({'@type':'Question',name:plain(m[1]),acceptedAnswer:{'@type':'Answer',text:plain(m[2])}}));
 if(questions.length) {
  if(type==='FAQPage') web.mainEntity=questions;
  else g.push({'@type':'FAQPage','@id':url+'#faq',url:url+'#questions',mainEntity:questions,isPartOf:{'@id':url+'#page'}});
 }
 if(page.slug==='pricing') {
  g.push(...offers(),{'@type':'OfferCatalog','@id':url+'#catalog',name:'Website and software starting prices',itemListElement:offers().map(o=>({'@id':o['@id']}))});
  web.mainEntity={'@id':url+'#catalog'};
 }
 if(page.schemaType==='Service') {
  let indexes=page.slug.endsWith('web-development')?[0,1,2,3]:page.slug.endsWith('ecommerce-development')?[4]:[5,6];
  const selected=offers().filter(o=>indexes.some(i=>o['@id'].startsWith(ORIGIN+'/pricing/#offer-'+i)));
  g.push(...selected,{'@type':'Service','@id':url+'#service',name:page.h1,url,description:page.description,provider:{'@id':ORIGIN+'/#john'},areaServed:AREAS.map(name=>({'@type':'Country',name})),offers:selected.map(o=>({'@id':o['@id']}))});
  web.mainEntity={'@id':url+'#service'};
 }
 if(page.slug==='services') { const list={'@type':'ItemList','@id':url+'#services',itemListElement:SERVICES.map((name,i)=>({'@type':'ListItem',position:i+1,name}))}; g.push(list);web.mainEntity={'@id':list['@id']}; }
 if(page.slug==='projects') {
  g.push(...projectData.map((p,i)=>({'@type':'CreativeWork','@id':url+'#'+p.anchor,name:p.name,description:p.description,url:p.links.find(l=>!l.includes('github'))||p.links[0],image:ORIGIN+p.image,creator:{'@id':ORIGIN+'/#john'}})));
  g.push({'@type':'ItemList','@id':url+'#projects',itemListElement:projectData.map((p,i)=>({'@type':'ListItem',position:i+1,item:{'@id':url+'#'+p.anchor}}))});web.mainEntity={'@id':url+'#projects'};
 }
 return {'@context':'https://schema.org','@graph':g};
}
const built=[];
for(const page of pages) {
 const source='src/content/'+page.slug+'.html';
 try {await access(source);} catch {continue;}
 const content=render(await read(source),{location:escape(LOCATION)});
 const data={...page,title:escape(page.title),description:escape(page.description),location:escape(LOCATION),robots:page.indexable?'index, follow, max-image-preview:large, max-snippet:-1':'noindex',schema:JSON.stringify(graph(page,content)).replaceAll('<','\\u003c')};
 const active=s=>s.replace(/<a\b[^>]*href="([^"]+)"[^>]*>/g,(tag,href)=>href===new URL(page.canonical).pathname?tag.replace('>',' aria-current="page">'):tag);
 const crumbs='<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>'+page.breadcrumbs.map((b,i)=>'<li>'+(i===page.breadcrumbs.length-1?'<span aria-current="page">'+escape(b.name)+'</span>':'<a href="'+b.url+'">'+escape(b.name)+'</a>')+'</li>').join('')+'</ol></nav>';
 const html='<!DOCTYPE html>\n<html lang="en">\n<head>\n'+render(partials.head,data)+'\n</head>\n<body class="inner-page page-'+page.slug.replaceAll('/','-')+'">\n<a class="skip-link" href="#main">Skip to content</a>\n'+active(partials.nav)+'\n<main id="main" class="wrap">'+crumbs+'\n<h1>'+escape(page.h1)+'</h1>\n'+content+'\n</main>\n'+active(render(partials.footer,data))+'\n<script src="/script.js"></script>\n<script src="/pages.js"></script>\n</body>\n</html>\n';
 const output=page.slug==='404'?'404.html':page.slug+'/index.html';
 if(['index.html','projects.html'].includes(output)) throw Error('Refusing to overwrite existing page');
 await mkdir(dirname(output),{recursive:true});await writeFile(output,html);built.push({...page,output,content});
}
function lastmod(file,sources=[]) {
 // A changed source means the committed generated file is not the last change yet.
 try {
  const dirty=execFileSync('git',['status','--porcelain','--',file,...sources],{encoding:'utf8'}).trim();
  if(!dirty) {const d=execFileSync('git',['log','-1','--format=%cs','--',file,...sources],{encoding:'utf8'}).trim();if(d)return d;}
 } catch {}
 return new Date().toISOString().slice(0,10);
}
const existing=[{canonical:ORIGIN+'/',output:'index.html'},{canonical:ORIGIN+'/projects.html',output:'projects.html'}];
const urls=[...existing,...built.filter(p=>p.indexable)];
await writeFile('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(p=>'  <url><loc>'+p.canonical+'</loc><lastmod>'+lastmod(p.output,p.slug?['src/content/'+p.slug+'.html','src/pages.json','src/site.mjs','src/partials','scripts/build.mjs']:[])+'</lastmod></url>').join('\n')+'\n</urlset>\n');
await writeFile('llms.txt',`# Dev John (John Mwaura)\n\n> Dev John is the working name of John Mwaura, an independent web and software developer in ${LOCATION}. He builds business websites, online stores, custom software and WhatsApp automation for clients in Kenya, East Africa, Nigeria, the USA, Canada and the UK. He is the founder of ABC Systems.\n\n## Key pages\n- [About](${ORIGIN}/about/): who John Mwaura is and how he works\n- [Pricing](${ORIGIN}/pricing/): starting prices in KSh and USD\n- [Services](${ORIGIN}/services/): what he builds\n- [Projects](${ORIGIN}/projects.html): real projects with live links\n- [International clients](${ORIGIN}/international-clients/): how remote work with overseas clients runs\n- [Contact](${ORIGIN}/contact/): WhatsApp, email and the project form\n\n## Facts\n- Location: ${LOCATION}. Time zone: East Africa Time (UTC+3).\n- Reply time: within 24 hours.\n- Starting prices: from KSh 10,000 or $100.\n- Founder of ABC Systems: https://abcsystems.co.ke\n`);
const full=[];
for(const p of existing) {
 const h=await read(p.output);
 const main=h.match(/<main\b[^>]*>([^]*?)<\/main>/i)?.[1]??h.split('</header>').at(-1).split('<!-- ===== HERO ===== -->').at(-1).split('<footer>')[0];
 full.push(p.canonical+'\n'+plain(main));
}
for(const p of built.filter(p=>p.indexable)) full.push(p.canonical+'\n'+p.h1+'\n'+plain(p.content));
await writeFile('llms-full.txt','# Dev John (John Mwaura)\n\n'+full.join('\n\n')+'\n');
console.log('Built '+built.length+' new pages; existing homepage and projects were not overwritten.');
