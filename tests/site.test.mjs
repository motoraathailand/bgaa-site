import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const LANGS = ['th', 'en', 'ko', 'zh', 'hi'];
const SCRIPTS = {
  th: /[\u0E00-\u0E7F]/,
  ko: /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/,
  zh: /[\u4E00-\u9FFF]/,
  hi: /[\u0900-\u097F]/
};

function loadStrings() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(read('js/strings.js'), ctx);
  return ctx.window.SITE_STR;
}

test('each language keeps only its own script (no leftover Hangul or other-language text)', () => {
  const S = loadStrings();
  for (const page of ['intro', 'join']) {
    for (const lang of LANGS) {
      const d = S[page][lang];
      assert.ok(d, `${page}.${lang} missing`);
      for (const [k, v] of Object.entries(d)) {
        const text = String(v);
        for (const [other, re] of Object.entries(SCRIPTS)) {
          if (other === lang) continue;
          assert.doesNotMatch(text, re, `${page}.${lang}.${k} contains ${other} script: ${text}`);
        }
      }
    }
  }
});

test('intro and join copy omit App Store and iPhone coming-soon wording', () => {
  const S = loadStrings();
  const banned = /App Store|iPhone|Apple Inc\.?|iTunes/i;
  for (const page of ['intro', 'join']) {
    for (const lang of LANGS) {
      const d = S[page][lang];
      assert.equal('asCap' in d, false, `${page}.${lang} still has asCap`);
      assert.equal('asAria' in d, false, `${page}.${lang} still has asAria`);
      for (const [k, v] of Object.entries(d)) {
        assert.doesNotMatch(String(v), banned, `${page}.${lang}.${k}: ${v}`);
      }
    }
  }
});

test('note, FAQ a5, and trademarks stay Android / Play only in every language', () => {
  const S = loadStrings();
  for (const lang of LANGS) {
    const d = S.intro[lang];
    assert.match(d.note, /Google Play/);
    assert.doesNotMatch(d.note, /iPhone|App Store|coming soon|곧 출시|เร็ว ๆ นี้|即将推出|जल्द/i);
    assert.match(d.a5, /Android/);
    assert.doesNotMatch(d.a5, /iPhone|App Store/i);
    assert.match(d.ftTm, /Google Play/);
    assert.match(d.ftTm, /Android Auto/);
    assert.doesNotMatch(d.ftTm, /Apple|App Store/);
    assert.equal(d.ftTm, S.join[lang].ftTm);
  }
});

test('intro HTML keeps a single Play badge and drops the App Store badge', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /data-badge="as"/);
  assert.doesNotMatch(html, /dlb-off|asAria|asCap|as-th\.svg|App Store|iPhone/);
  assert.match(html, /data-badge="gp"/);
  assert.match(html, /class="stores one"/);
  assert.match(html, /class="dlbar-in one"/);
  assert.match(html, /data-t="gpCap"/);
  assert.ok([...html.matchAll(/data-badge="gp"/g)].length >= 3, 'hero, closing, and sticky bar Play badges');
  const css = read('css/site.css');
  assert.match(css, /\.stores\.one\{/);
  assert.match(css, /\.dlbar-in\.one\{/);
});

test('site.js only switches Google Play badges', () => {
  const js = read('js/site.js');
  assert.doesNotMatch(js, /as-/);
  assert.match(js, /data-badge="gp"/);
});
