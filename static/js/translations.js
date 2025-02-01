const translations = {
    en: {
        title: '🗳️ California Voter Guide',
        languageButton: 'Español',
        footer: 'For official information, visit',
        options: {
            register: '🔵 How to register?',
            election: '📅 Next election date',
            ballot: '❓ What\'s on my ballot?',
            polling: '🏠 Find my polling place',
            sample: '📋 See sample ballot',
            id: '🆔 Voter ID requirements'
        },
        thinking: '🤔 Thinking...',
        botName: '🐻 Bear Bot'
    },
    es: {
        title: '🗳️ Guía Electoral de California',
        languageButton: 'English',
        footer: 'Para información oficial, visite',
        options: {
            register: '🔵 ¿Cómo registrarse?',
            election: '📅 Fecha de la próxima elección',
            ballot: '❓ ¿Qué hay en mi boleta?',
            polling: '🏠 Encuentra tu lugar de votación',
            sample: '📋 Ver boleta de muestra',
            id: '🆔 Requisitos de identificación'
        },
        thinking: '🤔 Pensando...',
        botName: '🐻 Bot Oso'
    }
};

class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.languageToggle = document.getElementById('language-toggle');
        this.setupEventListeners();
        this.updateUILanguage();
    }

    setupEventListeners() {
        this.languageToggle.addEventListener('click', () => {
            this.currentLanguage = this.currentLanguage === 'en' ? 'es' : 'en';
            this.updateUILanguage();
            // Store language preference
            localStorage.setItem('preferredLanguage', this.currentLanguage);
            // Dispatch event for chat manager
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: this.currentLanguage }
            }));
        });
    }

    updateUILanguage() {
        // Update header
        document.querySelector('header h1').textContent = translations[this.currentLanguage].title;
        document.querySelector('.lang-text').textContent = translations[this.currentLanguage].languageButton;

        // Update quick options
        const options = document.querySelectorAll('.option-btn');
        options.forEach(button => {
            const questionKey = this.currentLanguage === 'en' ? 'data-question' : 'data-question-es';
            const text = button.getAttribute(questionKey);
            button.textContent = text;
        });

        // Update footer
        document.querySelector('footer p').firstChild.textContent = translations[this.currentLanguage].footer + ' ';
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Initialize language manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
});
