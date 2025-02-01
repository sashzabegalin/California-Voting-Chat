document.addEventListener('DOMContentLoaded', () => {
    // Initialize chat manager
    const chatManager = new ChatManager();

    // Update election countdown
    function updateElectionCountdown() {
        fetch('/get_election_countdown')
            .then(response => response.json())
            .then(data => {
                const countElement = document.getElementById('days-count');
                countElement.textContent = `${data.days} Days Until Election`;
                
                const registrationStatus = document.getElementById('registration-status');
                registrationStatus.style.display = data.registration_open ? 'block' : 'none';
            })
            .catch(error => console.error('Error fetching election countdown:', error));
    }

    // Update countdown immediately and then every hour
    updateElectionCountdown();
    setInterval(updateElectionCountdown, 3600000);

    // Accessibility improvements
    document.querySelectorAll('.option-btn').forEach(button => {
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });

    // Handle focus states for accessibility
    const focusableElements = document.querySelectorAll('button, input, a');
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => element.classList.add('focused'));
        element.addEventListener('blur', () => element.classList.remove('focused'));
    });
});
