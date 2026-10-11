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

function openDrawer() {
  drawerOpen = true;
  toggle.classList.add('active');
  toggle.setAttribute('aria-expanded', 'true');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  drawerOpen = false;
  toggle.classList.remove('active');
  toggle.setAttribute('aria-expanded', 'false');
  drawer.classList.remove('open');
  document.body.style.overflow = '';
}

toggle.addEventListener('click', (e) => {
  e.stopPropagation();
  drawerOpen ? closeDrawer() : openDrawer();
});

const NAV_HEIGHT = 64;
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - NAV_HEIGHT;
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
  if (e.key === 'Escape' && drawerOpen) closeDrawer();
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

// ===== SERVICE CARDS: flip on hover (desktop), tap (touch), Enter/Space (keyboard) =====
const noHover = window.matchMedia('(hover: none)');
document.querySelectorAll('.svc').forEach(card => {
  card.addEventListener('click', () => {
    if (noHover.matches) card.classList.toggle('flipped');
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.toggle('flipped');
    }
  });
});

// ===== TECH STACK: orbiting cards =====
// Auto-rotates, pauses on hover, drag to spin it yourself.
// Phones and reduced-motion users get a plain grid (handled in CSS).
const orbitEl = document.querySelector('.orbit');
const ring = document.querySelector('.orbit-ring');
if (orbitEl && ring) {
  const mq = window.matchMedia('(min-width: 821px) and (prefers-reduced-motion: no-preference)');
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
      <span class="tech-ico"><img src="${ICON_BASE}${path}.svg" alt="" loading="lazy" data-letter="${name[0]}"></span>
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

// ===== THEME TOGGLE + PHOTO =====
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.querySelector('.theme-toggle .sun-icon');
const moonIcon = document.querySelector('.theme-toggle .moon-icon');
const profilePhoto = document.getElementById('profilePhoto');
const darkPhoto = 'images/portfolio-photo.png';
const lightPhoto = 'images/portfolio.png';

function updatePhoto(theme) {
  if (profilePhoto) profilePhoto.src = theme === 'light' ? lightPhoto : darkPhoto;
}

function applyTheme(isLight) {
  document.documentElement.classList.toggle('light', isLight);
  if (sunIcon && moonIcon) {
    sunIcon.style.display = isLight ? 'none' : 'block';
    moonIcon.style.display = isLight ? 'block' : 'none';
  }
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  }
  updatePhoto(isLight ? 'light' : 'dark');
  try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch (_) {}
}

let savedTheme = null;
try { savedTheme = localStorage.getItem('theme'); } catch (_) {}
if (savedTheme === 'light') applyTheme(true);
else updatePhoto('dark');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const toLight = !document.documentElement.classList.contains('light');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) return applyTheme(toLight);

    // Both circles are centred on the middle of the screen
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const radius = Math.hypot(cx, cy);

    document.documentElement.dataset.vt = toLight ? 'to-light' : 'to-dark';
    const transition = document.startViewTransition(() => applyTheme(toLight));

    transition.ready.then(() => {
      if (toLight) {
        // Light mode: a circle opens from the centre and grows outwards
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${radius}px at ${cx}px ${cy}px)`] },
          { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' }
        );
      } else {
        // Dark mode: a circle closes from the edges and meets in the centre
        document.documentElement.animate(
          { clipPath: [`circle(${radius}px at ${cx}px ${cy}px)`, `circle(0px at ${cx}px ${cy}px)`] },
          { duration: 900, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-old(root)' }
        );
      }
    });
    transition.finished.finally(() => { delete document.documentElement.dataset.vt; });
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