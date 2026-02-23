import { Store } from '../core/store.js';

export default {
    title: "Interview Details",
    subtitle: "Manage scheduled interview details and actions.",

    view: async (params) => {
        const id = params.id;
        await Store.initInterviews();
        const interview = Store.state.interviews?.find(i => i.id == id);

        if (!interview) {
            return `<div class="card card-g-12"><p style="padding: 2rem; color: var(--text-secondary);">Interview not found.</p></div>`;
        }

        return `
            <div class="card card-g-12">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3>${interview.candidate}</h3>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            ${interview.role} • <span style="color: var(--accent-primary);">${interview.type}</span>
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">${interview.time}</div>
                        <p style="color: var(--text-secondary); font-size: 0.8rem;">${interview.date || 'Today'}</p>
                    </div>
                </div>

                <div style="padding: 1.5rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                        <div>
                            <h4 style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem;">ACTIONS</h4>
                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                ${interview.status && interview.status.toLowerCase() === 'scheduled' && interview.zoom_link ?
                `<a href="${interview.zoom_link}" target="_blank" class="action-btn" style="text-decoration: none; text-align: center; justify-content: center;">
                                        <i class="ph-bold ph-video-camera"></i> Join Zoom Call
                                     </a>` : ''
            }
                                <button class="btn-outline" onclick="window.router.navigateTo('/hr/interviews/live/${id}')">
                                    <i class="ph-bold ph-play-circle"></i> Start Live Analysis
                                </button>
                                <button class="btn-outline">
                                    <i class="ph ph-envelope"></i> Send Reminder Email
                                </button>
                                <button class="btn-reschedule btn-outline" data-candidate="${interview.candidate}">
                                    <i class="ph ph-arrows-clockwise"></i> Reschedule Interview
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem;">NOTES</h4>
                            <textarea id="interview-notes-detail" rows="8" style="width: 100%; padding: 1rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary); resize: none; font-family: inherit;" placeholder="Pre-interview notes, questions to ask, etc...">${interview.notes || ''}</textarea>
                             <button id="save-notes" class="btn-outline" style="margin-top: 0.5rem; font-size: 0.8rem; padding: 0.4rem 0.8rem;">Save Notes</button>
                        </div>
                    </div>

                    <button class="btn-outline" onclick="window.router.navigateTo('/hr/interviews')" style="width: 100%; border: none; color: var(--text-secondary);">
                        <i class="ph-bold ph-arrow-left"></i> Back to List
                    </button>
                </div>
            </div>
        `;
    },

    afterRender: () => {
        // Reschedule
        document.querySelectorAll('.btn-reschedule').forEach(btn => {
            btn.addEventListener('click', (e) => {
                showToast(`Reschedule request sent for ${e.currentTarget.dataset.candidate}`, 'info');
            });
        });

        document.getElementById('save-notes')?.addEventListener('click', () => {
            showToast('Notes saved successfully', 'success');
        });
    }
};
