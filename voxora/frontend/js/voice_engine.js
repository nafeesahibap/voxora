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
            this.recognition.continuous = false; // Stop when the user pauses
            this.recognition.interimResults = true;

            this.recognition.lang = 'en-US';
            this.recognition.onstart = () => this.onStart();
            this.recognition.onend = () => this.onEnd();
            this.recognition.onresult = (event) => this.onResult(event);
            this.recognition.onerror = (event) => this.onError(event);
            console.log("VoiceEngine: webkitSpeechRecognition initialized.");

            // Bind click - removed from VoiceEngine, handled by components like Sidebar.js
            /*
            if (this.micBtn) {
                this.micBtn.addEventListener('click', () => this.toggle());
            }
            */
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
        console.log("VoiceEngine: Attempting to start listening...");
        if (this.recognition) {
            try {
                this.transcript = "";
                this.recognition.start();
                // Cancel any current speaking
                this.synth.cancel();
            } catch (err) {
                console.warn("VoiceEngine: Recognition already started or failed to start:", err);
                if (err.name === 'InvalidStateError') {
                    // Try to stop first if it's already running
                    this.stop();
                }
            }
        } else {
            console.error("VoiceEngine: Recognition not supported.");
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
            if (this.chatBubble) this.chatBubble.textContent = "Hi Alex, how can I assist you today?";
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
        console.error("VoiceEngine: Speech Error", event.error);
        this.statusText.textContent = "ERROR";
        this.isListening = false;

        if (event.error === 'not-allowed') {
            if (this.chatBubble) this.chatBubble.textContent = "Microphone permission denied. Please allow mic access in your browser.";
            if (window.showToast) window.showToast("Microphone permission denied", "error");
        } else if (event.error === 'no-speech') {
            console.warn("VoiceEngine: No speech detected.");
            this.statusText.textContent = "STANDBY";
            if (this.chatBubble) this.chatBubble.textContent = "I didn't hear anything. Try again?";
        }
    }

    async processInput(text) {
        const transcript = String(text || '').toLowerCase().trim();

        const syncUI = async () => {
            if (window.router && typeof window.router.handleRoute === 'function') {
                await window.router.handleRoute();
            } else if (window.VoxoraTasksUI && typeof window.VoxoraTasksUI.refresh === 'function') {
                window.VoxoraTasksUI.refresh();
            }
            this.updateHrDashboardTaskWidgets();
        };

        const speakWithStatus = (message, onComplete = null) => {
            this.statusText.textContent = "SPEAKING...";
            this.speak(message, onComplete);
        };

        const fail = (message) => {
            if (window.showToast) window.showToast(message, 'error');
            speakWithStatus(message);
        };

        try {
            // Navigation Commands (Frontend handled)
            if (transcript.includes('show tasks') || transcript.includes('go to tasks')) {
                if (window.router) window.router.navigateTo('/hr/tasks');
                speakWithStatus("Opening tasks.");
                return;
            }
            if (transcript.includes('show candidates') || transcript.includes('go to candidates')) {
                if (window.router) window.router.navigateTo('/hr/candidates');
                speakWithStatus("Opening candidates.");
                return;
            }
            if (transcript.includes('show dashboard') || transcript.includes('go to dashboard')) {
                if (window.router) window.router.navigateTo('/hr/dashboard');
                speakWithStatus("Opening dashboard.");
                return;
            }

            if (!window.Store) {
                fail("Store not found. Cannot process tasks.");
                return;
            }

            // Route all other commands to the backend NLP pipeline
            this.statusText.textContent = "PROCESSING...";

            const payload = {
                text: transcript
            };

            // If in a multi-turn conversation, send the session memory back
            if (this.currentSessionId) {
                payload.session_id = this.currentSessionId;
            }

            const response = await fetch('/api/v1/tasks/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                fail(errData.detail || errData.message || "Failed to process voice command.");
                return;
            }

            const data = await response.json();

            // Handle Multi-Turn Priority check
            if (data.status === 'awaiting_input') {
                this.currentSessionId = data.session_id;

                // Automatically keep microphone open to capture the priority AFTER it finishes speaking
                speakWithStatus(data.tts_prompt, () => {
                    this.start();
                });
                return;
            }

            // Success responses
            this.currentSessionId = null; // Clear session state

            if (data.status === 'success') {
                if (data.intent === 'create_task') {
                    // Update frontend store visually immediately
                    window.Store.state.tasks.unshift(data.task);
                    window.Store.notify(); // Re-render the UI
                } else if (data.intent === 'complete_task') {
                    const idx = window.Store.state.tasks.findIndex(t => t.id === data.task.id);
                    if (idx > -1) {
                        window.Store.state.tasks[idx] = data.task;
                    } else {
                        // Sometimes the task isn't in local RAM but exists in DB
                        window.Store.state.tasks.unshift(data.task);
                    }
                    window.Store.notify(); // Re-render the UI
                }

                await syncUI(); // Force reflow
                if (window.showToast) window.showToast(data.message, 'success');
                speakWithStatus(data.message);
                return;
            }

            // Fallback for unrecognized 
            fail(data.message || "I couldn't process this request.");

        } catch (error) {
            console.error("Voice Engine Error:", error);
            fail("I encountered an error connecting to the AI server.");
        }
    }

    updateHrDashboardTaskWidgets() {
        if (!window.Store || !window.Store.state) return;
        const tasks = window.Store.state.tasks || [];

        const pending = tasks.filter(t => t.status === "pending").length;
        const highPending = tasks.filter(t => t.status === "pending" && t.priority === "high").length;

        const statCard = document.querySelector('.stat-card[data-nav="/hr/tasks"]');
        if (statCard) {
            const pendingEl = statCard.querySelector('h2');
            if (pendingEl) pendingEl.textContent = String(pending);

            const highEl = Array.from(statCard.querySelectorAll('p')).find(p => (p.textContent || '').includes('high priority'));
            if (highEl) highEl.textContent = `${highPending} high priority`;
        }

        const header = Array.from(document.querySelectorAll('.card-header h3'))
            .find(h => (h.textContent || '').trim() === 'Priority Tasks');
        const card = header ? header.closest('.card') : null;
        const listEl = card ? card.querySelector('div[style*="flex-direction: column"]') : null;
        if (!listEl) return;

        const priorityTasks = tasks.filter(t => t.status === 'pending' && t.priority === 'high').slice(0, 3);

        if (priorityTasks.length === 0) {
            listEl.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">No priority tasks. Great job!</p>';
            return;
        }

        listEl.innerHTML = priorityTasks.map(task => {
            const due = task.dueDate || task.date || '';
            return `
                <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 8px; border-left: 3px solid #ef4444;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 0.9rem;">${task.title}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                            ${task.candidate ? `<i class="ph ph-user"></i> ${task.candidate} · ` : ''}Due: ${due}
                        </div>
                    </div>
                    <span style="font-size: 0.7rem; padding: 0.2rem 0.5rem; background: rgba(239, 68, 68, 0.15); color: #ef4444; border-radius: 4px; text-transform: uppercase; font-weight: 600;">High</span>
                </div>
            `;
        }).join('');
    }



    speak(text, onComplete = null) {
        if (!this.synth) {
            if (onComplete) onComplete();
            return;
        }

        const utterThis = new SpeechSynthesisUtterance(text);

        // Try to find a female/pleasant voice
        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Female") || v.name.includes("Google US English") || v.name.includes("Microsoft Zira"));
        if (preferredVoice) utterThis.voice = preferredVoice;

        utterThis.onend = () => {
            this.statusText.textContent = "STANDBY";
            if (onComplete) onComplete();
        };

        this.synth.speak(utterThis);
    }

    summarize(text) {
        alert(`VOXORA SUMMARY:\n\nUser said: "${text}"\n\nAction: Logged.`);
    }
}

// Initialize
window.initVoiceEngine = () => {
    if (window.voiceEngine) return;
    console.log("VoiceEngine: Creating instance...");
    window.voiceEngine = new VoiceEngine();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoiceEngine);
} else {
    initVoiceEngine();
}
