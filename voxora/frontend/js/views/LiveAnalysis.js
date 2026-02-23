import { Store } from '../core/store.js';

export default {
    title: "Live Interview Analysis",
    subtitle: "Real-time AI insights, transcription, and scoring.",

    view: async (params) => {
        const id = params.id;
        const interview = Store.state.interviews?.find(i => i.id == id) || { candidate: "Unknown", role: "Applicant" };

        // Mock connection status
        setTimeout(() => {
            const status = document.getElementById('connection-status');
            if (status) status.innerHTML = '<span style="color: #10b981; display: flex; align-items: center; gap: 0.5rem;"><i class="ph-fill ph-circle"></i> Connected to Zoom Audio</span>';
        }, 2000);

        return `
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; height: calc(100vh - 180px);">
                <!-- Left: Video & Transcript -->
                <div style="display: flex; flex-direction: column; gap: 1rem; height: 100%;">
                    <!-- Video Placeholder -->
                    <div class="card" style="flex: 2; background: #000; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; border-radius: 12px;">
                        <img src="/assets/avatar.png" style="opacity: 0.3; width: 100px;">
                        <div style="position: absolute; bottom: 1rem; left: 1rem; background: rgba(0,0,0,0.6); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; color: white;">
                            <i class="ph-fill ph-video-camera"></i> ${interview.candidate}
                        </div>
                        <div style="position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem;">
                             <div id="connection-status" style="background: rgba(0,0,0,0.6); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; color: orange;">
                                <i class="ph ph-spinner ph-spin"></i> Connecting...
                            </div>
                        </div>
                    </div>

                    <!-- Live Transcript -->
                    <div class="card card-g-12" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                        <div class="card-header" style="padding: 0.75rem 1.5rem; border-bottom: 1px solid var(--border-subtle);">
                            <h4 style="font-size: 0.9rem; color: var(--text-secondary);"><i class="ph-bold ph-chats"></i> Live Transcription</h4>
                        </div>
                        <div id="transcript-container" style="flex: 1; overflow-y: auto; padding: 1rem; font-size: 0.9rem; line-height: 1.6; color: var(--text-primary);">
                            <p style="color: var(--text-muted); font-style: italic;">Waiting for speech...</p>
                        </div>
                    </div>
                </div>

                <!-- Right: AI Insights & Controls -->
                <div style="display: flex; flex-direction: column; gap: 1rem; height: 100%; overflow-y: auto;">
                    <!-- Controls -->
                    <div class="card card-g-12" style="padding: 1rem;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                             <button class="action-btn" onclick="window.addBookmark()" style="background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa;">
                                <i class="ph-bold ph-bookmark-simple"></i> Bookmark
                             </button>
                             <button class="action-btn" onclick="window.flagMoment()" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;">
                                <i class="ph-bold ph-flag"></i> Flag
                             </button>
                        </div>
                        <button class="action-btn" onclick="window.endInterview(${id})" style="margin-top: 0.75rem; background: var(--accent-primary); color: white;">
                            End Interview & Generate Report
                        </button>
                    </div>

                    <!-- Live Sentiment -->
                    <div class="card card-g-12">
                        <div class="card-header">
                            <h4>Sentiment Analysis</h4>
                        </div>
                        <div style="padding: 1rem; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700; color: #10b981;">Positive</div>
                            <p style="color: var(--text-secondary); font-size: 0.85rem;">Confidence match with requirements</p>
                            <div style="margin-top: 1rem; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; display: flex;">
                                <div style="width: 70%; background: #10b981;"></div>
                                <div style="width: 20%; background: #f59e0b;"></div>
                                <div style="width: 10%; background: #ef4444;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-top: 0.5rem;">
                                <span>Pos</span><span>Neu</span><span>Neg</span>
                            </div>
                        </div>
                    </div>

                    <!-- Suggested Questions -->
                    <div class="card card-g-12" style="flex: 1;">
                        <div class="card-header">
                            <h4><i class="ph-bold ph-sparkle"></i> AI Suggested Questions</h4>
                        </div>
                        <div style="padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
                            <div class="suggestion-card" style="padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 0.85rem; border-left: 2px solid #8b5cf6;">
                                "Can you elaborate on your experience with scaling databases?"
                            </div>
                            <div class="suggestion-card" style="padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 0.85rem; border-left: 2px solid #8b5cf6;">
                                "How do you handle conflicting priorities in a sprint?"
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender: () => {
        // Mock Transcription Loop
        const lines = [
            "Hello, thank you for joining.",
            "I'm excited to be here!",
            "Could you tell me a bit about your background?",
            "Sure, I've been working as a Full Stack Developer for 5 years...",
            "Mostly with React and Node.js ecosystems.",
            "That sounds great. What was your most challenging project?",
            "We had to migrate a legacy monolith to microservices...",
            "It required a lot of coordination and planning."
        ];

        let index = 0;
        const container = document.getElementById('transcript-container');

        if (container) {
            const interval = setInterval(() => {
                if (index < lines.length) {
                    const p = document.createElement('p');
                    p.style.marginBottom = '0.5rem';
                    p.innerHTML = `<span style="color: ${index % 2 === 0 ? '#60a5fa' : '#34d399'}; font-weight: 600;">${index % 2 === 0 ? 'Interviewer' : 'Candidate'}:</span> ${lines[index]}`;
                    container.appendChild(p);
                    container.scrollTop = container.scrollHeight;
                    index++;
                }
            }, 3000);

            // Clean up interval on navigation away - rudimentary check
            window.activeIntervals = window.activeIntervals || [];
            window.activeIntervals.push(interval);
        }

        window.addBookmark = () => {
            window.showToast("Moment Bookmarked", "info");
        };

        window.flagMoment = () => {
            window.showToast("Moment Flagged for Review", "error");
        };

        window.endInterview = (id) => {
            if (confirm("End interview and generate report?")) {
                // Update status in store (mock)
                const interview = Store.state.interviews?.find(i => i.id == id);
                if (interview) {
                    interview.status = 'Completed';
                    Store.notify(); // Persist simple change
                }

                window.showToast("Generating Report...", "success");
                setTimeout(() => {
                    window.router.navigateTo(`/hr/interviews/report/${id}`);
                }, 1500);
            }
        };
    }
};
