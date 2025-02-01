class ChatManager {
    constructor() {
        this.messageContainer = document.getElementById('chat-messages');
        this.quickOptions = document.getElementById('quick-options');

        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    setupEventListeners() {
        this.quickOptions.addEventListener('click', (e) => {
            if (e.target.classList.contains('option-btn')) {
                const question = e.target.dataset.question;
                this.sendMessage(question);
            }
        });
    }

    addWelcomeMessage() {
        const welcomeMessage = {
            role: 'assistant',
            content: "Welcome! Please select a topic you'd like to learn more about."
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
                    content: "Bear with me! Let's try another question."
                });
            }
        } catch (error) {
            console.error('Error:', error);
            this.displayMessage({
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again later."
            });
        }
    }

    displayMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(message.role === 'user' ? 'user-message' : 'bot-message');

        const content = document.createElement('p');
        content.textContent = message.content;
        messageDiv.appendChild(content);

        if (message.citations && message.citations.length > 0) {
            const citations = document.createElement('div');
            citations.classList.add('citations');
            citations.innerHTML = `<small>Sources: ${message.citations.map(cite => 
                `<a href="${cite}" target="_blank">${new URL(cite).hostname}</a>`
            ).join(', ')}</small>`;
            messageDiv.appendChild(citations);
        }

        this.messageContainer.appendChild(messageDiv);
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
}