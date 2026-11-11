/* BGAA site language. Order: ?lang= > saved choice (localStorage "lang", shared with privacy/ and delete-account/) > device language > English. */
(function () {
  'use strict';
  var LANGS = ['th', 'en', 'ko', 'zh', 'hi'];
  var KEY = 'lang';
  var S = window.SITE_STR || {};
  var page = document.body.getAttribute('data-page') || 'index';
  var dict = S[page === 'join' ? 'join' : 'intro'] || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var lang = window.__L || 'th';
  var explicit = !!window.__LX;
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function t(k) {
    var d = dict[lang];
    if (d && d[k] != null && d[k] !== '') return d[k];
    var fb = dict.th || {};
    return fb[k] != null ? fb[k] : '';
  }
  window.SiteT = t;
  window.SiteLang = function () { return lang; };

  function metaSet(sel, value) {
    var node = $(sel);
    if (node && value) node.setAttribute('content', value);
  }
  function withLang(href, code) {
    var hash = '';
    var cut = href.indexOf('#');
    if (cut >= 0) { hash = href.slice(cut); href = href.slice(0, cut); }
    href = href.replace(/([?&])lang=[^&]*&?/g, '$1').replace(/[?&]$/, '');
    return href + (href.indexOf('?') >= 0 ? '&' : '?') + 'lang=' + code + hash;
  }
  function setBadges(l) {
    $$('[data-badge]').forEach(function (img) {
      var k = img.getAttribute('data-badge');
      var src = k === 'gp'
        ? 'img/badges/gp-' + l + '.png'
        : 'img/badges/as-' + (l === 'hi' ? 'en' : l) + '.svg';
      if (img.getAttribute('src') !== src) img.src = src;
    });
  }
  function setShots(l) {
    $$('[data-shot]').forEach(function (img) {
      var src = 'img/' + l + '-' + img.getAttribute('data-shot') + '.webp';
      if (img.getAttribute('src') !== src) img.src = src;
    });
  }
  function paint() {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
    document.documentElement.setAttribute('data-lang', lang);
    $$('[data-t]').forEach(function (el) {
      var value = t(el.getAttribute('data-t'));
      if (value && el.textContent !== value) el.textContent = value;
    });
    $$('[data-alt]').forEach(function (el) {
      var value = t(el.getAttribute('data-alt'));
      if (value) el.setAttribute('alt', value);
    });
    $$('[data-aria], [data-alt-label]').forEach(function (el) {
      var key = el.getAttribute('data-aria') || el.getAttribute('data-alt-label');
      var value = t(key);
      if (value) el.setAttribute('aria-label', value);
    });
    var title = t('title');
    if (title) {
      document.title = title;
      metaSet('meta[property="og:title"]', title);
      metaSet('meta[name="twitter:title"]', title);
    }
    var desc = t('desc');
    if (desc) {
      metaSet('meta[name="description"]', desc);
      metaSet('meta[property="og:description"]', desc);
      metaSet('meta[name="twitter:description"]', desc);
    }
    var sel = $('#lang');
    if (sel) sel.value = lang;
    if (explicit) {
      $$('a[data-int]').forEach(function (a) {
        var href = a.getAttribute('data-href') || a.getAttribute('href') || '';
        if (!a.getAttribute('data-href')) a.setAttribute('data-href', href);
        a.setAttribute('href', withLang(a.getAttribute('data-href'), lang));
      });
    }
    setBadges(lang);
    setShots(lang);
    if (typeof window.onSitePaint === 'function') window.onSitePaint();
    document.documentElement.classList.remove('pl');
  }
  function setLang(next) {
    if (LANGS.indexOf(next) < 0) return;
    lang = next;
    explicit = true;
    try { localStorage.setItem(KEY, next); } catch (e) {}
    paint();
  }
  var sel = $('#lang');
  if (sel) sel.addEventListener('change', function () { setLang(sel.value); });
  var hd = $('.hd');
  var bar = $('#scrollBar');
  var top = $('#totop');
  var stick = $('#stick');
  function onScroll() {
    var y = window.scrollY || 0;
    if (hd) hd.classList.toggle('scrolled', y > 4);
    if (bar) {
      var root = document.documentElement;
      var max = root.scrollHeight - root.clientHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? root.scrollTop / max : 0) + ')';
    }
    if (stick) stick.classList.toggle('show', y > 420);
    if (top) {
      top.hidden = false;
      top.classList.toggle('show', y > 700);
    }
  }
  if (top) top.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  window.addEventListener('scroll', onScroll, { passive: true });

  var stack = $('#heroStack');
  var dots = $$('#heroDots button');
  if (stack && dots.length) {
    var shots = $$('#heroStack img');
    var i = 0;
    var timer = null;
    function show(n) {
      i = (n + shots.length) % shots.length;
      shots.forEach(function (img, k) { img.classList.toggle('on', k === i); });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    }
    dots.forEach(function (d, k) {
      d.addEventListener('click', function () { show(k); restart(); });
    });
    function restart() {
      if (timer) { clearInterval(timer); timer = null; }
      if (reduce || shots.length < 2) return;
      timer = setInterval(function () { show(i + 1); }, 4200);
    }
    restart();
  }

  paint();
  onScroll();
})();
