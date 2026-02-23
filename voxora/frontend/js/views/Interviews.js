import { Store } from '../core/store.js';

export default {
    title: "Interview Scheduling",
    subtitle: "Manage upcoming interviews and reviews.",

    view: async () => {
        await Store.initInterviews();

        // Helper to get color for interview type
        const typeColors = { Technical: '#3b82f6', HR: '#f472b6', Final: '#10b981', Screening: '#f59e0b' };

        return `
            <div class="card card-g-12">
                <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
                    <h3>Scheduled Interviews</h3>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap; flex: 1; justify-content: flex-end;">
                        <!-- Search & Filter -->
                        <div style="display: flex; gap: 0.5rem; flex: 1; max-width: 400px;">
                            <input type="text" id="interview-search" placeholder="Search candidate..." style="flex: 1; padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid var(--border-subtle); background: rgba(0,0,0,0.2); color: white;">
                            <select id="interview-filter-type" style="padding: 0.5rem; border-radius: 6px; border: 1px solid var(--border-subtle); background: rgba(0,0,0,0.2); color: white;">
                                <option value="All">All Types</option>
                                <option value="Technical">Technical</option>
                                <option value="HR">HR</option>
                                <option value="Final">Final</option>
                            </select>
                        </div>

                        <div class="btn-group" style="display: flex; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 2px;">
                            <button id="view-list" class="active" style="background: var(--accent-primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">List</button>
                            <button id="view-calendar" style="background: none; color: var(--text-secondary); border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Calendar</button>
                        </div>
                        <button id="btn-schedule-new" class="action-btn" style="width: auto; height: auto; padding: 0.5rem 1rem; flex-direction: row; gap: 0.5rem;">
                            <i class="ph-bold ph-calendar-plus" style="font-size: 1rem;"></i> Schedule New
                        </button>
                    </div>
                </div>

                <div id="interviews-list-container">
                    <!-- Injected via JS -->
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
        let interviews = Store.state.interviews || [];

        // Render Function
        const renderList = () => {
            const search = document.getElementById('interview-search').value.toLowerCase();
            const filterType = document.getElementById('interview-filter-type').value;

            const filtered = interviews.filter(i => {
                const matchesSearch = (i.candidate || '').toLowerCase().includes(search);
                const matchesType = filterType === 'All' || i.interview_type === filterType || i.type === filterType;
                return matchesSearch && matchesType;
            });

            const upcoming = filtered.filter(i => i.status !== 'Completed' && i.status !== 'Cancelled');
            const completed = filtered.filter(i => i.status === 'Completed');

            const generateRow = (i) => {
                const type = i.interview_type || i.type || 'General';
                const time = i.interview_time || i.time;
                const date = i.interview_date ? new Date(i.interview_date).toLocaleDateString() : (i.date || 'Today');
                const status = i.status || 'Scheduled';
                const zoomLink = i.zoom_link;

                // Color Logic
                const typeColors = { Technical: '#3b82f6', HR: '#f472b6', Final: '#10b981', Screening: '#f59e0b' };
                const borderColor = status === 'Completed' ? 'gray' : (typeColors[type] || 'var(--accent-primary)');

                // Debugging
                console.log(`Interview ${i.id}: Status=${status}, Zoom=${zoomLink}`);

                const showZoom = (status.toLowerCase() === 'scheduled') && zoomLink;

                return `
                <div class="interview-row" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-left: 3px solid ${borderColor}; margin-bottom: 0.75rem; border-radius: 4px; transition: background 0.2s;">
                    <div style="display: flex; gap: 1rem; align-items: center; cursor: pointer; flex: 1;" onclick="window.router.navigateTo('/hr/interviews/detail/${i.id}')">
                        <div style="text-align: center; min-width: 80px;">
                            <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">${time}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary);">${date}</div>
                        </div>
                        <div>
                            <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${i.candidate_id || i.candidate}</h4>
                            <p style="font-size: 0.85rem; color: var(--text-secondary);">
                                <span style="color: ${typeColors[type] || 'white'}">${type}</span> • ${status}
                            </p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        ${showZoom ?
                        `<a href="${zoomLink}" target="_blank" class="btn-outline" style="text-decoration: none; padding: 0.4rem 0.8rem; font-size: 0.85rem; color: #3b82f6; border-color: #3b82f6; display: flex; align-items: center; gap: 0.5rem;" title="Join Zoom">
                                <i class="ph-bold ph-video-camera"></i> Join
                             </a>` : ''
                    }
                        
                        ${status.toLowerCase() === 'scheduled' ?
                        `<button class="action-btn" onclick="window.router.navigateTo('/hr/interviews/live/${i.id}')" style="font-size: 0.85rem; padding: 0.4rem 0.8rem; height: auto;" title="Start Analysis">
                                <i class="ph-bold ph-play-circle"></i> Analyze
                             </button>` : ''
                    }

                        ${status === 'Completed' ?
                        `<button class="btn-outline" onclick="window.router.navigateTo('/hr/interviews/report/${i.id}')" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;" title="View Report">
                                <i class="ph-bold ph-file-text"></i> Report
                             </button>` : ''
                    }
                         <button class="btn-reschedule btn-outline" style="font-size: 0.8rem; padding: 0.4rem;" title="Reschedule"><i class="ph ph-arrows-clockwise"></i></button>
                    </div>
                </div>`;
            };

            const html = `
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: var(--text-secondary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="ph-bold ph-clock"></i> Upcoming
                    </h4>
                    ${upcoming.length > 0 ? upcoming.map(generateRow).join('') : '<p style="color: var(--text-muted); font-style: italic;">No upcoming interviews found.</p>'}
                </div>
                
                <div style="margin-top: 2rem;">
                    <h4 style="color: var(--text-secondary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="ph-bold ph-check-circle"></i> Completed
                    </h4>
                    ${completed.length > 0 ? completed.map(generateRow).join('') : '<p style="color: var(--text-muted); font-style: italic;">No completed interviews yet.</p>'}
                </div>
            `;

            document.getElementById('interviews-list-container').innerHTML = html;
        };

        // Initial Render
        renderList();

        // Event Listeners for Search/Filter
        document.getElementById('interview-search').addEventListener('input', renderList);
        document.getElementById('interview-filter-type').addEventListener('change', renderList);

        // Toggle View Logic (List/Calendar)
        const btnList = document.getElementById('view-list');
        const btnCal = document.getElementById('view-calendar');
        const viewList = document.getElementById('interviews-list-container');
        const viewCal = document.getElementById('interviews-calendar-view');

        btnList.addEventListener('click', () => {
            btnList.style.background = 'var(--accent-primary)'; btnList.style.color = 'white';
            btnCal.style.background = 'none'; btnCal.style.color = 'var(--text-secondary)';
            viewList.style.display = 'block'; viewCal.style.display = 'none';
        });

        btnCal.addEventListener('click', () => {
            btnCal.style.background = 'var(--accent-primary)'; btnCal.style.color = 'white';
            btnList.style.background = 'none'; btnList.style.color = 'var(--text-secondary)';
            viewList.style.display = 'none'; viewCal.style.display = 'block';
        });

        // Close Detail Panel
        document.getElementById('close-detail')?.addEventListener('click', () => {
            document.getElementById('interview-detail').style.display = 'none';
        });

        // Schedule New Logic
        document.getElementById('btn-schedule-new').addEventListener('click', () => {
            window.openModal('Schedule New Interview', `
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div>
                        <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Candidate Name</label>
                        <input type="text" id="new-int-candidate" placeholder="Candidate Name" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
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
                            <option value="Technical">Technical</option>
                            <option value="HR">HR Screen</option>
                            <option value="Final">Final Round</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;"><i class="ph-bold ph-video-camera"></i> Zoom Link</label>
                        <input type="text" id="new-int-zoom" placeholder="https://zoom.us/j/..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                    </div>
                    <button id="btn-confirm-new-int" class="action-btn" style="width: 100%; padding: 0.75rem; border-radius: 8px;">
                        <i class="ph-bold ph-calendar-check"></i> Schedule Interview
                    </button>
                </div>
            `);

            setTimeout(() => {
                const confirmBtn = document.getElementById('btn-confirm-new-int');
                if (confirmBtn) {
                    confirmBtn.addEventListener('click', async () => {
                        const candidate = document.getElementById('new-int-candidate').value;
                        const date = document.getElementById('new-int-date').value;
                        const time = document.getElementById('new-int-time').value;
                        const type = document.getElementById('new-int-type').value;
                        const zoom = document.getElementById('new-int-zoom').value;

                        if (!candidate || !date) {
                            if (window.showToast) window.showToast('Please fill in required fields', 'error');
                            return;
                        }

                        // Use API method
                        if (Store.addInterviewApi) {
                            await Store.addInterviewApi({
                                candidate: candidate,
                                date: date,
                                time: time,
                                type: type,
                                zoom_link: zoom,
                                status: 'Scheduled'
                            });
                        } else {
                            // Fallback
                            Store.addInterview({
                                id: Date.now(),
                                candidate: candidate,
                                role: "Applicant",
                                time: time,
                                status: 'Scheduled',
                                type: type,
                                date: date,
                                zoom_link: zoom
                            });
                        }

                        if (window.closeModal) window.closeModal();
                        if (window.showToast) window.showToast('Interview Scheduled Successfully', 'success');

                        // Refresh view
                        if (Store.state) interviews = Store.state.interviews;
                        renderList();
                    });
                }
            }, 100);
        });
    }
};
