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
                const emoji = button.dataset.emoji;
                this.sendMessage(`${emoji} ${question}`);
            }
        });
    }

    addWelcomeMessage() {
        const welcomeMessage = {
            role: 'assistant',
            content: "🐻 I'm Bear Bot, your friendly California voting guide!"
        };
        this.displayMessage(welcomeMessage);
    }

    async sendMessage(message) {
        if (!message) return;

        // Display user message
        this.displayMessage({ role: 'user', content: message });

        // Show thinking indicator
        this.showThinkingIndicator();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            // Remove thinking indicator
            this.removeThinkingIndicator();

            const data = await response.json();

            if (data.success) {
                this.displayMessage({
                    role: 'assistant',
                    content: data.message,
                    citations: data.citations
                });
                // Extract and display follow-up questions
                this.updateFollowUpQuestions(data.message);
            } else {
                this.displayMessage({
                    role: 'assistant',
                    content: "Whoops! 🐻\n\nEven bears have their off moments. Let's try another question!"
                });
            }
        } catch (error) {
            console.error('Error:', error);
            this.removeThinkingIndicator();
            this.displayMessage({
                role: 'assistant',
                content: "Oops! 🐻\n\nI'm having trouble connecting right now. Please try another question while I sort things out!"
            });
        }
    }

    updateFollowUpQuestions(message) {
        // Look for the follow-up questions section
        const followUpSection = message.split(/Would you like to know more about:|What else would you like to know\?/i)[1];

        if (followUpSection) {
            // Extract questions that start with emoji
            const questions = followUpSection.split('\n')
                .map(line => line.trim())
                .filter(line => line.match(/^[^\w\s]/) && line.length > 2); // Lines starting with emoji

            if (questions.length > 0) {
                // Clear existing quick options
                this.quickOptions.innerHTML = '';

                // Add new follow-up questions as buttons
                questions.forEach(question => {
                    const emoji = question.match(/^[^\w\s]+/)[0].trim();
                    const text = question.replace(emoji, '').trim();
                    const button = document.createElement('button');
                    button.className = 'option-btn';
                    button.dataset.question = text;
                    button.dataset.emoji = emoji;
                    button.textContent = `${emoji} ${text}`;
                    this.quickOptions.appendChild(button);
                });

                // Animate new options
                this.quickOptions.style.opacity = '0';
                requestAnimationFrame(() => {
                    this.quickOptions.style.transition = 'opacity 0.3s ease-in';
                    this.quickOptions.style.opacity = '1';
                });
            }
        }
    }

    showThinkingIndicator() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.classList.add('message', 'bot-message', 'thinking');

        const header = document.createElement('div');
        header.classList.add('bot-header');
        header.innerHTML = '🐻 Bear Bot';
        thinkingDiv.appendChild(header);

        const content = document.createElement('div');
        content.classList.add('bot-content');
        content.innerHTML = '🤔 Thinking...';
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