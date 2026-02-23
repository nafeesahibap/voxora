class VoiceEngine {
    constructor() {
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isListening = false;
        this.micBtn = document.querySelector('.mic-btn-container');
        this.micIcon = document.querySelector('.mic-btn i');
        this.chatBubble = document.querySelector('.chat-bubble');
        this.statusText = document.querySelector('.status-text');
        this.transcript = "";

        this.init();
    }

    init() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;

            this.recognition.onstart = () => this.onStart();
            this.recognition.onend = () => this.onEnd();
            this.recognition.onresult = (event) => this.onResult(event);
            this.recognition.onerror = (event) => this.onError(event);

            // Bind click
            if (this.micBtn) {
                this.micBtn.addEventListener('click', () => this.toggle());
            }
        } else {
            console.error("Web Speech API not supported.");
            if (this.chatBubble) this.chatBubble.textContent = "Voice not supported in this browser.";
        }
    }

    toggle() {
        if (this.isListening) {
            this.stop();
        } else {
            this.start();
        }
    }

    start() {
        if (this.recognition) {
            this.transcript = "";
            this.recognition.start();
            // Cancel any current speaking
            this.synth.cancel();
        }
    }

    stop() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    onStart() {
        this.isListening = true;
        this.statusText.textContent = "LISTENING...";
        this.statusText.style.color = "#f87171"; // Red for recording
        this.micIcon.className = "ph-fill ph-stop";

        // Add pulse animation
        const ring = document.querySelector('.mic-btn-ring');
        if (ring) ring.style.animation = "pulse-halo 1s infinite alternate";

        if (this.chatBubble) this.chatBubble.textContent = "Listening...";
    }

    onEnd() {
        this.isListening = false;
        this.statusText.textContent = "PROCESSING..."; // Brief processing state
        this.statusText.style.color = "var(--accent-primary)";
        this.micIcon.className = "ph-fill ph-microphone";

        // Stop animation
        const ring = document.querySelector('.mic-btn-ring');
        if (ring) ring.style.animation = "spin-slow 10s linear infinite";

        // Summarize & Speak
        if (this.transcript.trim().length > 0) {
            this.processInput(this.transcript);
        } else {
            this.statusText.textContent = "STANDBY";
            if (this.chatBubble) this.chatBubble.textContent = "Hi James, how can I assist you today?";
        }
    }

    onResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        // Update bubble
        if (this.chatBubble) {
            this.chatBubble.textContent = finalTranscript + interimTranscript;
        }
        this.transcript = finalTranscript + interimTranscript;
    }

    onError(event) {
        console.error("Speech Error", event.error);
        this.statusText.textContent = "ERROR";
        this.isListening = false;
    }

    processInput(text) {
        // Simple logic to determine response
        let response = "I have logged that for you.";

        if (text.toLowerCase().includes("summary") || text.toLowerCase().includes("summarize")) {
            response = "I will generate a summary of your key points now.";
            setTimeout(() => this.summarize(text), 2000);
        } else if (text.toLowerCase().includes("meeting")) {
            response = "I can schedule that meeting. Please check your calendar.";
        } else {
            response = "I heard you. Processing your request.";
        }

        // Update UI
        this.statusText.textContent = "SPEAKING...";
        this.speak(response);
    }

    speak(text) {
        if (!this.synth) return;

        const utterThis = new SpeechSynthesisUtterance(text);

        // Try to find a female/pleasant voice
        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Female") || v.name.includes("Google US English") || v.name.includes("Microsoft Zira"));
        if (preferredVoice) utterThis.voice = preferredVoice;

        utterThis.onend = () => {
            this.statusText.textContent = "STANDBY";
        };

        this.synth.speak(utterThis);
    }

    summarize(text) {
        alert(`VOXORA SUMMARY:\n\nUser said: "${text}"\n\nAction: Logged.`);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.voiceEngine = new VoiceEngine();
});
