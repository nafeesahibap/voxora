import { Store } from '../core/store.js';

export default {
    title: "Human Resources Overview",
    subtitle: "Welcome back, Alex. Here's what's happening today.",

    view: async () => {
        // Initial fetch to ensure real-time data
        await Store.initTasks();

        const candidates = Store.state.candidates || [];
        const tasks = Store.state.tasks || [];
        const interviews = Store.state.interviews || [];

        const activeCandidates = candidates.length;
        const interviewsToday = interviews.filter(i => i.status === 'Scheduled').length;
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        const openPositions = 8;

        const pipeline = {
            screening: candidates.filter(c => c.status === 'screening' || c.stage === 'screening').length,
            interview: candidates.filter(c => c.status === 'interview' || c.stage === 'interview').length,
            offer: candidates.filter(c => c.status === 'offer' || c.stage === 'offer').length,
            hired: candidates.filter(c => c.status === 'hired' || c.stage === 'hired').length
        };

        const priorityTasks = tasks.filter(t => t.status === 'pending' && t.priority === 'high').slice(0, 3);
        const pipelineTotal = Math.max(activeCandidates, 1);

        return `
            <!-- Stat Cards -->
            <div class="dashboard-grid" style="margin-bottom: 2rem;">
                <div class="card card-g-3 stat-card" data-nav="/hr/candidates" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <p style="color: var(--text-secondary); font-size: 0.85rem;">Active Candidates</p>
                            <h2 style="font-size: 2rem; font-weight: 700;">${activeCandidates}</h2>
                        </div>
                        <i class="ph-fill ph-users" style="font-size: 1.75rem; color: var(--accent-primary); opacity: 0.7;"></i>
                    </div>
                    <p style="font-size: 0.75rem; color: #10b981; margin-top: 0.5rem;">↑ 12% from last month</p>
                </div>
                <div class="card card-g-3 stat-card" data-nav="/hr/interviews" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <p style="color: var(--text-secondary); font-size: 0.85rem;">Interviews Today</p>
                            <h2 style="font-size: 2rem; font-weight: 700;">${interviewsToday}</h2>
                        </div>
                        <i class="ph-fill ph-chats-circle" style="font-size: 1.75rem; color: #8b5cf6; opacity: 0.7;"></i>
                    </div>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">${interviews.length} total scheduled</p>
                </div>
                <div class="card card-g-3 stat-card" data-nav="/hr/tasks" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <p style="color: var(--text-secondary); font-size: 0.85rem;">Pending Tasks</p>
                            <h2 style="font-size: 2rem; font-weight: 700;">${pendingTasks}</h2>
                        </div>
                        <i class="ph-fill ph-check-square" style="font-size: 1.75rem; color: #f59e0b; opacity: 0.7;"></i>
                    </div>
                    <p style="font-size: 0.75rem; color: #f59e0b; margin-top: 0.5rem;">${tasks.filter(t => t.priority === 'high' && t.status === 'pending').length} high priority</p>
                </div>
                <div class="card card-g-3 stat-card" data-nav="/hr/analytics" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <p style="color: var(--text-secondary); font-size: 0.85rem;">Open Positions</p>
                            <h2 style="font-size: 2rem; font-weight: 700;">${openPositions}</h2>
                        </div>
                        <i class="ph-fill ph-briefcase" style="font-size: 1.75rem; color: #10b981; opacity: 0.7;"></i>
                    </div>
                    <p style="font-size: 0.75rem; color: #10b981; margin-top: 0.5rem;">3 roles closing soon</p>
                </div>
            </div>

            <div class="dashboard-grid">
                <!-- Priority Tasks Preview -->
                <div class="card card-g-6">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>Priority Tasks</h3>
                        <button class="btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="window.router.navigateTo('/hr/tasks')">View All</button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem;">
                        ${priorityTasks.length > 0 ? priorityTasks.map(task => `
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 8px; border-left: 3px solid #ef4444;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; font-size: 0.9rem;">${task.title}</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                                        ${task.candidate ? `<i class="ph ph-user"></i> ${task.candidate} · ` : ''}Due: ${task.dueDate}
                                    </div>
                                </div>
                                <span style="font-size: 0.7rem; padding: 0.2rem 0.5rem; background: rgba(239, 68, 68, 0.15); color: #ef4444; border-radius: 4px; text-transform: uppercase; font-weight: 600;">High</span>
                            </div>
                        `).join('') : '<p style="color: var(--text-muted); padding: 1rem;">No priority tasks. Great job!</p>'}
                    </div>
                </div>

                <!-- Recent Applications (Public Links) -->
                <div class="card card-g-6">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>Recent Public Applications</h3>
                        <span style="font-size: 0.75rem; background: rgba(139, 92, 246, 0.1); color: #8b5cf6; padding: 2px 8px; border-radius: 4px; font-weight: 600;">NEW</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem;">
                        ${(() => {
                const today = new Date().toISOString().split('T')[0];
                const recentApps = candidates.filter(c =>
                    (c.source === 'public_link' || c.appliedViaLink) &&
                    (c.lastUpdated === today)
                ).slice(0, 3);

                if (recentApps.length > 0) {
                    return recentApps.map(c => `
                                    <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: rgba(139, 92, 246, 0.03); border: 1px solid rgba(139, 92, 246, 0.1); border-radius: 8px;">
                                        <div style="width: 32px; height: 32px; border-radius: 50%; background: #8b5cf6; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.8rem;">
                                            ${c.name.charAt(0)}
                                        </div>
                                        <div style="flex: 1;">
                                            <div style="font-weight: 600; font-size: 0.9rem;">${c.name}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-secondary);">${c.role} · <span style="color:#8b5cf6">via Link</span></div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-weight: 700; color: ${c.matchScore >= 80 ? '#10b981' : '#f59e0b'}; font-size: 0.9rem;">${c.matchScore}%</div>
                                            <div style="font-size: 0.65rem; color: var(--text-muted);">Match</div>
                                        </div>
                                    </div>
                                `).join('');
                }
                return '<p style="color: var(--text-muted); padding: 1rem;">No recent applications today.</p>';
            })()}
                    </div>
                </div>

                <!-- Recruitment Pipeline -->
                <div class="card card-g-6">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>Recruitment Pipeline</h3>
                        <button class="btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="window.router.navigateTo('/hr/analytics')">Analytics</button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem;">
                        ${[
                { label: 'Applied', count: activeCandidates - pipeline.screening - pipeline.interview - pipeline.offer - pipeline.hired, color: '#3b82f6' },
                { label: 'Screening', count: pipeline.screening, color: '#8b5cf6' },
                { label: 'Interview', count: pipeline.interview, color: '#f59e0b' },
                { label: 'Offer', count: pipeline.offer, color: '#10b981' },
                { label: 'Hired', count: pipeline.hired, color: '#06b6d4' }
            ].map(stage => `
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div style="width: 80px; font-size: 0.85rem; color: var(--text-secondary);">${stage.label}</div>
                                <div style="flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                                    <div style="width: ${Math.max((stage.count / pipelineTotal) * 100, 5)}%; height: 100%; background: ${stage.color}; border-radius: 4px; transition: width 0.8s ease-out;"></div>
                                </div>
                                <span style="font-weight: 600; font-size: 0.85rem; min-width: 20px; text-align: right;">${stage.count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- System Links -->
            <div class="dashboard-grid" style="margin-top: 2rem;">
                <div class="card card-g-6">
                    <div class="card-header"><h3>Quick Actions</h3></div>
                    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.5rem;">
                        <button class="action-btn" style="width:auto; height:auto; padding:0.6rem 1.25rem; flex-direction: row; gap: 0.5rem;" onclick="window.router.navigateTo('/hr/candidates')">
                            <i class="ph-bold ph-users"></i> Manage Candidates
                        </button>
                        <button class="btn-outline" style="font-size: 0.85rem; padding: 0.6rem 1.25rem;" onclick="window.router.navigateTo('/hr/tasks')">
                            <i class="ph ph-check-square"></i> Review Tasks
                        </button>
                        <button class="btn-outline" style="font-size: 0.85rem; padding: 0.6rem 1.25rem;" onclick="window.router.navigateTo('/hr/interviews')">
                            <i class="ph ph-calendar"></i> Schedule Interview
                        </button>
                    </div>
                </div>
                <div class="card card-g-6">
                    <div class="card-header"><h3>System Links</h3></div>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem;">
                        <div style="padding: 0.75rem; background: rgba(6, 182, 212, 0.05); border-radius: 8px; border: 1px solid var(--accent-primary);">
                            <div style="font-size: 0.75rem; color: var(--accent-primary); font-weight: 600; text-transform: uppercase;">Internal Dashboard</div>
                            <div style="font-family: monospace; font-size: 0.85rem; margin-top: 0.25rem;">${window.location.origin}/hr/dashboard</div>
                        </div>
                        <div style="padding: 0.75rem; background: rgba(139, 92, 246, 0.05); border-radius: 8px; border: 1px solid #8b5cf6;">
                            <div style="font-size: 0.75rem; color: #8b5cf6; font-weight: 600; text-transform: uppercase;">Public Apply Link</div>
                            <div style="font-family: monospace; font-size: 0.85rem; margin-top: 0.25rem;">${window.location.origin}/apply</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender: () => {
        // Clickable stat cards
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', () => {
                const nav = card.dataset.nav;
                if (nav) window.router.navigateTo(nav);
            });
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
                card.style.boxShadow = '0 8px 25px rgba(6, 182, 212, 0.15)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        });
    }
};
