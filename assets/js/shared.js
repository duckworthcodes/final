/**
 * MahaPoojan shared UI: mobile navigation + scroll fade-up
 */
(function () {
  'use strict';

  function initMobileNav() {
    document.querySelectorAll('nav').forEach(function (nav) {
      if (nav.dataset.mobileNavInit) return;
      nav.dataset.mobileNavInit = '1';

      var links = nav.querySelector('.nav-links');
      if (!links) return;

      var toggle = nav.querySelector('.nav-toggle');
      if (!toggle) {
        toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-label', 'Open menu');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
        nav.insertBefore(toggle, links);
      }

      var backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      nav.parentNode.insertBefore(backdrop, nav.nextSibling);

      function closeMenu() {
        links.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }

      function openMenu() {
        links.classList.add('is-open');
        backdrop.classList.add('is-open');
        document.body.classList.add('nav-open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.textContent = '✕';
      }

      toggle.addEventListener('click', function () {
        if (links.classList.contains('is-open')) closeMenu();
        else openMenu();
      });

      backdrop.addEventListener('click', closeMenu);

      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });
    });
  }

  function initFadeUp() {
    var els = document.querySelectorAll('.fade-up:not([data-fade-init])');
    if (!els.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.setAttribute('data-fade-init', '1');
          }
        });
      },
      { threshold: 0.1 }
    );

    els.forEach(function (el) {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initMobileNav();
      initFadeUp();
    });
  } else {
    initMobileNav();
    initFadeUp();
  }
})();
