import { Store } from '../core/store.js';

export default {
    title: "Analytics & Reports",
    subtitle: "Hiring performance and funnel metrics.",

    view: async () => {
        await Promise.all([
            Store.initTasks(),
            Store.initInterviews()
        ]);
        const candidates = Store.state.candidates || [];
        const interviews = Store.state.interviews || [];
        const tasks = Store.state.tasks || [];

        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const totalTasks = tasks.length;
        const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const completedInterviews = interviews.filter(i => i.status === 'Completed').length;
        const totalInterviews = interviews.length;
        const interviewRate = totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0;

        const renderBar = (label, value, height, color) => `
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 0.5rem; height: 200px;">
                <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary);">${value}</span>
                <div style="width: 40px; height: ${height}%; background: ${color}; border-radius: 4px 4px 0 0; opacity: 0.9; transition: height 1s ease-out;"></div>
                <span style="font-size: 0.75rem; color: var(--text-secondary); text-align: center;">${label}</span>
            </div>
        `;

        return `
            <!-- KPI Cards -->
            <div class="dashboard-grid" style="margin-bottom: 1.5rem;">
                <div class="card card-g-3" style="padding: 1.25rem;">
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">Time to Hire</p>
                    <h2 style="font-size: 2rem; color: var(--text-primary); margin: 0.25rem 0;">24 Days</h2>
                    <span style="color: #10b981; font-size: 0.8rem;">↓ 2 days from last month</span>
                </div>
                <div class="card card-g-3" style="padding: 1.25rem;">
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">Offer Acceptance</p>
                    <h2 style="font-size: 2rem; color: var(--text-primary); margin: 0.25rem 0;">85%</h2>
                    <span style="color: #10b981; font-size: 0.8rem;">↑ 5% from last month</span>
                </div>
                <div class="card card-g-3" style="padding: 1.25rem;">
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">Task Completion</p>
                    <h2 style="font-size: 2rem; color: var(--text-primary); margin: 0.25rem 0;">${taskRate}%</h2>
                    <span style="color: var(--text-muted); font-size: 0.8rem;">${completedTasks} of ${totalTasks} tasks</span>
                </div>
                <div class="card card-g-3" style="padding: 1.25rem;">
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">Interview Completion</p>
                    <h2 style="font-size: 2rem; color: var(--text-primary); margin: 0.25rem 0;">${interviewRate}%</h2>
                    <span style="color: var(--text-muted); font-size: 0.8rem;">${completedInterviews} of ${totalInterviews} interviews</span>
                </div>
            </div>

            <div class="dashboard-grid">
                <!-- Hiring Funnel -->
                <div class="card card-g-8">
                    <div class="card-header">
                        <h3>Hiring Funnel</h3>
                    </div>
                    <div style="padding: 1rem 0;">
                        <canvas id="funnel-chart" height="250"></canvas>
                    </div>
                </div>

                <!-- Pipeline Breakdown -->
                <div class="card card-g-4">
                    <div class="card-header">
                        <h3>Pipeline Breakdown</h3>
                    </div>
                    <div style="padding: 1rem 0;">
                        <canvas id="pipeline-chart" height="250"></canvas>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid" style="margin-top: 1.5rem;">
                <!-- Monthly Trend -->
                <div class="card card-g-6">
                    <div class="card-header">
                        <h3>Monthly Hiring Trend</h3>
                    </div>
                    <div style="padding: 1rem 0;">
                        <canvas id="trend-chart" height="200"></canvas>
                    </div>
                </div>

                <!-- Task Completion -->
                <div class="card card-g-6">
                    <div class="card-header">
                        <h3>Task Completion Rate</h3>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: center; padding: 2rem;">
                        <div style="position: relative; width: 180px; height: 180px;">
                            <canvas id="task-donut" width="180" height="180"></canvas>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                                <span style="font-size: 2rem; font-weight: 700; color: var(--text-primary);">${taskRate}%</span>
                                <p style="font-size: 0.75rem; color: var(--text-secondary);">Complete</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender: () => {
        // Funnel Chart
        const funnelCtx = document.getElementById('funnel-chart');
        if (funnelCtx && typeof Chart !== 'undefined') {
            new Chart(funnelCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'],
                    datasets: [{
                        label: 'Candidates',
                        data: [120, 45, 18, 8, 6],
                        backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4'],
                        borderRadius: 6,
                        barThickness: 40
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
                        x: { grid: { display: false }, ticks: { color: '#888' } }
                    }
                }
            });
        }

        // Pipeline Doughnut
        const pipeCtx = document.getElementById('pipeline-chart');
        if (pipeCtx && typeof Chart !== 'undefined') {
            new Chart(pipeCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'],
                    datasets: [{
                        data: [51, 20, 15, 8, 6],
                        backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#888', padding: 12, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } }
                        }
                    }
                }
            });
        }

        // Monthly Trend
        const trendCtx = document.getElementById('trend-chart');
        if (trendCtx && typeof Chart !== 'undefined') {
            new Chart(trendCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Hires',
                        data: [4, 6, 3, 8, 5, 7],
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#06b6d4'
                    }, {
                        label: 'Applications',
                        data: [20, 28, 15, 35, 22, 30],
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.05)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#8b5cf6'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: { color: '#888', usePointStyle: true, font: { size: 11 } }
                        }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
                        x: { grid: { display: false }, ticks: { color: '#888' } }
                    }
                }
            });
        }

        // Task Donut
        const tasks = Store.state.tasks || [];
        const completed = tasks.filter(t => t.status === 'completed').length;
        const pending = tasks.length - completed;
        const taskCtx = document.getElementById('task-donut');
        if (taskCtx && typeof Chart !== 'undefined') {
            new Chart(taskCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'Pending'],
                    datasets: [{
                        data: [completed, pending],
                        backgroundColor: ['#10b981', 'rgba(255,255,255,0.1)'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: false,
                    cutout: '75%',
                    plugins: { legend: { display: false } }
                }
            });
        }
    }
};
