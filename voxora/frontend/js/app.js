import Router from './core/router.js';
import Dashboard from './views/Dashboard.js';
import Candidates from './views/Candidates.js';
import CandidateDetails from './views/CandidateDetails.js';
import Tasks from './views/Tasks.js';
import Interviews from './views/Interviews.js';
import Analytics from './views/Analytics.js';
import Sidebar from './components/Sidebar.js';
import CandidateCompare from './views/CandidateCompare.js';
import PublicApply from './views/PublicApply.js';
import LiveAnalysis from './views/LiveAnalysis.js';
import InterviewReport from './views/InterviewReport.js';
import InterviewDetail from './views/InterviewDetail.js';
import { Store } from './core/store.js';

window.Store = Store;

const routes = [
    { path: '/hr/dashboard', view: Dashboard.view, afterRender: Dashboard.afterRender, title: Dashboard.title, subtitle: Dashboard.subtitle },
    { path: '/hr/candidates', view: Candidates.view, afterRender: Candidates.afterRender, title: Candidates.title, subtitle: Candidates.subtitle },
    { path: '/hr/candidates/compare', view: CandidateCompare.view, afterRender: CandidateCompare.afterRender, title: CandidateCompare.title, subtitle: CandidateCompare.subtitle },
    { path: '/hr/candidates/:id', view: CandidateDetails.view, afterRender: CandidateDetails.afterRender, title: CandidateDetails.title, subtitle: CandidateDetails.subtitle },
    { path: '/apply', view: PublicApply.view, afterRender: PublicApply.afterRender, title: PublicApply.title, subtitle: PublicApply.subtitle },
    { path: '/hr/tasks', view: Tasks.view, afterRender: Tasks.afterRender, title: Tasks.title, subtitle: Tasks.subtitle },
    { path: '/hr/interviews', view: Interviews.view, afterRender: Interviews.afterRender, title: Interviews.title, subtitle: Interviews.subtitle },
    { path: '/hr/interviews/detail/:id', view: InterviewDetail.view, afterRender: InterviewDetail.afterRender, title: InterviewDetail.title, subtitle: InterviewDetail.subtitle },
    { path: '/hr/interviews/live/:id', view: LiveAnalysis.view, afterRender: LiveAnalysis.afterRender, title: LiveAnalysis.title, subtitle: LiveAnalysis.subtitle },
    { path: '/hr/interviews/report/:id', view: InterviewReport.view, afterRender: InterviewReport.afterRender, title: InterviewReport.title, subtitle: InterviewReport.subtitle },
    { path: '/hr/analytics', view: Analytics.view, afterRender: Analytics.afterRender, title: Analytics.title, subtitle: Analytics.subtitle },
    { path: '/hr/reports', view: Analytics.view, afterRender: Analytics.afterRender, title: Analytics.title, subtitle: Analytics.subtitle }
];

window.routes = routes;

async function checkNotifications() {
    try {
        const response = await fetch('/api/v1/hr/notifications/');
        if (response.ok) {
            const notifications = await response.json();
            const badge = document.getElementById('notification-badge');
            const bell = document.getElementById('notification-bell');
            if (badge) {
                if (notifications.length > 0) {
                    badge.textContent = notifications.length;
                    badge.style.display = 'block';
                    if (bell) bell.style.color = 'var(--accent-primary)';

                    const lastCount = parseInt(localStorage.getItem('voxora_notif_count') || '0');
                    if (notifications.length > lastCount) {
                        const latest = notifications[0];
                        if (window.showToast) window.showToast(latest.message, 'info');
                        // Optional: Play a subtle notification sound
                    }
                    localStorage.setItem('voxora_notif_count', notifications.length);
                } else {
                    badge.style.display = 'none';
                    if (bell) bell.style.color = 'var(--text-secondary)';
                    localStorage.setItem('voxora_notif_count', '0');
                }
            }
        }
    } catch (err) {
        console.warn("Notification poll failed:", err);
    }
}

function initNotificationUI() {
    const bell = document.getElementById('notification-bell');
    if (bell) {
        bell.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/v1/hr/notifications/mark-read/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ all: true })
                });
                if (response.ok) {
                    const badge = document.getElementById('notification-badge');
                    if (badge) badge.style.display = 'none';
                    bell.style.color = 'var(--text-secondary)';
                    localStorage.setItem('voxora_notif_count', '0');
                    if (window.showToast) window.showToast("Cleared all notifications", "success");
                }
            } catch (err) {
                console.error("Mark read error:", err);
            }
        });
    }

    // Initial check and start poll
    checkNotifications();
    setInterval(checkNotifications, 30000); // 30 seconds
}

function initApp() {
    if (window.appInitialized) return;
    window.appInitialized = true;
    console.log("App: Initializing...");

    try {
        window.router = new Router(routes);
        new Sidebar();
        initNotificationUI();
        Store.initTasks();
        Store.initInterviews();
        console.log("App: Ready.");
    } catch (err) {
        console.error("App Init Error:", err);
        const el = document.getElementById('hr-dashboard-content');
        if (el) el.innerHTML = `<div class="card card-g-12"><h3 style="color:#ef4444">Init Error</h3><p>${err.message}</p></div>`;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
