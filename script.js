(function () {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const STORAGE_KEY = 'theme';

  function applyTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      root.setAttribute('data-theme', theme);
    } else {
      root.removeAttribute('data-theme');
    }
    if (toggleBtn) {
      const isDark =
        theme === 'dark' ||
        (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      toggleBtn.textContent = isDark ? '☀️' : '🌙';
    }
  }

  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  applyTheme(saved);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      const current = root.getAttribute('data-theme');
      const isDark =
        current === 'dark' ||
        (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const next = isDark ? 'light' : 'dark';
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
      applyTheme(next);
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const revealTargets = document.querySelectorAll('.reveal-onscroll');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (revealTargets.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach(function (el) { el.classList.add('in-view'); });
    } else {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );
      revealTargets.forEach(function (el) { observer.observe(el); });
    }
  }

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
