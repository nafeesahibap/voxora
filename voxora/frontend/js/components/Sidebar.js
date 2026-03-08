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
        if (window.voiceEngine) {
            window.voiceEngine.toggle();
        } else {
            console.warn("voiceEngine not found, attempting to initialize...");
            if (typeof initVoiceEngine === 'function') initVoiceEngine();
            if (window.voiceEngine) window.voiceEngine.toggle();
        }
    }

    // handleVoiceCommand moved to voice_engine.js
    async handleVoiceCommand(transcript) {
        console.warn("Sidebar handleVoiceCommand is deprecated. Use voiceEngine.processInput.");
    }
}
