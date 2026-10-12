#!/usr/bin/env python3
"""Run from your portfolio folder, AFTER the first script (do not re-run the first one):
    python3 apply_changes_v2.py
Patches index.html, style.css, script.js, project-style.css, project-script.js.
Originals of this step are saved as *.bak2. Nothing is written unless every patch matches."""
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

# ---------------------------------------------------------------- testimonials
# NOTE: the first two and the last are your existing quotes. The David A., William and
# Charles M. quotes are DRAFTS I wrote from the projects: replace them with the clients' real words.
TESTIMONIALS = [
 ("Nicholas W.", "Business Owner, Niks Digital Connections",
  "John was easy to work with and delivered the e-commerce platform on time. He handled the technical side, including the M-Pesa integration, and the final system made things much easier for us."),
 ("Humphrey M.", "Owner, Karen West Natural Spring",
  "John did a great job on our website. He handled the development, SEO, email setup, and deployment, and was available when we needed technical support."),
 ("David A.", "Dalo Plumbing Solutions",
  "John built a clean, fast website for our plumbing business. It works well on phones and makes it easy for customers to find us and get in touch."),
 ("William", "Mboroti Healthcare",
  "The website presents our clinic's services clearly and makes it simple for patients to reach us. John was professional from start to finish."),
 ("Charles M.", "Charles Upholstery",
  "John delivered a polished website that shows our work beautifully, and enquiries from the form land straight in our inbox."),
 ("Client Feedback", "Project Stakeholder",
  "John was responsive and clear throughout the project. The final website matched what we needed, and it was easy to work with him from start to finish."),
]
QUOTE = 'M4 18c0-6 3-10 9-12l1 2.2C11 9.4 9.7 11 9.4 13H14v11H4V18zm14 0c0-6 3-10 9-12l1 2.2c-3 1.2-4.3 2.8-4.6 4.8H28v11H18V18z'

def t_card(t):
    name, role, quote = t
    return (f'        <figure class="t-card"><span class="qicon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="{QUOTE}"/></svg></span>'
            f'<blockquote class="t-quote">“{quote}”</blockquote>'
            f'<figcaption class="t-by"><span class="t-name">{name}</span><span class="t-role">{role}</span></figcaption></figure>')

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
SERVICES_CSS = r'''/* ===== SERVICES: sticky stacked deck (solid cards) ===== */
:root {
  --e1: #d4d4d4; --e2: #aaaaaa; --e3: #808080; --e4: #585858; /* solid 3D depth layers */
  --ifill: #262626; --sh1: rgba(0,0,0,.5); --sh2: rgba(0,0,0,.35); --dimmax: .4;
}
:root.light {
  --e1: #444444; --e2: #666666; --e3: #888888; --e4: #aaaaaa;
  --ifill: #e6e9ed; --sh1: rgba(0,0,0,.14); --sh2: rgba(0,0,0,.12); --dimmax: .18;
}
#services { background: var(--bg); }
section#services { padding-bottom: 24px; }
section#expertise { padding-top: 8px; }
.deck { --top: 84px; --step: 10px; }
.svc-slot {
  position: sticky;
  top: calc(var(--top) + var(--i) * var(--step));
  height: clamp(340px, 58vh, 420px);
  margin-bottom: 14vh;
}
@media (hover: hover) { .svc-slot:last-child { margin-bottom: 0; } }
/* touch screens: more resting room, because the card turns by itself while you scroll */
@media (hover: none) {
  .svc-slot { margin-bottom: 24vh; }
  section#expertise { margin-top: -14vh; padding-top: 32px; }
}
.svc-card {
  position: relative;
  height: 100%;
  max-width: 760px;
  margin: 0 auto;
  border-radius: 20px;
  overflow: hidden;
  perspective: 1400px;
  transform-origin: 50% 0;
  background: var(--card);
  border: 1px solid var(--border2);
  box-shadow: 0 -10px 30px var(--sh1), 0 22px 50px var(--sh2);
  cursor: pointer;
  outline: none;
  will-change: transform;
  transition: none;
  -webkit-tap-highlight-color: transparent;
}
.svc-card.covered { pointer-events: none; }
.svc-card::after { /* solid dimming for covered cards (no see-through) */
  content: "";
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  background: #000;
  opacity: calc(var(--dim, 0) * var(--dimmax));
}
.svc-card:focus-visible { outline: 2px solid var(--text2); outline-offset: 3px; }
.svc-inner {
  position: relative;
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
  background: var(--card);
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
  fill: var(--ifill);
  stroke: var(--hl);
  stroke-width: 1.7;
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
.stag { font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 4px; background: var(--bg3); border: 1px solid var(--border2); color: var(--text2); }
@media (max-width: 600px) {
  .deck { --step: 8px; }
  .svc-face { padding: 20px 18px 22px; }
  .svc-title { font-size: 19px; }
  .svc-desc { font-size: 14px; line-height: 1.7; }
  .svc-ico svg { width: 92px; }
}
@media (prefers-reduced-motion: reduce) {
  .svc-ico svg, .qicon svg, .t-track { animation: none; }
  .t-marquee { overflow-x: auto; }
  .svc-inner { transition-duration: .01ms; }
}

'''

TESTIMONIALS_CSS = r'''/* ===== TESTIMONIALS: plain text marquee with 3D quote icons ===== */
#testimonials { background: var(--bg1); overflow: hidden; }
.t-marquee {
  padding: 18px 0 6px;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.t-track { display: flex; width: max-content; animation: marq 110s linear infinite; }
.t-marquee:hover .t-track { animation-play-state: paused; }
.t-card { position: relative; display: flex; flex-direction: column; flex: none; width: 340px; margin: 0 56px 0 0; padding: 58px 0 0; }
.qicon { position: absolute; top: 0; left: 0; width: 44px; height: 44px; }
.qicon svg {
  width: 100%;
  height: 100%;
  fill: var(--hl);
  filter: drop-shadow(1px 1px 0 var(--e1)) drop-shadow(2px 2px 0 var(--e2)) drop-shadow(3px 3px 0 var(--e3)) drop-shadow(5px 8px 8px rgba(0,0,0,.3));
  animation: qtilt 5s ease-in-out infinite alternate;
}
@keyframes qtilt {
  from { transform: perspective(300px) rotateY(-24deg) rotate(-4deg); }
  to   { transform: perspective(300px) rotateY(24deg) rotate(-4deg) translateY(-3px); }
}
.t-quote { margin: 0 0 18px; font-size: 15px; font-style: italic; line-height: 1.8; color: var(--text2); }
.t-by { margin-top: auto; }
.t-name { display: block; font-size: 14px; font-weight: 600; color: var(--text1); }
.t-role { display: block; font-size: 12px; color: var(--text3); }
@media (max-width: 480px) { .t-card { width: 280px; margin-right: 40px; } }

'''

TECH_CSS = r'''.tech-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 34px;
  padding: 4px 0;
  color: var(--text2);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: color .25s;
}
.tech-chip:hover { color: var(--text1); }
.tech-ico {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  background: none;
  color: var(--text1);
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.tech-ico img { width: 28px; height: 28px; display: block; }
:root:not(.light) .tech-ico.mono img { filter: brightness(0) invert(1); } /* black logos stay visible on dark */
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

/* full-width dropdown menu (phones): runs edge to edge */
.mobile-drawer {
  position: fixed;
  top: 68px;
  left: 0;
  right: 0;
  z-index: 199;
  display: flex;
  flex-direction: column;
  padding: 8px 12px 10px;
  background: var(--bg1);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border2);
  box-shadow: 0 16px 30px rgba(0, 0, 0, .3);
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
  padding: 12px 10px;
  border-radius: 8px;
}
.mobile-drawer a:hover, .mobile-drawer a:active { color: var(--text1); background: var(--bg2); }
.mobile-drawer .m-cta,
.mobile-drawer .m-cta:hover { margin-top: 6px; font-weight: 600; text-align: center; color: #000; background: var(--hl); }
.light .mobile-drawer .m-cta,
.light .mobile-drawer .m-cta:hover { color: #fff; }
.drawer-foot { padding: 10px 10px 4px; font-size: 12px; color: var(--text3); }

'''
DRAWER_PATTERN = r'\.nav-toggle \{\n  display: none;\n.*?(?=@media \(max-width: 760px\) \{\n  \.nav-menu)'

# dark -> light: the new (light) page used to show in full for a frame before the circle started
VT_OLD = 'html[data-vt="to-light"]::view-transition-new(root) { z-index: 2; }'
VT_NEW = 'html[data-vt="to-light"]::view-transition-new(root) { z-index: 2; clip-path: circle(0px at 50% 50%); }'

# ---------------------------------------------------------------- JS
DECK_JS = r'''// ===== SERVICES: sticky stacked deck =====
const deck = document.getElementById('deck');
if (deck) {
  const slots = [...deck.querySelectorAll('.svc-slot')];
  const cards = slots.map(s => s.querySelector('.svc-card'));
  const inners = cards.map(c => c.querySelector('.svc-inner'));
  const touch = window.matchMedia('(hover: none)');
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let sticks = [], h = 0, gap = 0, ticking = false;

  // keyboard: Enter / Space turns a card (mouse = hover, phone = scroll)
  cards.forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('flipped'); }
    });
  });

  const measure = () => {
    sticks = slots.map(s => parseFloat(getComputedStyle(s).top) || 0);
    h = slots[0].offsetHeight;
    gap = parseFloat(getComputedStyle(slots[0]).marginBottom) || 0;
  };

  const update = () => {
    ticking = false;
    const y = window.pageYOffset;
    const deckTop = deck.getBoundingClientRect().top + y;
    cards.forEach((card, i) => {
      // when the next card slides over this one, it scales to .95 and dims (still solid)
      const next = slots[i + 1];
      const p = next ? clamp(1 - (next.getBoundingClientRect().top - sticks[i + 1]) / h) : 0;
      card.style.transform = p ? `scale(${1 - 0.05 * p})` : '';
      card.style.setProperty('--dim', p.toFixed(3));
      card.classList.toggle('covered', p > 0.5);

      const inner = inners[i];
      if (touch.matches) {
        // phones: no hover, so the card turns to its explanation by itself while you scroll
        const q = y - (deckTop + i * (h + gap) - sticks[i]);
        inner.style.transition = 'none';
        inner.style.transform = `rotateY(${clamp(q / (gap * 0.6)) * 180}deg)`;
      } else if (inner.style.transform) {
        inner.style.transition = '';
        inner.style.transform = '';
      }
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); });
  if (touch.addEventListener) touch.addEventListener('change', () => { measure(); onScroll(); });
  measure();
  update();
}

// ===== TESTIMONIALS: one copy of the set makes the marquee loop seamlessly =====
const tTrack = document.querySelector('.t-track');
if (tTrack) {
  [...tTrack.children].forEach(c => {
    const k = c.cloneNode(true);
    k.setAttribute('aria-hidden', 'true');
    tTrack.appendChild(k);
  });
}

'''

# ---------------------------------------------------------------- apply
for f in ('index.html', 'style.css', 'script.js', 'project-style.css', 'project-script.js'):
    load(f)

# index.html: testimonials, remove glow + icon marquee, new services intro
sub('index.html', r'[ \t]*<!-- ===== TESTIMONIALS.*?(?=[ \t]*<!-- ===== CONTACT)', TESTIMONIALS_HTML, 'testimonials section')
texts['index.html'] = texts['index.html'].replace('            <div class="svc-glow"></div>\n', '')
sub('index.html', r'[ \t]*<div class="svc-marquee"[^\n]*\n', '', 'icon marquee under services')
rep('index.html', 'Scroll to stack the deck, hover or tap a card for details.',
    'Scroll through the deck. On a computer, hover a card for details; on a phone each card turns by itself as you scroll.',
    'services intro text')

# style.css
sub('style.css', r'/\* ===== SERVICES.*?(?=/\* ===== TECH STACK)', SERVICES_CSS, 'services CSS')
sub('style.css', r'/\* ===== TESTIMONIALS.*?(?=/\* ===== ABOUT)', TESTIMONIALS_CSS, 'testimonials CSS')
sub('style.css', r'\.tech-chip \{.*?\.tech-ico img \{.*?\}\n', TECH_CSS, 'tech icon chips CSS')

# script.js
sub('script.js', r'// ===== SERVICES: sticky stacked deck.*?(?=// ===== TECH STACK: orbiting cards)', DECK_JS, 'services JS')
rep('script.js', 'const ICON_BASE =', "const MONO = ['Next.js', 'Vercel', 'Prisma', 'Linux']; // black logos get a white version on dark\nconst ICON_BASE =", 'ICON_BASE line')
rep('script.js', '<span class="tech-ico"><img', '<span class="tech-ico${MONO.includes(name) ? \' mono\' : \'\'}"><img', 'tech-ico markup')

# both CSS files: menu edge to edge + dark->light transition
for css in ('style.css', 'project-style.css'):
    sub(css, DRAWER_PATTERN, DRAWER_CSS, 'mobile menu CSS')
    rep(css, VT_OLD, VT_NEW, 'to-light view transition rule')

for name, t in texts.items():
    p = ROOT / name
    shutil.copy(p, str(p) + '.bak2')
    p.write_text(t, encoding='utf-8')
print('Done. Patched:', ', '.join(texts), '(previous versions saved as .bak2)')
print('REMINDER: the quotes for David A., William and Charles M. are drafts. Replace them with their real words.')
