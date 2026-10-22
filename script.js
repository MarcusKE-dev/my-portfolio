document.getElementById('yr').textContent = new Date().getFullYear();

// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ===== MOBILE DRAWER =====
const toggle = document.getElementById('navtoggle');
const drawer = document.getElementById('drawer');
let drawerOpen = false;
const updateNavHeight = () => document.documentElement.style.setProperty('--nav-height', `${nav.offsetHeight}px`);
updateNavHeight();
new ResizeObserver(updateNavHeight).observe(nav);
toggle.setAttribute('aria-controls', 'drawer');
drawer.inert = true;
drawer.setAttribute('aria-modal', 'false');

function openDrawer() {
  drawerOpen = true;
  toggle.classList.add('active');
  toggle.setAttribute('aria-expanded', 'true');
  drawer.inert = false;
  drawer.setAttribute('aria-modal', 'true');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  drawerOpen = false;
  toggle.classList.remove('active');
  toggle.setAttribute('aria-expanded', 'false');
  drawer.classList.remove('open');
  drawer.inert = true;
  drawer.setAttribute('aria-modal', 'false');
  document.body.style.overflow = '';
}

toggle.addEventListener('click', (e) => {
  e.stopPropagation();
  drawerOpen ? closeDrawer() : openDrawer();
});

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - nav.offsetHeight;
  window.scrollTo({ top, behavior: 'smooth' });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const hash = link.getAttribute('href');
    if (hash === '#' || hash.length < 2) return;
    const id = hash.slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (drawerOpen) {
      closeDrawer();
      setTimeout(() => scrollToSection(id), 10);
    } else {
      scrollToSection(id);
    }
  });
});

document.addEventListener('click', (e) => {
  if (drawerOpen && !drawer.contains(e.target) && !toggle.contains(e.target)) closeDrawer();
});
document.addEventListener('keydown', (e) => {
  if (!drawerOpen) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeDrawer();
    toggle.focus();
  } else if (e.key === 'Tab') {
    const links = [...drawer.querySelectorAll('a')];
    if (e.shiftKey && document.activeElement === toggle) {
      e.preventDefault();
      links.at(-1)?.focus();
    } else if (!e.shiftKey && document.activeElement === links.at(-1)) {
      e.preventDefault();
      toggle.focus();
    }
  }
});

// A menu opened on a phone must not keep desktop page scrolling locked.
window.matchMedia('(min-width: 1051px)').addEventListener('change', (event) => {
  if (event.matches && drawerOpen) {
    const restoreFocus = drawer.contains(document.activeElement) || document.activeElement === toggle;
    closeDrawer();
    if (restoreFocus) nav.querySelector('.nav-menu a')?.focus();
  }
});

// ===== SCROLL REVEAL =====
const fades = document.querySelectorAll('.fade');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });
fades.forEach(el => observer.observe(el));

// ===== SERVICES: sticky stacked deck =====
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

// ===== SIDEWAYS SCROLL BY MOUSE DRAG (used by Pricing and Testimonials) =====
// Phones and trackpads already scroll sideways by themselves; this lets a mouse drag too.
function enableDragScroll(el) {
  let down = false, startX = 0, startLeft = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('a, button')) return;
    down = true;
    startX = e.clientX;
    startLeft = el.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) el.classList.add('dragging');
    el.scrollLeft = startLeft - dx;
  });
  const end = () => {
    if (!down) return;
    down = false;
    el.classList.remove('dragging');
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
}

// ===== TESTIMONIALS: drift on their own, but you can scroll or drag them either way =====
// Three copies of the set sit side by side. We keep the view in the middle copy and jump by exactly
// one copy when needed, which looks identical, so it feels endless in both directions.
const tScroller = document.querySelector('.t-marquee');
const tTrack = document.querySelector('.t-track');
if (tScroller && tTrack) {
  const originals = [...tTrack.children];
  for (let n = 0; n < 2; n++) {
    originals.forEach(c => {
      const k = c.cloneNode(true);
      k.setAttribute('aria-hidden', 'true');
      tTrack.appendChild(k);
    });
  }
  enableDragScroll(tScroller);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const SPEED = 0.45;                       // pixels per frame
  let L = 0, pos = 0, paused = false, visible = false, raf = null, resumeTimer = null, settleTimer = null;

  const measure = () => { L = tTrack.scrollWidth / 3; };
  const normalise = () => {                 // jump one copy so the view stays in the middle copy
    let x = tScroller.scrollLeft;
    if (x >= 2 * L) x -= L;
    else if (x < L) x += L;
    else return;
    tScroller.scrollLeft = x;
    pos = x;
  };
  const init = () => { measure(); tScroller.scrollLeft = L; pos = L; };
  init();
  window.addEventListener('load', init);
  window.addEventListener('resize', () => { measure(); normalise(); });

  const tick = () => {
    raf = null;
    if (!visible) return;
    if (!paused && !reduce.matches) {
      pos += SPEED;
      if (pos >= 2 * L) pos -= L;
      tScroller.scrollLeft = pos;
    }
    raf = requestAnimationFrame(tick);
  };
  const start = () => { if (!raf && visible) raf = requestAnimationFrame(tick); };
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); }).observe(tScroller);

  const hold = () => { paused = true; clearTimeout(resumeTimer); };
  const release = (ms) => {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { pos = tScroller.scrollLeft; paused = false; }, ms);
  };
  tScroller.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hold(); });
  tScroller.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') release(400); });
  tScroller.addEventListener('pointerdown', hold);
  tScroller.addEventListener('touchstart', hold, { passive: true });
  tScroller.addEventListener('touchend', () => release(2200), { passive: true });
  tScroller.addEventListener('wheel', () => { hold(); release(2200); }, { passive: true });
  tScroller.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { if (paused || reduce.matches) normalise(); }, 140);
  }, { passive: true });
}

// ===== TECH STACK: orbiting cards =====
// Auto-rotates, pauses on hover, drag to spin it yourself.
// Works on phones too: swipe sideways to spin it. Reduced-motion users get a plain grid (CSS).
const orbitEl = document.querySelector('.orbit');
const ring = document.querySelector('.orbit-ring');
if (orbitEl && ring) {
  const mq = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const BASE_SPEED = -0.12;   // degrees per frame
  let angle = 0, vel = 0, lastX = 0;
  let dragging = false, hovering = false, visible = false, raf = null;

  const frame = () => {
    raf = null;
    if (!mq.matches || !visible) return;
    if (!dragging) {
      vel *= 0.95;
      angle += (hovering ? 0 : BASE_SPEED) + vel;
    }
    ring.style.transform = `rotateY(${angle}deg)`;
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf && mq.matches && visible) raf = requestAnimationFrame(frame); };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    start();
  }).observe(orbitEl);

  const onMqChange = () => { if (!mq.matches) ring.style.transform = ''; start(); };
  if (mq.addEventListener) mq.addEventListener('change', onMqChange);

  orbitEl.addEventListener('pointerenter', () => { hovering = true; });
  orbitEl.addEventListener('pointerleave', () => { hovering = false; dragging = false; orbitEl.classList.remove('dragging'); });
  orbitEl.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    orbitEl.classList.add('dragging');
    try { orbitEl.setPointerCapture(e.pointerId); } catch (_) {}
  });
  orbitEl.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    angle += dx * 0.35;
    vel = dx * 0.35;
  });
  const endDrag = () => { dragging = false; orbitEl.classList.remove('dragging'); };
  orbitEl.addEventListener('pointerup', endDrag);
  orbitEl.addEventListener('pointercancel', endDrag);
}

// ===== TECH ICON STRIP =====
// Icons load from the Devicon CDN. To avoid any third-party dependency, download the
// SVGs into /images/tech/ and change ICON_BASE to 'images/tech/' (file names: react.svg, etc.).
const MONO = ['Next.js', 'Vercel', 'Prisma', 'Linux']; // black logos get a white version on dark
const ICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';
const TECH_ROWS = [
  [
    ['React', 'react/react-original'],
    ['Next.js', 'nextjs/nextjs-original'],
    ['TypeScript', 'typescript/typescript-original'],
    ['JavaScript', 'javascript/javascript-original'],
    ['Node.js', 'nodejs/nodejs-original'],
    ['Tailwind CSS', 'tailwindcss/tailwindcss-original'],
    ['Vite', 'vitejs/vitejs-original'],
    ['HTML5', 'html5/html5-original'],
    ['CSS3', 'css3/css3-original']
  ],
  [
    ['PostgreSQL', 'postgresql/postgresql-original'],
    ['Supabase', 'supabase/supabase-original'],
    ['Prisma', 'prisma/prisma-original'],
    ['Redis', 'redis/redis-original'],
    ['Docker', 'docker/docker-original'],
    ['Nginx', 'nginx/nginx-original'],
    ['Linux', 'linux/linux-original'],
    ['Git', 'git/git-original'],
    ['Vercel', 'vercel/vercel-original']
  ]
];

document.querySelectorAll('.marq-row').forEach(row => {
  const items = TECH_ROWS[Number(row.dataset.row)] || [];
  const chip = ([name, path], hidden) => `
    <div class="tech-chip"${hidden ? ' aria-hidden="true"' : ''}>
      <span class="tech-ico${MONO.includes(name) ? ' mono' : ''}"><img src="${ICON_BASE}${path}.svg" alt="" loading="lazy" data-letter="${name[0]}"></span>
      ${name}
    </div>`;
  // The list is doubled so the loop is seamless (the animation moves exactly half the track)
  row.innerHTML = items.map(i => chip(i, false)).join('') + items.map(i => chip(i, true)).join('');
  row.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      // If an icon fails to load, show the first letter instead of a broken image
      img.parentElement.textContent = img.dataset.letter;
    });
  });
});

// ===== CUSTOM SELECT =====
document.querySelectorAll('.custom-select').forEach(customSelect => {
  const trigger = customSelect.querySelector('.custom-select-trigger');
  const options = customSelect.querySelectorAll('.custom-select-options div');
  const hiddenInput = customSelect.querySelector('.custom-select-input');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.custom-select.open').forEach(s => {
      if (s !== customSelect) s.classList.remove('open');
    });
    customSelect.classList.toggle('open');
  });
  options.forEach(option => {
    option.addEventListener('click', () => {
      const value = option.getAttribute('data-value') || option.textContent;
      trigger.textContent = option.textContent;
      trigger.style.color = '';
      if (hiddenInput) hiddenInput.value = value;
      options.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      customSelect.classList.remove('open');
    });
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.custom-select.open').forEach(s => s.classList.remove('open'));
});

// ===== THEME TOGGLE =====
// Both hero photos are always in the page (CSS shows the right one), so nothing
// has to load when the theme changes. That load was one cause of the late flash.
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.querySelector('.theme-toggle .sun-icon');
const moonIcon = document.querySelector('.theme-toggle .moon-icon');
const root = document.documentElement;
let themeBusy = false;

function applyTheme(isLight) {
  root.classList.toggle('light', isLight);
  if (sunIcon && moonIcon) {
    sunIcon.style.display = isLight ? 'none' : 'block';
    moonIcon.style.display = isLight ? 'block' : 'none';
  }
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  }
  try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch (_) {}
}

let savedTheme = null;
try { savedTheme = localStorage.getItem('theme'); } catch (_) {}
if (savedTheme === 'light') applyTheme(true);

const THEME_MS = 1400;
const THEME_EASE = 'cubic-bezier(.45, 0, .25, 1)';

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    if (themeBusy) return;
    const toLight = !root.classList.contains('light');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) return applyTheme(toLight);

    // Browsers without View Transitions: slow, even cross-fade
    if (!document.startViewTransition) {
      root.classList.add('theme-fade');
      applyTheme(toLight);
      setTimeout(() => root.classList.remove('theme-fade'), 800);
      return;
    }

    themeBusy = true;
    // Both circles are centred on the middle of the screen
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const radius = Math.hypot(cx, cy);

    root.classList.add('theme-switching');            // no colour transitions mid-switch
    root.dataset.vt = toLight ? 'to-light' : 'to-dark';
    const transition = document.startViewTransition(() => applyTheme(toLight));

    transition.ready.then(() => {
      if (toLight) {
        // Light mode: a circle opens from the centre and grows outwards
        root.animate(
          { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${radius}px at ${cx}px ${cy}px)`] },
          { duration: THEME_MS, easing: THEME_EASE, fill: 'both', pseudoElement: '::view-transition-new(root)' }
        );
      } else {
        // Dark mode: a circle closes from the edges and meets in the centre
        root.animate(
          { clipPath: [`circle(${radius}px at ${cx}px ${cy}px)`, `circle(0px at ${cx}px ${cy}px)`] },
          { duration: THEME_MS, easing: THEME_EASE, fill: 'both', pseudoElement: '::view-transition-old(root)' }
        );
      }
    }).catch(() => {});

    transition.finished.finally(() => {
      root.classList.remove('theme-switching');
      delete root.dataset.vt;
      themeBusy = false;
    });
  });
}

// ===== CONTACT FORM =====
const contactForm = document.getElementById('cform');
const submitBtn = document.getElementById('fsub');
if (contactForm && submitBtn) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    // The hidden inputs (service, budget, timeline) are already inside the form,
    // so FormData includes them without appending them a second time.
    const formData = new FormData(contactForm);
    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        contactForm.innerHTML = `
          <div style="padding:44px 0;text-align:center;">
            <div style="font-size:48px;margin-bottom:10px;">✓</div>
            <div style="font-size:18px;font-weight:700;color:var(--text1);margin-bottom:8px;">Message sent successfully!</div>
            <div style="font-size:14px;color:var(--text2);">I'll get back to you within 24 hours.</div>
          </div>
        `;
      } else {
        const err = await res.json();
        alert(err.message || 'Something went wrong. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Discuss Your Project';
      }
    } catch (_) {
      alert('Network error. Please check your connection and try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Discuss Your Project';
    }
  });
}

// ===== PRICING: drag with the mouse, and a small progress bar that shows where you are in the row =====
(() => {
  const scroller = document.getElementById('priceScroller');
  if (!scroller) return;
  const thumb = document.getElementById('priceThumb');
  enableDragScroll(scroller);
  const update = () => {
    if (!thumb || !scroller.scrollWidth) return;
    thumb.style.width = (scroller.clientWidth / scroller.scrollWidth * 100) + '%';
    thumb.style.left = (scroller.scrollLeft / scroller.scrollWidth * 100) + '%';
  };
  scroller.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ===== SERVICES: cards that are off screen stop animating their icons (keeps scrolling smooth) =====
(() => {
  const cards = document.querySelectorAll('.svc-card');
  if (!cards.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => e.target.classList.toggle('idle', !e.isIntersecting));
  }, { rootMargin: '120px 0px' });
  cards.forEach(c => io.observe(c));
})();
