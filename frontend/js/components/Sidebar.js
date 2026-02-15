export default class Sidebar {
    constructor() {
        this.micBtn = document.querySelector('.mic-btn-container');
        this.statusText = document.querySelector('.status-text');
        this.isListening = false;
        this.init();
    }

    init() {
        if (this.micBtn) {
            this.micBtn.addEventListener('click', () => this.toggleVoice());
        }
    }

    toggleVoice() {
        this.isListening = !this.isListening;
        if (this.isListening) {
            this.micBtn.classList.add('active');
            this.statusText.textContent = "Listening...";
            this.statusText.style.color = "var(--accent-primary)";

            // Simulate command processing
            setTimeout(() => {
                if (this.isListening) {
                    this.statusText.textContent = "Processing...";
                    setTimeout(() => {
                        this.handleVoiceCommand("show tasks");
                        this.isListening = false;
                        this.statusText.textContent = "Ready";
                        this.statusText.style.color = "var(--text-muted)";
                        this.micBtn.classList.remove('active');
                    }, 1500);
                }
            }, 3000);
        } else {
            this.micBtn.classList.remove('active');
            this.statusText.textContent = "Ready";
            this.statusText.style.color = "var(--text-muted)";
        }
    }

    handleVoiceCommand(cmd) {
        if (cmd.includes('task')) {
            window.router.navigateTo('/hr/tasks');
        } else if (cmd.includes('candidate')) {
            window.router.navigateTo('/hr/candidates');
        } else {
            alert("Command not recognized: " + cmd);
        }
    }
}
