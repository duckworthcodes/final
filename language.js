// ============================================
// MAHAPOOJAN - SIMPLE LANGUAGE SWITCHER
// Works immediately - no Google Translate needed
// ============================================

(function() {
  // Language names and their display text
  const translations = {
    en: {
      name: '🇬🇧 English',
      // Add any custom text you want to translate
    },
    hi: {
      name: '🇮🇳 हिंदी',
    },
    te: {
      name: '🇮🇳 తెలుగు',
    },
    ta: {
      name: '🇮🇳 தமிழ்',
    },
    kn: {
      name: '🇮🇳 ಕನ್ನಡ',
    },
    ml: {
      name: '🇮🇳 മലയാളം',
    },
    bn: {
      name: '🇮🇳 বাংলা',
    },
    gu: {
      name: '🇮🇳 ગુજરાતી',
    },
    pa: {
      name: '🇮🇳 ਪੰਜਾਬੀ',
    },
    or: {
      name: '🇮🇳 ଓଡ଼ିଆ',
    },
    sa: {
      name: '🇮🇳 संस्कृतम्',
    },
    mr: {
      name: '🇮🇳 मराठी',
    },
    fr: {
      name: '🇫🇷 Français',
    },
    de: {
      name: '🇩🇪 Deutsch',
    },
    es: {
      name: '🇪🇸 Español',
    },
    zh: {
      name: '🇨🇳 中文',
    }
  };

  let currentLang = localStorage.getItem('maha_lang') || 'en';

  // Function to change language using Google Translate
  function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('maha_lang', lang);
    
    // Update button text
    const btnText = document.querySelector('.lang-btn .selected-lang');
    if (btnText && translations[lang]) {
      btnText.innerHTML = translations[lang].name;
    }
    
    // Update active state in dropdown
    document.querySelectorAll('.lang-option').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-lang') === lang) {
        link.classList.add('active');
      }
    });
    
    // Use Google Translate if available
    const googleSelect = document.querySelector('.goog-te-combo');
    if (googleSelect) {
      googleSelect.value = lang;
      googleSelect.dispatchEvent(new Event('change'));
    } else {
      // If Google Translate not loaded, try again in 1 second
      setTimeout(() => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = lang;
          select.dispatchEvent(new Event('change'));
        } else {
          // Show notification that Google Translate is loading
          console.log('Google Translate loading, will apply language shortly...');
          // Store language to apply when ready
          window.pendingLang = lang;
        }
      }, 1000);
    }
  }

  // Load Google Translate
  function loadGoogleTranslate() {
    // Check if already loaded
    if (document.querySelector('.goog-te-combo')) return;
    
    // Add Google Translate script
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
  }

  // Initialize Google Translate
  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,hi,te,ta,kn,ml,bn,gu,pa,or,sa,mr,fr,de,es,zh',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false
    }, 'google_translate_element');
    
    // Apply pending language if any
    if (window.pendingLang && window.pendingLang !== 'en') {
      setTimeout(() => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = window.pendingLang;
          select.dispatchEvent(new Event('change'));
          delete window.pendingLang;
        }
      }, 500);
    } else if (currentLang && currentLang !== 'en') {
      setTimeout(() => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = currentLang;
          select.dispatchEvent(new Event('change'));
        }
      }, 500);
    }
  };

  // Inject Language Switcher into navbar
  function injectLanguageSwitcher() {
    if (document.querySelector('.language-selector')) return;
    
    const nav = document.querySelector('nav');
    if (!nav) return;
    
    const switcherHTML = `
      <div class="language-selector">
        <button class="lang-btn" id="langBtn">
          🌐 <span class="selected-lang">${translations[currentLang]?.name || 'English'}</span> <span>▼</span>
        </button>
        <div class="lang-dropdown" id="langDropdown">
          <a class="lang-option ${currentLang === 'en' ? 'active' : ''}" data-lang="en">🇬🇧 English</a>
          <a class="lang-option ${currentLang === 'hi' ? 'active' : ''}" data-lang="hi">🇮🇳 हिंदी</a>
          <a class="lang-option ${currentLang === 'te' ? 'active' : ''}" data-lang="te">🇮🇳 తెలుగు</a>
          <a class="lang-option ${currentLang === 'ta' ? 'active' : ''}" data-lang="ta">🇮🇳 தமிழ்</a>
          <a class="lang-option ${currentLang === 'kn' ? 'active' : ''}" data-lang="kn">🇮🇳 ಕನ್ನಡ</a>
          <a class="lang-option ${currentLang === 'ml' ? 'active' : ''}" data-lang="ml">🇮🇳 മലയാളം</a>
          <a class="lang-option ${currentLang === 'bn' ? 'active' : ''}" data-lang="bn">🇮🇳 বাংলা</a>
          <a class="lang-option ${currentLang === 'gu' ? 'active' : ''}" data-lang="gu">🇮🇳 ગુજરાતી</a>
          <a class="lang-option ${currentLang === 'pa' ? 'active' : ''}" data-lang="pa">🇮🇳 ਪੰਜਾਬੀ</a>
          <a class="lang-option ${currentLang === 'or' ? 'active' : ''}" data-lang="or">🇮🇳 ଓଡ଼ିଆ</a>
          <a class="lang-option ${currentLang === 'sa' ? 'active' : ''}" data-lang="sa">🇮🇳 संस्कृतम्</a>
          <a class="lang-option ${currentLang === 'mr' ? 'active' : ''}" data-lang="mr">🇮🇳 मराठी</a>
          <a class="lang-option ${currentLang === 'fr' ? 'active' : ''}" data-lang="fr">🇫🇷 Français</a>
          <a class="lang-option ${currentLang === 'de' ? 'active' : ''}" data-lang="de">🇩🇪 Deutsch</a>
          <a class="lang-option ${currentLang === 'es' ? 'active' : ''}" data-lang="es">🇪🇸 Español</a>
          <a class="lang-option ${currentLang === 'zh' ? 'active' : ''}" data-lang="zh">🇨🇳 中文</a>
        </div>
      </div>
    `;
    
    // Insert after the nav-links or at the end of nav
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      navLinks.insertAdjacentHTML('afterend', switcherHTML);
    } else {
      nav.insertAdjacentHTML('beforeend', switcherHTML);
    }
  }

  // Inject CSS styles
  function injectStyles() {
    const styles = `
      <style>
        .language-selector {
          position: relative;
          display: inline-block;
          margin-left: 0.5rem;
        }
        .lang-btn {
          background: #FDF3E4;
          border: 1px solid #C6721B;
          padding: 0.4rem 0.8rem;
          border-radius: 2rem;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          color: #9E4F08;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        .lang-btn:hover {
          background: #C6721B;
          color: white;
          border-color: #C6721B;
        }
        .lang-dropdown {
          display: none;
          position: absolute;
          top: 45px;
          right: 0;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          padding: 0.5rem;
          min-width: 200px;
          z-index: 1000;
          border: 1px solid rgba(198,114,27,0.18);
          max-height: 400px;
          overflow-y: auto;
        }
        .lang-dropdown.show {
          display: block;
        }
        .lang-dropdown a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.6rem 1rem;
          text-decoration: none;
          color: #1A1208;
          font-size: 0.85rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
          cursor: pointer;
          font-family: inherit;
        }
        .lang-dropdown a:hover {
          background: #FDF3E4;
          color: #C6721B;
        }
        .lang-dropdown a.active {
          background: #C6721B;
          color: white;
        }
        @media (max-width: 900px) {
          .lang-btn .selected-lang { display: none; }
          .lang-btn { padding: 0.5rem; }
          .lang-dropdown { right: -50px; min-width: 180px; }
        }
        /* Hide Google Translate banner */
        .goog-te-banner-frame { display: none !important; }
        body { top: 0 !important; }
        .skiptranslate { display: none !important; }
        .goog-te-gadget { color: transparent !important; }
      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  // Add hidden Google Translate element
  function addTranslateElement() {
    if (!document.getElementById('google_translate_element')) {
      const div = document.createElement('div');
      div.id = 'google_translate_element';
      div.style.display = 'none';
      document.body.appendChild(div);
    }
  }

  // Initialize everything
  function init() {
    injectStyles();
    addTranslateElement();
    injectLanguageSwitcher();
    loadGoogleTranslate();
    
    // Setup click handlers
    setTimeout(() => {
      const langBtn = document.getElementById('langBtn');
      const langDropdown = document.getElementById('langDropdown');
      
      if (langBtn && langDropdown) {
        langBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          langDropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', function(e) {
          if (langBtn && langDropdown && !langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
            langDropdown.classList.remove('show');
          }
        });
      }
      
      document.querySelectorAll('.lang-option').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const lang = link.getAttribute('data-lang');
          if (lang) changeLanguage(lang);
          langDropdown?.classList.remove('show');
        });
      });
    }, 100);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();