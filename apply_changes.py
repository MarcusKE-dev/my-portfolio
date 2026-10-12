#!/usr/bin/env python3
"""Run from your portfolio folder:  python3 apply_changes.py
Patches index.html, style.css, script.js, project-style.css, project-script.js.
Originals are saved as *.bak. Nothing is written unless every patch matches."""
import re, sys, shutil, pathlib

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
texts = {}

def load(name):
    p = ROOT / name
    if not p.exists():
        sys.exit(f'Missing file: {p}')
    texts[name] = p.read_text(encoding='utf-8').replace('\r\n', '\n')

def sub(name, pattern, new, label):
    out, n = re.subn(pattern, lambda m: new, texts[name], count=1, flags=re.S)
    if n != 1:
        sys.exit(f'[{name}] could not find: {label} (nothing was changed)')
    texts[name] = out

def rep(name, old, new, label, count=1):
    if texts[name].count(old) != count:
        sys.exit(f'[{name}] could not find: {label} (nothing was changed)')
    texts[name] = texts[name].replace(old, new)

# ---------------------------------------------------------------- data
SERVICES = [
 ("Full-Stack Product Development", ["Next.js", "TypeScript", "PostgreSQL"],
  "Design and development of complete web platforms, from database architecture and authentication to deployment, monitoring, and long-term scalability.",
  '<rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="8" x2="22" y2="8"/><polyline points="9 13 7 15 9 17"/><polyline points="15 13 17 15 15 17"/>'),
 ("API Architecture &amp; Systems Integration", ["Node.js", "Prisma", "REST APIs"],
  "Secure backend systems, third-party integrations, payment gateways, webhooks, authentication flows, and business-critical APIs.",
  '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>'),
 ("E-Commerce &amp; Payment Platforms", ["M-Pesa", "Stripe", "Commerce"],
  "High-conversion storefronts with M-Pesa, Stripe, inventory management, order tracking, customer accounts, and administrative workflows.",
  '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>'),
 ("WhatsApp Automation &amp; Customer Workflows", ["WhatsApp API", "Automation", "CRM Sync"],
  "Automated customer engagement systems that capture leads, process orders, send notifications, and synchronize with existing business tools.",
  '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'),
 ("Dashboards &amp; Internal Operations Systems", ["RBAC", "Analytics", "Real-Time"],
  "Real-time reporting platforms, analytics dashboards, role-based administration, audit trails, and operational management tools.",
  '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>'),
 ("Performance Engineering &amp; Technical SEO", ["Core Web Vitals", "Schema.org", "SEO"],
  "Core Web Vitals optimization, structured data implementation, search visibility improvements, caching strategies, and performance audits.",
  '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
 ("Cloud Deployment &amp; DevOps", ["Docker", "GitHub Actions", "Cloud Infrastructure"],
  "Production deployments, CI/CD pipelines, infrastructure automation, environment management, monitoring, and operational reliability.",
  '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>'),
 ("Public Sector &amp; Civic-Tech Platforms", ["Open Data", "Case Management", "Transparency"],
  "Transparency, accountability, case-management, and public-data systems designed for government agencies, NGOs, and civic organizations.",
  '<polygon points="12 2 20 7 4 7"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><line x1="3" y1="22" x2="21" y2="22"/><line x1="2" y1="18" x2="22" y2="18"/>'),
]

TESTIMONIALS = [
 ("ND", "Niks Digital Connections", "Business Owner",
  "John was easy to work with and delivered the e-commerce platform on time. He handled the technical side, including the M-Pesa integration, and the final system made things much easier for us."),
 ("KW", "Karen West Natural Spring", "Management Team",
  "John did a great job on our website. He handled the development, SEO, email setup, and deployment, and was available when we needed technical support."),
 ("CL", "Client Feedback", "Project Stakeholder",
  "John was responsive and clear throughout the project. The final website matched what we needed, and it was easy to work with him from start to finish."),
]

QUOTE = 'M4 18c0-6 3-10 9-12l1 2.2C11 9.4 9.7 11 9.4 13H14v11H4V18zm14 0c0-6 3-10 9-12l1 2.2c-3 1.2-4.3 2.8-4.6 4.8H28v11H18V18z'

def svc_card(i, s):
    title, tags, desc, icon = s
    tag_html = ''.join(f'<span class="stag">{t}</span>' for t in tags)
    return f'''        <div class="svc-slot" style="--i:{i}">
          <article class="svc-card" tabindex="0">
            <div class="svc-glow"></div>
            <div class="svc-inner">
              <div class="svc-face svc-front">
                <span class="svc-num">{i + 1:02d} / {len(SERVICES):02d}</span>
                <div class="svc-ico"><svg viewBox="0 0 24 24" aria-hidden="true">{icon}</svg></div>
                <h3 class="svc-title">{title}</h3>
                <div class="svc-tags">{tag_html}</div>
              </div>
              <div class="svc-face svc-back">
                <h3 class="svc-title">{title}</h3>
                <p class="svc-desc">{desc}</p>
              </div>
            </div>
          </article>
        </div>'''

def t_card(t):
    av, name, role, quote = t
    return (f'        <figure class="t-card"><span class="qicon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="{QUOTE}"/></svg></span>'
            f'<div class="t-stars">★★★★★</div><blockquote class="t-quote">“{quote}”</blockquote>'
            f'<figcaption class="t-by"><span class="t-av">{av}</span><span><span class="t-name">{name}</span><span class="t-role">{role}</span></span></figcaption></figure>')

SERVICES_HTML = '''  <!-- ===== SERVICES (sticky stacked deck + 3D icon marquee) ===== -->
  <section id="services">
    <div class="wrap">
      <div class="sec-hdr fade">
        <h2 class="sec-title">Services</h2>
        <p class="sec-desc">Production-grade systems built for scale, automation, and measurable business outcomes. Scroll to stack the deck, hover or tap a card for details.</p>
      </div>
      <div class="deck" id="deck">
''' + '\n'.join(svc_card(i, s) for i, s in enumerate(SERVICES)) + '''
      </div>
    </div>
    <div class="svc-marquee" aria-label="Jump to a service"><div class="svc-track"></div></div>
  </section>

'''

TESTIMONIALS_HTML = '''  <!-- ===== TESTIMONIALS (right-to-left marquee) ===== -->
  <section id="testimonials">
    <div class="wrap">
      <div class="sec-hdr fade">
        <h2 class="sec-title">What my clients say</h2>
        <p class="sec-desc">Feedback from clients and business owners I've worked with.</p>
      </div>
    </div>
    <div class="t-marquee" aria-label="Client testimonials">
      <div class="t-track">
''' + '\n'.join(t_card(t) for t in TESTIMONIALS) + '''
      </div>
    </div>
  </section>

'''

# ---------------------------------------------------------------- CSS
SERVICES_CSS = r'''/* ===== SERVICES: sticky stacked deck + 3D icon marquee ===== */
:root {
  --e1: rgba(255,255,255,.5); --e2: rgba(255,255,255,.32); --e3: rgba(255,255,255,.2); --e4: rgba(255,255,255,.1);
  --glass: rgba(18,18,18,.74); --gb1: rgba(255,255,255,.3); --gb2: rgba(255,255,255,.04); --glow: rgba(255,255,255,.13);
}
:root.light {
  --e1: rgba(0,0,0,.5); --e2: rgba(0,0,0,.32); --e3: rgba(0,0,0,.2); --e4: rgba(0,0,0,.1);
  --glass: rgba(255,255,255,.78); --gb1: rgba(0,0,0,.22); --gb2: rgba(0,0,0,.03); --glow: rgba(0,0,0,.07);
}
#services { background: var(--bg); }
.deck { --top: 84px; }
.svc-slot {
  position: sticky;
  top: calc(var(--top) + var(--i) * 10px);
  height: clamp(340px, 58vh, 420px);
  margin-bottom: 14vh;
}
.svc-slot:last-child { margin-bottom: 0; }
.svc-card {
  --mx: 50%; --my: 30%;
  position: relative;
  height: 100%;
  max-width: 760px;
  margin: 0 auto;
  border-radius: 20px;
  overflow: hidden;
  isolation: isolate;
  perspective: 1400px;
  transform-origin: 50% 0;
  background: var(--glass);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  box-shadow: 0 22px 50px rgba(0,0,0,.3);
  cursor: pointer;
  outline: none;
  will-change: transform, opacity;
  transition: none;
  -webkit-tap-highlight-color: transparent;
}
.svc-card.covered { pointer-events: none; }
.svc-card::before { /* 1px gradient border */
  content: "";
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(135deg, var(--gb1), var(--gb2) 45%, var(--gb1));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
}
.svc-card:focus-visible { outline: 2px solid var(--text2); outline-offset: 3px; }
.svc-glow { /* ambient light that follows the pointer */
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(420px circle at var(--mx) var(--my), var(--glow), transparent 65%);
}
.svc-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform .9s var(--ease);
}
.svc-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 26px 30px 28px;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.svc-back { transform: rotateY(180deg); justify-content: center; }
@media (hover: hover) {
  .svc-card:hover .svc-inner { transform: rotateY(180deg); }
}
.svc-card:focus-visible .svc-inner,
.svc-card.flipped .svc-inner { transform: rotateY(180deg); }
.svc-num { font-family: var(--mono); font-size: 11px; letter-spacing: .1em; color: var(--text3); }
.svc-ico { flex: 1; display: grid; place-items: center; min-height: 0; }
.svc-ico svg {
  width: clamp(92px, 15vw, 128px);
  height: auto;
  fill: none;
  stroke: var(--hl);
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(2px 2px 0 var(--e1)) drop-shadow(4px 4px 0 var(--e2)) drop-shadow(6px 6px 0 var(--e3)) drop-shadow(8px 8px 0 var(--e4)) drop-shadow(12px 18px 16px rgba(0,0,0,.3));
  animation: float3d 6s ease-in-out infinite alternate;
}
@keyframes float3d {
  from { transform: perspective(700px) rotateY(-24deg) rotateX(8deg) translateY(0); }
  to   { transform: perspective(700px) rotateY(24deg) rotateX(-6deg) translateY(-8px); }
}
.svc-title { font-family: var(--sg); font-size: 22px; font-weight: 600; letter-spacing: -.02em; line-height: 1.25; color: var(--hl); }
.svc-back .svc-title { margin-bottom: 12px; }
.svc-desc { font-size: 15px; line-height: 1.8; color: var(--text2); max-width: 560px; }
.svc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.stag {
  font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 4px;
  background: rgba(255,255,255,.05); border: 1px solid var(--border); color: var(--text2);
}
.light .stag { background: rgba(0,0,0,.04); }

/* small 3D icons, no box, no background */
.svc-marquee {
  overflow: hidden;
  margin-top: 56px;
  padding: 14px 0;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
}
.svc-track { display: flex; align-items: center; width: max-content; animation: marq 50s linear infinite; }
.light .svc-track { animation-direction: reverse; } /* black icons run left to right */
.svc-marquee:hover .svc-track { animation-play-state: paused; }
.svc-ico-btn {
  flex: none;
  margin-right: 38px;
  padding: 0;
  background: none;
  border: 0;
  color: var(--hl);
  cursor: pointer;
  opacity: .5;
  transition: opacity .2s, transform .2s;
}
.svc-ico-btn:hover, .svc-ico-btn.on, .svc-ico-btn:focus-visible { opacity: 1; }
.svc-ico-btn:hover { transform: scale(1.15); }
.svc-ico-btn:focus-visible { outline: 2px solid var(--text2); outline-offset: 6px; border-radius: 6px; }
.svc-ico-btn svg {
  display: block;
  width: 38px;
  height: 38px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(1px 1px 0 var(--e1)) drop-shadow(2px 2px 0 var(--e2)) drop-shadow(3px 3px 0 var(--e3));
  animation: tilt3d 5s ease-in-out infinite alternate;
  animation-delay: calc(var(--n) * -.6s);
}
@keyframes tilt3d {
  from { transform: perspective(300px) rotateY(-30deg) rotateX(6deg); }
  to   { transform: perspective(300px) rotateY(30deg) rotateX(-6deg); }
}
@media (max-width: 600px) {
  .svc-slot { margin-bottom: 10vh; }
  .svc-face { padding: 20px 18px 22px; }
  .svc-title { font-size: 19px; }
  .svc-desc { font-size: 14px; line-height: 1.7; }
  .svc-ico svg { width: 92px; }
  .svc-ico-btn { margin-right: 30px; }
  .svc-ico-btn svg { width: 32px; height: 32px; }
}
@media (prefers-reduced-motion: reduce) {
  .svc-ico svg, .svc-ico-btn svg, .qicon svg, .svc-track, .t-track { animation: none; }
  .svc-marquee, .t-marquee { overflow-x: auto; }
  .svc-inner { transition-duration: .01ms; }
}

'''

TESTIMONIALS_CSS = r'''/* ===== TESTIMONIALS: right-to-left marquee with 3D quote icons ===== */
#testimonials { background: var(--bg1); overflow: hidden; }
.t-marquee {
  padding: 34px 0 10px;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.t-track { display: flex; width: max-content; animation: marq 80s linear infinite; }
.t-marquee:hover .t-track { animation-play-state: paused; }
.t-card {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: none;
  width: 340px;
  margin: 0 18px 0 0;
  padding: 40px 24px 22px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  transition: border-color .25s, transform .25s, box-shadow .25s;
}
.t-card:hover { border-color: var(--border2); transform: translateY(-4px); box-shadow: var(--card-hover-shadow); }
.qicon { position: absolute; top: -20px; left: 22px; width: 46px; height: 46px; }
.qicon svg {
  width: 100%;
  height: 100%;
  fill: var(--hl);
  filter: drop-shadow(1px 1px 0 var(--e1)) drop-shadow(2px 2px 0 var(--e2)) drop-shadow(3px 3px 0 var(--e3)) drop-shadow(6px 9px 8px rgba(0,0,0,.35));
  animation: qtilt 5s ease-in-out infinite alternate;
}
@keyframes qtilt {
  from { transform: perspective(300px) rotateY(-24deg) rotate(-4deg); }
  to   { transform: perspective(300px) rotateY(24deg) rotate(-4deg) translateY(-3px); }
}
.t-stars { color: var(--hl); font-size: 11px; letter-spacing: 2px; margin-bottom: 10px; }
.t-quote { margin: 0 0 20px; font-size: 14px; font-style: italic; line-height: 1.75; color: var(--text2); }
.t-by { display: flex; align-items: center; gap: 10px; margin-top: auto; }
.t-av {
  width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; background: var(--bg3); border: 1px solid var(--border2);
  font-family: var(--mono); font-size: 11px; font-weight: 700; color: var(--text2);
}
.t-name { display: block; font-size: 12px; font-weight: 600; color: var(--text1); }
.t-role { display: block; font-size: 11px; color: var(--text3); }
@media (max-width: 480px) { .t-card { width: 290px; } }

'''

DRAWER_CSS = r'''.nav-toggle {
  display: none;
  width: 34px;
  height: 34px;
  background: none;
  border: 0;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-shrink: 0;
}
.nav-toggle span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--text1);
  border-radius: 2px;
  transition: transform .25s, opacity .25s;
}
.nav-toggle.active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-toggle.active span:nth-child(2) { opacity: 0; }
.nav-toggle.active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* compact dropdown menu (phones) */
.mobile-drawer {
  position: fixed;
  top: 66px;
  left: 16px;
  right: 16px;
  z-index: 199;
  display: flex;
  flex-direction: column;
  padding: 8px;
  background: var(--card);
  border: 1px solid var(--border2);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, .35);
  visibility: hidden;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity .2s ease, transform .25s var(--ease), visibility 0s .25s;
}
.mobile-drawer.open { visibility: visible; opacity: 1; transform: none; transition-delay: 0s; }
.mobile-drawer a {
  font-family: var(--font);
  font-size: 15px;
  font-weight: 500;
  color: var(--text2);
  text-decoration: none;
  padding: 12px 14px;
  border-radius: 8px;
}
.mobile-drawer a:hover, .mobile-drawer a:active { color: var(--text1); background: var(--bg2); }
.mobile-drawer .m-cta,
.mobile-drawer .m-cta:hover { margin-top: 6px; font-weight: 600; text-align: center; color: #000; background: var(--hl); }
.light .mobile-drawer .m-cta,
.light .mobile-drawer .m-cta:hover { color: #fff; }
.drawer-foot { padding: 10px 14px 6px; font-size: 12px; color: var(--text3); }

'''

HTML_RULE_OLD = 'html {\n  scroll-behavior: smooth;\n}'
HTML_RULE_NEW = 'html {\n  scroll-behavior: smooth;\n  background: var(--bg);\n  color-scheme: dark;\n}\nhtml.light {\n  color-scheme: light;\n}'
DRAWER_PATTERN = r'\.nav-toggle \{\n  display: none;\n.*?(?=@media \(max-width: 760px\) \{\n  \.nav-menu)'

# ---------------------------------------------------------------- JS
DECK_JS = r'''// ===== SERVICES: sticky stacked deck + 3D icon marquee =====
const deck = document.getElementById('deck');
if (deck) {
  const slots = [...deck.querySelectorAll('.svc-slot')];
  const cards = slots.map(s => s.querySelector('.svc-card'));
  const noHover = window.matchMedia('(hover: none)');
  let sticks = [], active = -1, ticking = false;

  cards.forEach(card => {
    card.addEventListener('click', () => { if (noHover.matches) card.classList.toggle('flipped'); });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('flipped'); }
    });
    // ambient light follows the pointer
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  const measure = () => { sticks = slots.map(s => parseFloat(getComputedStyle(s).top) || 0); };

  const markActive = (idx) => {
    if (idx === active) return;
    active = idx;
    document.querySelectorAll('.svc-ico-btn').forEach(b => b.classList.toggle('on', Number(b.dataset.idx) === idx));
  };

  // When the next card slides over a card, that card scales to .95 and fades to .6
  const update = () => {
    ticking = false;
    let covered = 0;
    cards.forEach((card, i) => {
      const next = slots[i + 1];
      let p = 0;
      if (next) p = Math.min(1, Math.max(0, 1 - (next.getBoundingClientRect().top - sticks[i + 1]) / next.offsetHeight));
      card.style.transform = p ? `scale(${1 - 0.05 * p})` : '';
      card.style.opacity = p ? String(1 - 0.4 * p) : '';
      card.classList.toggle('covered', p > 0.5);
      if (p > 0.5) covered++;
    });
    markActive(Math.min(covered, cards.length - 1));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

  // Icon marquee: click an icon to jump to that card
  const goTo = (i) => {
    const h = slots[0].offsetHeight;
    const gap = parseFloat(getComputedStyle(slots[0]).marginBottom) || 0;
    const y = deck.getBoundingClientRect().top + window.pageYOffset + i * (h + gap) - sticks[i] + (i < slots.length - 1 ? gap / 2 : 0);
    window.scrollTo({ top: y, behavior: 'smooth' });
  };
  const track = document.querySelector('.svc-track');
  if (track) {
    for (let half = 0; half < 2; half++) {          // two identical halves = seamless loop
      for (let rep = 0; rep < 3; rep++) {
        slots.forEach((slot, i) => {
          const title = slot.querySelector('.svc-title').textContent;
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'svc-ico-btn';
          b.dataset.idx = i;
          b.title = title;
          b.style.setProperty('--n', i);
          if (half || rep) { b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); }
          else b.setAttribute('aria-label', 'View ' + title);
          b.appendChild(slot.querySelector('.svc-ico svg').cloneNode(true));
          b.addEventListener('click', () => goTo(i));
          track.appendChild(b);
        });
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); });
  measure();
  update();
}

// ===== TESTIMONIALS: copies fill the marquee so it never runs empty =====
const tTrack = document.querySelector('.t-track');
if (tTrack) {
  const originals = [...tTrack.children];
  for (let n = 1; n < 6; n++) {                      // 6 sets = two identical halves
    originals.forEach(c => {
      const k = c.cloneNode(true);
      k.setAttribute('aria-hidden', 'true');
      tTrack.appendChild(k);
    });
  }
}

'''

# ---------------------------------------------------------------- apply
for f in ('index.html', 'style.css', 'script.js', 'project-style.css', 'project-script.js'):
    load(f)

sub('index.html', r'[ \t]*<!-- ===== SERVICES.*?(?=[ \t]*<!-- ===== TECH STACK)', SERVICES_HTML, 'services section')
sub('index.html', r'[ \t]*<!-- ===== TESTIMONIALS.*?(?=[ \t]*<!-- ===== CONTACT)', TESTIMONIALS_HTML, 'testimonials section')

sub('style.css', r'/\* ===== SERVICES.*?(?=/\* ===== TECH STACK)', SERVICES_CSS, 'services CSS')
sub('style.css', r'/\* ===== TESTIMONIALS.*?(?=/\* ===== ABOUT)', TESTIMONIALS_CSS, 'testimonials CSS')
sub('script.js', r'// ===== SERVICE CARDS.*?(?=// ===== TECH STACK: orbiting cards)', DECK_JS, 'services JS')

for css in ('style.css', 'project-style.css'):
    sub(css, DRAWER_PATTERN, DRAWER_CSS, 'mobile menu CSS')
    rep(css, HTML_RULE_OLD, HTML_RULE_NEW, 'html rule')

# white-flash fix: keep the clip-path end state until the transition is removed
for js in ('script.js', 'project-script.js'):
    rep(js, "easing: THEME_EASE, pseudoElement", "easing: THEME_EASE, fill: 'both', pseudoElement", 'theme animation', count=2)

for name, t in texts.items():
    p = ROOT / name
    shutil.copy(p, str(p) + '.bak')
    p.write_text(t, encoding='utf-8')
print('Done. Patched:', ', '.join(texts), '(originals saved as .bak)')
