class ChatManager {
    constructor() {
        this.messageContainer = document.getElementById('chat-messages');
        this.quickOptions = document.getElementById('quick-options');
        this.currentLanguage = 'en';

        if (!this.messageContainer || !this.quickOptions) {
            console.error('Required DOM elements not found');
            return;
        }

        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    setupEventListeners() {
        this.quickOptions.addEventListener('click', (e) => {
            const button = e.target.closest('.option-btn');
            if (button) {
                const emoji = button.dataset.emoji;
                const question = this.currentLanguage === 'en' ? 
                    button.dataset.question : 
                    button.dataset.questionEs;
                this.sendMessage(`${emoji} ${question}`);
            }
        });

        window.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            this.messageContainer.innerHTML = ''; // Clear existing messages
            this.addWelcomeMessage(); // Add new welcome message in current language
        });
    }

    addWelcomeMessage() {
        const welcomeMessage = {
            role: 'assistant',
            content: this.currentLanguage === 'en' ?
                "🐻 I'm Bear Bot, your friendly California voting guide!" :
                "🐻 ¡Soy Bot Oso, tu amigable guía electoral de California!"
        };
        this.displayMessage(welcomeMessage);
    }

    async sendMessage(message) {
        if (!message) return;

        this.displayMessage({ role: 'user', content: message });
        this.showThinkingIndicator();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message,
                    language: this.currentLanguage
                })
            });

            this.removeThinkingIndicator();
            const data = await response.json();

            if (data.success) {
                this.displayMessage({
                    role: 'assistant',
                    content: data.message,
                    citations: data.citations
                });
            } else {
                const errorMessage = this.currentLanguage === 'en' ?
                    "Bear with me! 🐻\n\nLet's try another question!" :
                    "¡Un momento! 🐻\n\n¡Intentemos otra pregunta!";
                this.displayMessage({
                    role: 'assistant',
                    content: errorMessage
                });
            }
        } catch (error) {
            console.error('Error:', error);
            this.removeThinkingIndicator();
            const errorMessage = this.currentLanguage === 'en' ?
                "Oops! 🐻\n\nI'm having trouble connecting right now. Please try again!" :
                "¡Ups! 🐻\n\nEstoy teniendo problemas de conexión. ¡Por favor, inténtalo de nuevo!";
            this.displayMessage({
                role: 'assistant',
                content: errorMessage
            });
        }
    }

    showThinkingIndicator() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.classList.add('message', 'bot-message', 'thinking');

        const header = document.createElement('div');
        header.classList.add('bot-header');
        header.innerHTML = translations[this.currentLanguage].botName;
        thinkingDiv.appendChild(header);

        const content = document.createElement('div');
        content.classList.add('bot-content');
        content.innerHTML = translations[this.currentLanguage].thinking;
        thinkingDiv.appendChild(content);

        this.messageContainer.appendChild(thinkingDiv);
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }

    removeThinkingIndicator() {
        const thinking = this.messageContainer.querySelector('.thinking');
        if (thinking) {
            thinking.remove();
        }
    }

    formatContent(content) {
        return content
            .replace(/\. /g, '.\n\n')
            .replace(/\n\n\n+/g, '\n\n');
    }

    displayMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(message.role === 'user' ? 'user-message' : 'bot-message');

        if (message.role === 'assistant') {
            const header = document.createElement('div');
            header.classList.add('bot-header');
            header.innerHTML = translations[this.currentLanguage].botName;
            messageDiv.appendChild(header);

            const contentContainer = document.createElement('div');
            contentContainer.classList.add('bot-content');

            const content = document.createElement('div');
            content.classList.add('message-content');
            const formattedContent = this.formatContent(message.content);
            content.textContent = formattedContent;
            contentContainer.appendChild(content);

            if (message.citations && message.citations.length > 0) {
                const citations = document.createElement('div');
                citations.classList.add('citations');
                citations.innerHTML = `<small>📚 ${this.currentLanguage === 'en' ? 'Sources' : 'Fuentes'}: ${message.citations.map((cite, index) => 
                    `[${index + 1}] <a href="${cite}" target="_blank" rel="noopener noreferrer">${new URL(cite).hostname}</a>`
                ).join(' • ')}</small>`;
                contentContainer.appendChild(citations);
            }

            messageDiv.appendChild(contentContainer);
        } else {
            const content = document.createElement('div');
            content.classList.add('message-content');
            content.textContent = message.content;
            messageDiv.appendChild(content);
        }

        this.messageContainer.appendChild(messageDiv);
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatManager();
});