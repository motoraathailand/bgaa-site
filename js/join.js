/* BGAA /join: 3 steps remembered on this device only. No network calls, no tracking. */
(function () {
  'use strict';
  var KEY = 'bgaa.join.steps';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var done = { 1: false, 2: false, 3: false };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    [1, 2, 3].forEach(function (n) { done[n] = !!saved[n]; });
  } catch (e) {}
  function t(k) { return window.SiteT ? window.SiteT(k) : ''; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {} }
  function count() { return [1, 2, 3].filter(function (n) { return done[n]; }).length; }
  function paintState() {
    var n = count();
    $$('.step').forEach(function (card) {
      var k = +card.getAttribute('data-step');
      card.classList.toggle('done', !!done[k]);
      var button = $('.num', card);
      if (!button) return;
      button.setAttribute('aria-pressed', done[k] ? 'true' : 'false');
      button.setAttribute('aria-label', t('step').replace('{n}', k) + ' — ' + t(done[k] ? 'doneLab' : 'todoLab'));
    });
    var prog = $('#progTxt');
    if (prog) prog.textContent = t('prog').replace('{n}', n);
    var fill = $('#barFill');
    if (fill) fill.style.transform = 'scaleX(' + (n / 3) + ')';
    var all = $('#all');
    if (all) all.classList.toggle('show', n === 3);
  }
  window.onSitePaint = paintState;
  function mark(k, value) { done[k] = value; save(); paintState(); }
  $$('.num').forEach(function (button) {
    button.addEventListener('click', function () {
      var k = +button.getAttribute('data-chk');
      mark(k, !done[k]);
    });
  });
  $$('[data-go]').forEach(function (link) {
    link.addEventListener('click', function () {
      setTimeout(function () { mark(+link.getAttribute('data-go'), true); }, 600);
    });
  });
  var reset = $('#reset');
  if (reset) reset.addEventListener('click', function () {
    done = { 1: false, 2: false, 3: false };
    save();
    paintState();
    var steps = $('#steps');
    if (steps && steps.scrollIntoView) steps.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  var note = $('#shareNote');
  function say(k) {
    if (!note) return;
    note.textContent = t(k);
    clearTimeout(say._t);
    say._t = setTimeout(function () { note.textContent = ''; }, 3500);
  }
  var share = $('#share');
  if (share) share.addEventListener('click', function () {
    var url = location.origin + location.pathname.replace(/[^/]*$/, '') + 'join.html';
    var data = { title: t('shareTitle'), text: t('shareText'), url: url };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { say('copied'); }, function () { say('copyFail'); });
    } else say('copyFail');
  });
  var ua = navigator.userAgent || '';
  var iab = $('#iab');
  if (iab && /Android/i.test(ua) && /FBAN|FBAV|FB_IAB|Instagram|\bLine\/|MessengerLite|; wv\)/i.test(ua)) {
    var pageUrl = location.href.split('#')[0];
    iab.hidden = false;
    var open = $('#iabOpen');
    if (open) open.setAttribute('href', 'intent://' + pageUrl.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(pageUrl) + ';end');
    var copy = $('#iabCopy');
    if (copy) copy.addEventListener('click', function () {
      var slot = $('#iabNote');
      var ok = function () { if (slot) slot.textContent = t('iabOk'); };
      var bad = function () { if (slot) slot.textContent = t('copyFail'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(pageUrl).then(ok, bad);
      else bad();
    });
  }
})();
