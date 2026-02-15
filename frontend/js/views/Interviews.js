import { Store } from '../core/store.js';

export default {
    title: "Interview Scheduling",
    subtitle: "Manage upcoming interviews and reviews.",

    view: () => {
        const renderInterviewCard = (i) => {
            const typeColors = { Technical: '#3b82f6', HR: '#f472b6', Final: '#10b981' };

            return `
                <div class="interview-row" data-id="${i.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-left: 3px solid ${i.status === 'Completed' ? 'gray' : typeColors[i.type] || 'var(--accent-primary)'}; margin-bottom: 0.75rem; border-radius: 4px; cursor: pointer; transition: background 0.2s;">
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <div style="text-align: center; min-width: 60px;">
                            <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">${i.time}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary);">${i.date || 'Today'}</div>
                        </div>
                        <div>
                            <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${i.candidate}</h4>
                            <p style="font-size: 0.85rem; color: var(--text-secondary);">${i.role} • <span style="color: ${typeColors[i.type] || 'white'}">${i.type || 'General'}</span></p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: ${i.status === 'Completed' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)'}; border-radius: 4px; color: ${i.status === 'Completed' ? '#10b981' : 'var(--text-muted)'};">${i.status}</span>
                        <button class="btn-reschedule" data-candidate="${i.candidate}" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;" title="Reschedule"><i class="ph ph-arrows-clockwise"></i></button>
                    </div>
                </div>
            `;
        };

        const upcoming = Store.state.interviews.filter(i => i.status !== 'Completed');
        const completed = Store.state.interviews.filter(i => i.status === 'Completed');

        return `
            <div class="card card-g-12">
                <div class="card-header">
                    <h3>Scheduled Interviews</h3>
                    <div style="display: flex; gap: 1rem;">
                        <div class="btn-group" style="display: flex; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 2px;">
                            <button id="view-list" class="active" style="background: var(--accent-primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">List</button>
                            <button id="view-calendar" style="background: none; color: var(--text-secondary); border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Calendar</button>
                        </div>
                        <button id="btn-schedule-new" class="action-btn" style="width: auto; height: auto; padding: 0.5rem 1rem; flex-direction: row; gap: 0.5rem;">
                            <i class="ph-bold ph-calendar-plus" style="font-size: 1rem;"></i> Schedule New
                        </button>
                    </div>
                </div>

                <div id="interviews-list-view">
                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--text-secondary); margin-bottom: 1rem;">Upcoming</h4>
                        ${upcoming.length > 0 ? upcoming.map(renderInterviewCard).join('') : '<p style="color: var(--text-muted);">No upcoming interviews.</p>'}
                    </div>
                    
                    <div style="margin-top: 2rem;">
                        <h4 style="color: var(--text-secondary); margin-bottom: 1rem;">Completed</h4>
                        ${completed.length > 0 ? completed.map(renderInterviewCard).join('') : '<p style="color: var(--text-muted);">No completed interviews yet.</p>'}
                    </div>
                </div>
                
                <div id="interviews-calendar-view" style="display: none; padding: 2rem; text-align: center; color: var(--text-muted);">
                    <i class="ph ph-calendar" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                    <p>Calendar view coming in next update.</p>
                </div>
            </div>

            <!-- Interview Detail Panel -->
            <div id="interview-detail" class="card card-g-12" style="display: none; margin-top: 1.5rem;">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 id="detail-title">Interview Details</h3>
                    <button id="close-detail" class="btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Close</button>
                </div>
                <div id="detail-body"></div>
            </div>
        `;
    },

    afterRender: () => {
        // Toggle Views
        const btnList = document.getElementById('view-list');
        const btnCal = document.getElementById('view-calendar');
        const viewList = document.getElementById('interviews-list-view');
        const viewCal = document.getElementById('interviews-calendar-view');

        btnList?.addEventListener('click', () => {
            btnList.style.background = 'var(--accent-primary)'; btnList.style.color = 'white';
            btnCal.style.background = 'none'; btnCal.style.color = 'var(--text-secondary)';
            viewList.style.display = 'block'; viewCal.style.display = 'none';
        });

        btnCal?.addEventListener('click', () => {
            btnCal.style.background = 'var(--accent-primary)'; btnCal.style.color = 'white';
            btnList.style.background = 'none'; btnList.style.color = 'var(--text-secondary)';
            viewList.style.display = 'none'; viewCal.style.display = 'block';
        });

        // Reschedule
        document.querySelectorAll('.btn-reschedule').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                showToast(`Reschedule request sent for ${e.currentTarget.dataset.candidate}`, 'info');
            });
        });

        // Interview row click → show detail panel
        document.querySelectorAll('.interview-row').forEach(row => {
            row.addEventListener('click', () => {
                const id = parseInt(row.dataset.id);
                const interview = Store.state.interviews.find(i => i.id === id);
                if (!interview) return;

                const detail = document.getElementById('interview-detail');
                const body = document.getElementById('detail-body');
                const title = document.getElementById('detail-title');

                title.textContent = `Interview: ${interview.candidate}`;
                body.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <p style="font-size: 0.8rem; color: var(--text-secondary);">Candidate</p>
                            <p style="font-weight: 600;">${interview.candidate}</p>
                        </div>
                        <div>
                            <p style="font-size: 0.8rem; color: var(--text-secondary);">Role</p>
                            <p style="font-weight: 600;">${interview.role}</p>
                        </div>
                        <div>
                            <p style="font-size: 0.8rem; color: var(--text-secondary);">Date & Time</p>
                            <p style="font-weight: 600;">${interview.date} at ${interview.time}</p>
                        </div>
                        <div>
                            <p style="font-size: 0.8rem; color: var(--text-secondary);">Type</p>
                            <p style="font-weight: 600;">${interview.type}</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Interview Notes</label>
                        <textarea id="interview-notes" rows="4" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary); resize: vertical; font-family: inherit;" placeholder="Add interview notes here...">${interview.notes || ''}</textarea>
                    </div>

                    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                        <button id="btn-upload-recording" class="btn-outline" style="padding: 0.5rem 1rem; font-size: 0.85rem;"><i class="ph ph-microphone"></i> Upload Recording</button>
                        <button id="btn-gen-summary" class="action-btn" style="width: auto; height: auto; padding: 0.5rem 1rem; flex-direction: row; gap: 0.5rem; font-size: 0.85rem;"><i class="ph ph-magic-wand"></i> Generate Summary</button>
                        <button id="btn-email-summary" class="btn-outline" style="padding: 0.5rem 1rem; font-size: 0.85rem; border-color: #8b5cf6; color: #8b5cf6;"><i class="ph ph-envelope"></i> Email Summary</button>
                        <button id="btn-meeting-brief" class="btn-outline" style="padding: 0.5rem 1rem; font-size: 0.85rem; border-color: #f59e0b; color: #f59e0b;"><i class="ph ph-clipboard-text"></i> Meeting Brief</button>
                    </div>

                    <div id="summary-output" style="display: none;"></div>
                `;

                detail.style.display = 'block';
                detail.scrollIntoView({ behavior: 'smooth' });

                // Upload Recording
                document.getElementById('btn-upload-recording')?.addEventListener('click', () => {
                    showToast('Recording uploaded successfully', 'success');
                });

                // Generate Summary
                document.getElementById('btn-gen-summary')?.addEventListener('click', () => {
                    const btn = document.getElementById('btn-gen-summary');
                    btn.innerHTML = '<i class="ph ph-spinner" style="animation: spin 1s linear infinite;"></i> Generating...';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="ph ph-magic-wand"></i> Generate Summary';
                        document.getElementById('summary-output').style.display = 'block';
                        document.getElementById('summary-output').innerHTML = `
                            <div style="padding: 1rem; background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); border-radius: 8px;">
                                <h4 style="color: #10b981; margin-bottom: 0.75rem;"><i class="ph ph-sparkle"></i> AI-Generated Summary</h4>
                                <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-primary);">
                                    <strong>${interview.candidate}</strong> demonstrated strong technical proficiency during the ${interview.type} interview.
                                    Key strengths include problem-solving skills and clear communication. The candidate showed solid understanding
                                    of the ${interview.role} requirements. Areas for growth include system design at scale.
                                    Overall recommendation: <strong style="color: #10b981;">Proceed to next round</strong>.
                                </p>
                            </div>
                        `;
                        showToast('Interview summary generated', 'success');
                    }, 1500);
                });

                // Email Summary
                document.getElementById('btn-email-summary')?.addEventListener('click', () => {
                    openModal('Send Summary Email', `
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <div>
                                <label style="font-size: 0.85rem; color: var(--text-secondary);">To</label>
                                <input type="text" value="hiring-team@acme.com" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary); margin-top: 0.25rem;">
                            </div>
                            <div style="padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
                                Subject: Interview Summary - ${interview.candidate}<br><br>
                                Hi Team,<br><br>
                                Please find attached the interview summary for ${interview.candidate} (${interview.role})
                                conducted on ${interview.date}.<br><br>
                                The candidate showed strong alignment with our requirements.<br><br>
                                Best,<br>Alex Morgan
                            </div>
                            <button id="btn-send-email" class="action-btn" style="width: 100%; padding: 0.75rem; border-radius: 8px;">
                                <i class="ph ph-paper-plane-tilt"></i> Send Email
                            </button>
                        </div>
                    `);
                    document.getElementById('btn-send-email')?.addEventListener('click', () => {
                        closeModal();
                        showToast('Summary email sent to hiring team', 'success');
                    });
                });

                // Meeting Brief
                document.getElementById('btn-meeting-brief')?.addEventListener('click', () => {
                    openModal('Meeting Brief', `
                        <div style="font-size: 0.9rem; line-height: 1.8; color: var(--text-primary);">
                            <div style="padding: 1rem; background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.2); border-radius: 8px; margin-bottom: 1rem;">
                                <h4 style="color: #f59e0b; margin-bottom: 0.5rem;">📋 Interview Agenda</h4>
                                <strong>Candidate:</strong> ${interview.candidate}<br>
                                <strong>Position:</strong> ${interview.role}<br>
                                <strong>Type:</strong> ${interview.type} Interview<br>
                                <strong>Date:</strong> ${interview.date} at ${interview.time}
                            </div>
                            <ol style="padding-left: 1.25rem; color: var(--text-secondary);">
                                <li style="margin-bottom: 0.5rem;"><strong>Introduction</strong> (5 min) — Brief overview and role expectations</li>
                                <li style="margin-bottom: 0.5rem;"><strong>Technical Assessment</strong> (25 min) — Core competency evaluation</li>
                                <li style="margin-bottom: 0.5rem;"><strong>Behavioral Questions</strong> (15 min) — Culture fit and communication</li>
                                <li style="margin-bottom: 0.5rem;"><strong>Candidate Q&A</strong> (10 min) — Address candidate questions</li>
                                <li style="margin-bottom: 0.5rem;"><strong>Wrap Up</strong> (5 min) — Next steps and timeline</li>
                            </ol>
                        </div>
                    `);
                });
            });
        });

        // Close detail
        document.getElementById('close-detail')?.addEventListener('click', () => {
            document.getElementById('interview-detail').style.display = 'none';
        });

        // Schedule New
        document.getElementById('btn-schedule-new')?.addEventListener('click', () => {
            openModal('Schedule New Interview', `
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div>
                        <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Candidate Name</label>
                        <input type="text" id="new-int-candidate" placeholder="Enter candidate name" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Date</label>
                            <input type="date" id="new-int-date" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                        </div>
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Time</label>
                            <input type="time" id="new-int-time" value="10:00" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                        </div>
                    </div>
                    <div>
                        <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Type</label>
                        <select id="new-int-type" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                            <option>Technical</option>
                            <option>HR</option>
                            <option>Final</option>
                        </select>
                    </div>
                    <button id="btn-confirm-new-int" class="action-btn" style="width: 100%; padding: 0.75rem; border-radius: 8px;">
                        <i class="ph-bold ph-calendar-check"></i> Schedule Interview
                    </button>
                </div>
            `);

            document.getElementById('btn-confirm-new-int')?.addEventListener('click', () => {
                const name = document.getElementById('new-int-candidate').value;
                if (!name) { showToast('Please enter a candidate name', 'error'); return; }

                Store.addInterview({
                    id: Date.now(),
                    candidate: name,
                    role: "Applicant",
                    time: document.getElementById('new-int-time').value || '10:00 AM',
                    status: 'Scheduled',
                    type: document.getElementById('new-int-type').value,
                    date: document.getElementById('new-int-date').value || new Date().toISOString().split('T')[0]
                });
                closeModal();
                showToast(`Interview scheduled for ${name}`, 'success');
                window.router.handleRoute();
            });
        });
    }
};
