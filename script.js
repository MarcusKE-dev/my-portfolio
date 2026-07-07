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

         const savedTheme = localStorage.getItem('theme');
         if (savedTheme === 'light') {
           document.documentElement.classList.add('light');
           if (sunIcon && moonIcon) { sunIcon.style.display = 'none';
             moonIcon.style.display = 'block'; }
           if (themeToggle) themeToggle.setAttribute('aria-label', 'Switch to dark mode');
           updatePhoto('light');
         } else { updatePhoto('dark'); }

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
             updatePhoto(newTheme);
             localStorage.setItem('theme', newTheme);
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
             const formData = new FormData(contactForm);
             document.querySelectorAll('.custom-select').forEach(cs => {
               const hi = cs.querySelector('.custom-select-input');
               if (hi && hi.value) formData.append(hi.name, hi.value);
             });
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