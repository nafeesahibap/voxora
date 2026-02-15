import { Store } from '../core/store.js';

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
        if (this.isListening) {
            if (this.recognition) this.recognition.stop();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            if (window.showToast) window.showToast("Voice Recognition not supported in this browser.", "error");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.micBtn.classList.add('active');
            this.statusText.textContent = "Listening...";
            this.statusText.style.color = "var(--accent-primary)";
        };

        this.recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log("Global Voice Transcript:", transcript);
            if (window.showToast) window.showToast(`🎤 Heard: "${transcript}"`, 'info');

            await this.handleVoiceCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error("Global Speech Error:", event.error);
            if (window.showToast) window.showToast("Voice Error: " + event.error, "error");
            this.cleanup();
        };

        this.recognition.onend = () => {
            this.cleanup();
        };

        this.recognition.start();
    }

    cleanup() {
        this.isListening = false;
        if (this.micBtn) this.micBtn.classList.remove('active');
        if (this.statusText) {
            this.statusText.textContent = "Ready";
            this.statusText.style.color = "var(--text-muted)";
        }
    }

    async handleVoiceCommand(transcript) {
        // Navigation Commands
        if (transcript.includes('show tasks') || transcript.includes('go to tasks')) {
            window.router.navigateTo('/hr/tasks');
            return;
        }
        if (transcript.includes('show candidates') || transcript.includes('go to candidates')) {
            window.router.navigateTo('/hr/candidates');
            return;
        }
        if (transcript.includes('show dashboard') || transcript.includes('go to dashboard')) {
            window.router.navigateTo('/hr/dashboard');
            return;
        }

        // Task Action Commands (from any page)
        let processed = false;

        if (transcript.includes("interview of nafeesa hiba")) {
            const isDone = transcript.includes("done") || transcript.includes("completed");
            if (isDone) {
                const task = Store.state.tasks.find(t => t.title.toLowerCase().includes("nafeesa hiba"));
                if (task) {
                    await Store.updateTaskStatus(task.id);
                    if (window.showToast) window.showToast("Task marked as completed!", "success");
                    processed = true;
                }
            } else {
                await Store.addTask({
                    title: "Interview of Nafeesa Hiba",
                    priority: "high",
                    status: "pending",
                    category: "interview",
                    voice_created: "true"
                });
                if (window.showToast) window.showToast("Voice task created", "success");
                processed = true;
            }
        } else if (transcript.startsWith("add task")) {
            const title = transcript.replace("add task", "").trim();
            if (title) {
                await Store.addTask({
                    title: title.charAt(0).toUpperCase() + title.slice(1),
                    priority: "high",
                    status: "pending",
                    category: "general",
                    voice_created: "true"
                });
                if (window.showToast) window.showToast(`Task added: "${title}"`, "success");
                processed = true;
            }
        } else if (transcript.includes("completed") || transcript.includes("done")) {
            const search = transcript.replace("mark", "").replace("as", "").replace("completed", "").replace("done", "").trim();
            if (search) {
                const task = Store.state.tasks.find(t => t.title.toLowerCase().includes(search));
                if (task) {
                    await Store.updateTaskStatus(task.id);
                    if (window.showToast) window.showToast(`Task "${task.title}" updated`, "success");
                    processed = true;
                }
            }
        }

        if (processed) {
            await window.router.handleRoute(); // Refresh current view (e.g. Dashboard stats)
        }
    }
}
