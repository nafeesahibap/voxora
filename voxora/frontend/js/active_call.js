class ActiveCallManager {
    constructor() {
        this.isActive = false;
        this.timerInterval = null;
        this.seconds = 0;
        this.overlay = document.getElementById('callOverlay');
        this.timerDisplay = document.getElementById('callTimer');
        this.statusDisplay = document.getElementById('callStatus');
        this.transcriptArea = document.getElementById('callTranscript');
    }

    startSession() {
        this.isActive = true;
        this.seconds = 0;
        this.overlay.classList.add('active');
        this.updateTimer();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        this.statusDisplay.textContent = "CONNECTED";
        this.statusDisplay.style.color = "#10b981"; // Green

        // Start Voice Engine if available
        if (window.voiceEngine) {
            window.voiceEngine.start();
            // Hook into voice engine results for this UI
            // Ideally VoiceEngine should emit events, but we'll polling or relying on global for this prototype
        }
    }

    endSession() {
        this.isActive = false;
        clearInterval(this.timerInterval);
        this.overlay.classList.remove('active');

        if (window.voiceEngine) window.voiceEngine.stop();

        // Trigger Summary of this session
        // Using the mock summary function from calls.js
        if (typeof summarizeCall === 'function') {
            summarizeCall('current_session');
        }
    }

    updateTimer() {
        this.seconds++;
        const mins = Math.floor(this.seconds / 60);
        const secs = this.seconds % 60;
        this.timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    toggleMute() {
        // Mock mute
        alert("Microphone Muted");
    }
}

// Global instance
window.callManager = new ActiveCallManager();
