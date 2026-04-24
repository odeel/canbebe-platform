// ═══════════════════════════════════════════════════════════
// CANBEBE TRANSLATION SYSTEM
// Multi-language support: English, French, Arabic (with RTL)
// ═══════════════════════════════════════════════════════════

const TRANSLATIONS = {
    en: null,
    fr: null,
    ar: null
};

let currentLang = localStorage.getItem('canbebe_lang') || 'en';

// ═══════════════════════════════════════════════════════════
// LOAD TRANSLATION FILES
// ═══════════════════════════════════════════════════════════
async function loadTranslations() {
    try {
        // Load all translation files in parallel
        const [enData, frData, arData] = await Promise.all([
            fetch('translations/en.json').then(r => r.json()),
            fetch('translations/fr.json').then(r => r.json()),
            fetch('translations/ar.json').then(r => r.json())
        ]);

        TRANSLATIONS.en = enData;
        TRANSLATIONS.fr = frData;
        TRANSLATIONS.ar = arData;

        return true;
    } catch (error) {
        console.error('Failed to load translations:', error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════
// GET TRANSLATION BY KEY
// Usage: t('nav.products') or t('hero.title')
// ═══════════════════════════════════════════════════════════
function t(key) {
    const keys = key.split('.');
    let value = TRANSLATIONS[currentLang];

    for (const k of keys) {
        if (value && value[k] !== undefined) {
            value = value[k];
        } else {
            console.warn(`Translation key not found: ${key} for language: ${currentLang}`);
            return key;
        }
    }

    return value;
}

// ═══════════════════════════════════════════════════════════
// CHANGE LANGUAGE
// ═══════════════════════════════════════════════════════════
function setLanguage(lang) {
    if (!['en', 'fr', 'ar'].includes(lang)) {
        console.error('Unsupported language:', lang);
        return;
    }

    currentLang = lang;
    localStorage.setItem('canbebe_lang', lang);

    // Update HTML lang and dir attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Update body class for RTL styling
    if (lang === 'ar') {
        document.body.classList.add('rtl');
    } else {
        document.body.classList.remove('rtl');
    }

    // Update language dropdown if it exists
    updateLanguageDropdown(lang);

    // Translate all elements with data-i18n attribute
    translatePage();
}

// ═══════════════════════════════════════════════════════════
// UPDATE LANGUAGE DROPDOWN DISPLAY
// ═══════════════════════════════════════════════════════════
function updateLanguageDropdown(lang) {
    const langNames = {
        en: 'English',
        fr: 'Français',
        ar: 'العربية'
    };

    const langFlags = {
        en: '🇬🇧',
        fr: '🇫🇷',
        ar: '🇩🇿'
    };

    const currentLangBtn = document.getElementById('current-lang');
    if (currentLangBtn) {
        currentLangBtn.innerHTML = `${langFlags[lang]} ${langNames[lang]}`;
    }

    // Update active state in dropdown
    document.querySelectorAll('.lang-option').forEach(option => {
        const optionLang = option.getAttribute('data-lang');
        if (optionLang === lang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// ═══════════════════════════════════════════════════════════
// TRANSLATE ALL ELEMENTS ON PAGE
// Elements with data-i18n="key" will be translated
// ═══════════════════════════════════════════════════════════
function translatePage() {
    // Translate elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);

        // Check if element has data-i18n-attr to translate attribute instead of content
        const attr = element.getAttribute('data-i18n-attr');
        if (attr) {
            element.setAttribute(attr, translation);
        } else {
            // Support HTML content (for <em> tags etc)
            if (translation.includes('<em>')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
}

// ═══════════════════════════════════════════════════════════
// INITIALIZE TRANSLATION SYSTEM
// ═══════════════════════════════════════════════════════════
async function initTranslations() {
    // Show loading state if needed
    const loadSuccess = await loadTranslations();

    if (!loadSuccess) {
        console.error('Failed to initialize translations');
        return;
    }

    // Set initial language
    setLanguage(currentLang);
}

// ═══════════════════════════════════════════════════════════
// LANGUAGE DROPDOWN TOGGLE
// ═══════════════════════════════════════════════════════════
function toggleLanguageDropdown() {
    const dropdown = document.getElementById('lang-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const langSelector = document.querySelector('.lang-selector');
    const dropdown = document.getElementById('lang-dropdown');

    if (dropdown && langSelector && !langSelector.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// ═══════════════════════════════════════════════════════════
// EXPORT FOR USE IN OTHER SCRIPTS
// ═══════════════════════════════════════════════════════════
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { t, setLanguage, initTranslations };
}