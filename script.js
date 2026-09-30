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
      toggleBtn.classList.remove('spin');
      void toggleBtn.offsetWidth; // restart the animation on rapid clicks
      toggleBtn.classList.add('spin');
    });
    toggleBtn.addEventListener('animationend', function () {
      toggleBtn.classList.remove('spin');
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Counts a number like "99.2%" or "+25%" up from zero, keeping its prefix/suffix.
  function countUp(el, duration, delay) {
    const match = el.textContent.trim().match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return;
    const prefix = match[1];
    const suffix = match[3];
    const target = parseFloat(match[2]);
    const decimals = (match[2].split('.')[1] || '').length;
    const start = performance.now() + (delay || 0);
    el.textContent = prefix + (0).toFixed(decimals) + suffix;
    function frame(now) {
      const t = Math.min(Math.max((now - start) / duration, 0), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // index each chip so CSS can stagger them
  document.querySelectorAll('.heat-chips, .focus-tags').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (chip, i) {
      chip.style.setProperty('--i', i);
    });
  });

  const conf = document.querySelector('.tag-float .conf');
  if (conf && !reducedMotion) {
    countUp(conf, 900, 800);
  }

  // Once a reveal finishes, drop the reveal class so the element's own hover
  // transitions apply again instead of the slower, delayed reveal transition.
  function settleAfterReveal(el) {
    el.addEventListener('transitionend', function handler(e) {
      if (e.target !== el || e.pseudoElement || e.propertyName !== 'opacity') return;
      el.classList.remove('reveal-onscroll');
      el.removeEventListener('transitionend', handler);
    });
  }

  const revealTargets = document.querySelectorAll('.reveal-onscroll, .timeline');
  if (revealTargets.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach(function (el) { el.classList.add('in-view'); });
    } else {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              const el = entry.target;
              if (el.classList.contains('reveal-onscroll')) settleAfterReveal(el);
              el.classList.add('in-view');
              if (el.classList.contains('stat-tile')) {
                const num = el.querySelector('.num');
                if (num) countUp(num, 1200, 150);
              }
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );
      revealTargets.forEach(function (el) { observer.observe(el); });
    }
  }

  // scroll progress bar + header shadow
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress');
  let scrollQueued = false;
  function onScroll() {
    scrollQueued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    if (progress) progress.style.transform = 'scaleX(' + ratio + ')';
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', function () {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  // heat spot that follows the pointer across cards
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card, .repo-card, .bento-card, .contact-card, .cert-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
    });
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

  // highlight the nav link for the section crossing the middle of the viewport
  if (navLinks && 'IntersectionObserver' in window) {
    const linkFor = {};
    navLinks.querySelectorAll('a[href^="#"]').forEach(function (link) {
      linkFor[link.getAttribute('href').slice(1)] = link;
    });
    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          Object.keys(linkFor).forEach(function (id) {
            linkFor[id].classList.toggle('active', id === entry.target.id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    document.querySelectorAll('main section[id]').forEach(function (section) {
      spy.observe(section);
    });
  }
})();
