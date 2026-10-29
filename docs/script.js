/* =========================================================
   Vigía · Landing Page — interactions 
   ========================================================= */

(function () {
  'use strict';

  // ---------- Language (ES / EN) ----------
  var LANG_STORAGE_KEY = 'vigia.landing.lang';
  var dictionaries = window.VIGIA_I18N || { en: {}, es: {} };
  var currentLang = 'es';

  var textNodes = document.querySelectorAll('[data-i18n]');
  var attributeBindings = [
    { selector: '[data-i18n-placeholder]', data: 'i18nPlaceholder', attr: 'placeholder' },
    { selector: '[data-i18n-aria-label]', data: 'i18nAriaLabel', attr: 'aria-label' },
    { selector: '[data-i18n-alt]', data: 'i18nAlt', attr: 'alt' },
    { selector: '[data-i18n-content]', data: 'i18nContent', attr: 'content' },
    { selector: '[data-i18n-title]', data: 'i18nTitle', attr: 'title' }
  ];

  // Spanish is the text written in index.html: keep it as the "es" dictionary.
  textNodes.forEach(function (el) {
    var key = el.dataset.i18n;
    if (!(key in dictionaries.es)) dictionaries.es[key] = el.innerHTML;
  });
  attributeBindings.forEach(function (binding) {
    document.querySelectorAll(binding.selector).forEach(function (el) {
      var key = el.dataset[binding.data];
      if (!(key in dictionaries.es)) dictionaries.es[key] = el.getAttribute(binding.attr);
    });
  });

  function t(key) {
    var dict = dictionaries[currentLang] || {};
    return key in dict ? dict[key] : (dictionaries.es[key] || key);
  }

  function applyLanguage(lang) {
    currentLang = dictionaries[lang] ? lang : 'es';
    document.documentElement.lang = currentLang;

    textNodes.forEach(function (el) {
      var value = t(el.dataset.i18n);
      if (el.tagName === 'TITLE') el.textContent = value;
      else el.innerHTML = value;
    });
    attributeBindings.forEach(function (binding) {
      document.querySelectorAll(binding.selector).forEach(function (el) {
        el.setAttribute(binding.attr, t(el.dataset[binding.data]));
      });
    });

    langBtns.forEach(function (btn) {
      var active = btn.dataset.lang === currentLang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    try { localStorage.setItem(LANG_STORAGE_KEY, currentLang); } catch (e) { /* storage unavailable */ }
  }

  var langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLanguage(btn.dataset.lang);
    });
  });

  var savedLang = null;
  try { savedLang = localStorage.getItem(LANG_STORAGE_KEY); } catch (e) { /* storage unavailable */ }
  if (savedLang && savedLang !== 'es') applyLanguage(savedLang);

  // ---------- Mobile menu toggle ----------
  var menuToggle = document.getElementById('menuToggle');
  var mainNav = document.getElementById('mainNav');

  function setMenuOpen(isOpen) {
    mainNav.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.dataset.i18nAriaLabel = isOpen ? 'header.closeMenu' : 'header.openMenu';
    menuToggle.setAttribute('aria-label', t(menuToggle.dataset.i18nAriaLabel));
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      setMenuOpen(!mainNav.classList.contains('open'));
    });

    mainNav.addEventListener('click', function (e) {
      if (e.target.matches('.nav-link')) setMenuOpen(false);
    });
  }

  // ---------- Back-to-top button (appears when reaching the end of the page) ----------
  var toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'back-to-top';
  toTop.dataset.i18nAriaLabel = 'header.backToTop';
  toTop.dataset.i18nTitle = 'header.backToTop';
  toTop.setAttribute('aria-label', t('header.backToTop'));
  toTop.setAttribute('title', t('header.backToTop'));
  toTop.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">' +
    '<path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.5" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(toTop);

  var END_OFFSET = 300; // px from the bottom of the page at which the button shows
  var toTopTicking = false;

  function updateToTop() {
    toTopTicking = false;
    var root = document.documentElement;
    var reachedEnd = window.scrollY > 0 &&
      window.innerHeight + window.scrollY >= root.scrollHeight - END_OFFSET;
    toTop.classList.toggle('visible', reachedEnd);
  }

  window.addEventListener('scroll', function () {
    if (toTopTicking) return;
    toTopTicking = true;
    window.requestAnimationFrame(updateToTop);
  }, { passive: true });
  window.addEventListener('resize', updateToTop);
  updateToTop();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- Active section highlight in nav (scroll-spy) ----------
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return null;
      var el = document.querySelector(id);
      return el ? { id: id, el: el, link: link } : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var match = sections.find(function (s) { return s.el === entry.target; });
        if (!match) return;
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        match.link.classList.add('active');
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (s) { io.observe(s.el); });
  }

}());
