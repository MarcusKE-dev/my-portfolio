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

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      if (sunIcon && moonIcon) { sunIcon.style.display = 'none';
        moonIcon.style.display = 'block'; }
      if (themeToggle) themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const isLight = document.documentElement.classList.toggle('light');
        const newTheme = isLight ? 'light' : 'dark';
        if (sunIcon && moonIcon) {
          if (isLight) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
            themeToggle.setAttribute('aria-label', 'Switch to dark mode');
          } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
            themeToggle.setAttribute('aria-label', 'Switch to light mode');
          }
        }
        localStorage.setItem('theme', newTheme);
      });
    }