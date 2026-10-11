// ===== FOOTER YEAR =====
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

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.querySelector('.theme-toggle .sun-icon');
const moonIcon = document.querySelector('.theme-toggle .moon-icon');

function applyTheme(isLight) {
  document.documentElement.classList.toggle('light', isLight);
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