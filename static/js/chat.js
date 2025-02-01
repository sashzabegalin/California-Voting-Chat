class ChatManager {
    constructor() {
        this.messageContainer = document.getElementById('chat-messages');
        this.quickOptions = document.getElementById('quick-options');

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
                const question = button.dataset.question;
                this.sendMessage(question);
            }
        });
    }

    addWelcomeMessage() {
        const welcomeMessage = {
            role: 'assistant',
            content: "Hi there! 🐻\n\nI'm Bear Bot, your friendly California voting guide! I'm here to help you learn about voting, elections, and everything in between. What would you like to know?"
        };
        this.displayMessage(welcomeMessage);
    }

    async sendMessage(message) {
        if (!message) return;

        // Display user message
        this.displayMessage({ role: 'user', content: message });

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            if (data.success) {
                this.displayMessage({
                    role: 'assistant',
                    content: data.message,
                    citations: data.citations
                });
            } else {
                this.displayMessage({
                    role: 'assistant',
                    content: "Bear with me! 🐻\n\nLet's try another question. Sometimes even bears need a moment to think!"
                });
            }
        } catch (error) {
            console.error('Error:', error);
            this.displayMessage({
                role: 'assistant',
                content: "Oops! 🐻\n\nI'm having trouble connecting right now. Please try another question while I sort things out!"
            });
        }
    }

    formatContent(content) {
        // Add line breaks after each sentence for better readability
        return content
            .replace(/\. /g, '.\n\n')
            .replace(/\n\n\n+/g, '\n\n') // Remove excessive line breaks
    }

    displayMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(message.role === 'user' ? 'user-message' : 'bot-message');

        if (message.role === 'assistant') {
            // Add bot header
            const header = document.createElement('div');
            header.classList.add('bot-header');
            header.innerHTML = '🐻 Bear Bot';
            messageDiv.appendChild(header);

            // Create content container
            const contentContainer = document.createElement('div');
            contentContainer.classList.add('bot-content');

            // Add message content
            const content = document.createElement('div');
            content.classList.add('message-content');
            const formattedContent = this.formatContent(message.content);
            content.textContent = formattedContent;
            contentContainer.appendChild(content);

            // Add citations if available
            if (message.citations && message.citations.length > 0) {
                const citations = document.createElement('div');
                citations.classList.add('citations');
                citations.innerHTML = `<small>📚 Sources: ${message.citations.map((cite, index) => 
                    `[${index + 1}] <a href="${cite}" target="_blank" rel="noopener noreferrer">${new URL(cite).hostname}</a>`
                ).join(' • ')}</small>`;
                contentContainer.appendChild(citations);
            }

            messageDiv.appendChild(contentContainer);
        } else {
            // User message
            const content = document.createElement('div');
            content.classList.add('message-content');
            content.textContent = message.content;
            messageDiv.appendChild(content);
        }

        this.messageContainer.appendChild(messageDiv);
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
}

// Initialize the chat manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatManager();
});