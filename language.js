/* ── MahaPoojan · language.js ─────────────────────────────────────────────
   • Saves user's language choice permanently in localStorage
   • Applies it instantly on every page load via cookie (no flash)
   • 🌐 dropdown to change language anytime
──────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const LANGS = [
    { code: 'en',  label: 'EN',   name: 'English'    },
    { code: 'hi',  label: 'हिं',  name: 'हिन्दी'     },
    { code: 'bn',  label: 'বাং',  name: 'বাংলা'      },
    { code: 'pa',  label: 'ਪੰਜ',  name: 'ਪੰਜਾਬੀ'    },
    { code: 'ta',  label: 'தமி',  name: 'தமிழ்'      },
    { code: 'te',  label: 'తెలు', name: 'తెలుగు'     },
    { code: 'ml',  label: 'മല',   name: 'മലയാളം'    },
    { code: 'kn',  label: 'ಕನ್ನ', name: 'ಕನ್ನಡ'      },
    { code: 'gu',  label: 'ગુજ',  name: 'ગુજરાતી'   },
    { code: 'or',  label: 'ଓଡ଼',  name: 'ଓଡ଼ିଆ'      },
    { code: 'mr',  label: 'मरा',  name: 'मराठी'      },
  ];

  /* ── STEP 1: Apply saved language IMMEDIATELY via cookie (before page renders) ── */
  const savedLang = localStorage.getItem('mp_lang') || 'en';

  function setCookie(lang) {
    const val = lang === 'en' ? '/en/en' : `/en/${lang}`;
    const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
    const base = `googtrans=${val}; expires=${exp.toUTCString()}; path=/`;
    document.cookie = base;
    document.cookie = base + `; domain=${location.hostname}`;
    document.cookie = base + `; domain=.${location.hostname}`;
  }

  // Set cookie right now so GT picks it up on this page load
  setCookie(savedLang);

  /* ── STEP 2: Remove the meta tag that blocks translation ── */
  function removeBlocker() {
    const m = document.getElementById('gt-meta') ||
              document.querySelector('meta[name="google"][content="notranslate"]');
    if (m) m.remove();
  }
  removeBlocker();
  // Also remove it after DOM loads in case it's added late
  document.addEventListener('DOMContentLoaded', removeBlocker);

  /* ── STEP 3: Load Google Translate (fixed URL) ── */
  function loadGT() {
    document.querySelectorAll('script[src*="translate.google.com"]').forEach(s => s.remove());

    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: LANGS.map(l => l.code).join(','), autoDisplay: false },
        'mp-gt-el'
      );
      // Cookie already set — GT will auto-apply the right language
      setTimeout(nukeBar, 600);
    };

    const s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.head.appendChild(s);
  }

  /* ── STEP 4: Aggressively hide Google's toolbar ── */
  function nukeBar() {
    const selectors = [
      '.goog-te-banner-frame', '.goog-te-balloon-frame',
      '.goog-tooltip', '#goog-gt-tt',
      '.VIpgJd-ZVi9od-aZ2wEe-wOHMyf',
      '.VIpgJd-ZVi9od-aZ2wEe-OiiCO',
      '.skiptranslate:not(#mp-gt-el)',
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.cssText = 'display:none!important;visibility:hidden!important;';
      });
    });
    document.body.style.top = '0';
    document.documentElement.style.top = '0';
  }

  // Keep nuking on a short interval to catch late-injected elements
  setInterval(nukeBar, 800);

  /* ── STEP 5: Styles ── */
  const style = document.createElement('style');
  style.textContent = `
    .goog-te-banner-frame,.goog-te-balloon-frame,.goog-tooltip,
    #goog-gt-tt,.VIpgJd-ZVi9od-aZ2wEe-wOHMyf,.VIpgJd-ZVi9od-aZ2wEe-OiiCO,
    .skiptranslate:not(#mp-gt-el) { display:none!important; }
    body,html { top:0!important; }
    #mp-gt-el { position:absolute;visibility:hidden;pointer-events:none;width:1px;height:1px;overflow:hidden; }

    #mp-lang-btn {
      position:fixed; bottom:22px; right:20px; z-index:2147483647;
      background:rgba(15,10,2,0.93); border:1px solid rgba(212,168,83,0.4);
      border-radius:40px; padding:8px 18px;
      display:flex; align-items:center; gap:8px;
      cursor:pointer; backdrop-filter:blur(16px);
      box-shadow:0 6px 24px rgba(0,0,0,0.5);
      font-family:'Jost','Segoe UI',sans-serif;
      font-size:0.78rem; color:#F5C77E; letter-spacing:0.05em;
      transition:border-color 0.2s; user-select:none;
    }
    #mp-lang-btn:hover { border-color:rgba(212,168,83,0.7); }

    #mp-lang-menu {
      position:fixed; bottom:68px; right:20px; z-index:2147483647;
      background:rgba(15,10,2,0.97); border:1px solid rgba(212,168,83,0.3);
      border-radius:16px; padding:8px;
      display:none; flex-direction:column; gap:2px;
      backdrop-filter:blur(20px); box-shadow:0 12px 40px rgba(0,0,0,0.6);
      min-width:160px; font-family:'Jost','Segoe UI',sans-serif;
    }
    #mp-lang-menu.mp-open { display:flex; }
    #mp-lang-menu button {
      background:transparent; border:none; color:rgba(255,255,255,0.6);
      padding:9px 14px; border-radius:10px; cursor:pointer;
      text-align:left; font-size:0.8rem;
      display:flex; align-items:center; gap:10px;
      transition:all 0.15s; font-family:inherit;
    }
    #mp-lang-menu button:hover { background:rgba(198,114,27,0.15); color:#F5C77E; }
    #mp-lang-menu button.mp-active { background:rgba(198,114,27,0.25); color:#F5C77E; }
    #mp-lang-menu button .mp-code { font-size:0.75rem; color:#C6721B; min-width:28px; }
    #mp-lang-menu .mp-div { height:1px; background:rgba(212,168,83,0.12); margin:4px 8px; }
  `;
  document.head.appendChild(style);

  /* ── STEP 6: Inject UI ── */
  function injectUI() {
    // Hidden GT container
    const gtEl = document.createElement('div');
    gtEl.id = 'mp-gt-el';
    document.body.appendChild(gtEl);

    // Toggle button
    const btn = document.createElement('div');
    btn.id = 'mp-lang-btn';
    const cur = LANGS.find(l => l.code === savedLang) || LANGS[0];
    btn.innerHTML = `<span>🌐</span><span id="mp-cur-label">${cur.label}</span><span style="opacity:0.4;font-size:0.6rem">▲</span>`;
    btn.addEventListener('click', e => { e.stopPropagation(); document.getElementById('mp-lang-menu').classList.toggle('mp-open'); });
    document.body.appendChild(btn);

    // Dropdown menu
    const menu = document.createElement('div');
    menu.id = 'mp-lang-menu';
    menu.innerHTML = LANGS.map((l, i) =>
      (i === 1 ? '<div class="mp-div"></div>' : '') +
      `<button data-l="${l.code}" class="${l.code === savedLang ? 'mp-active' : ''}">
        <span class="mp-code">${l.label}</span>${l.name}
      </button>`
    ).join('');
    menu.addEventListener('click', e => {
      const b = e.target.closest('button[data-l]');
      if (!b) return;
      switchTo(b.dataset.l);
    });
    document.body.appendChild(menu);

    document.addEventListener('click', () => menu.classList.remove('mp-open'));

    loadGT();
  }

  /* ── STEP 7: Switch language & save permanently ── */
  function switchTo(lang) {
    localStorage.setItem('mp_lang', lang);  // saved forever
    setCookie(lang);
    document.getElementById('mp-lang-menu').classList.remove('mp-open');
    // Reload so GT applies from cookie cleanly
    location.reload();
  }

  /* ── Boot ── */
  if (document.body) injectUI();
  else document.addEventListener('DOMContentLoaded', injectUI);

})();