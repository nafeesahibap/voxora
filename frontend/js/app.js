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
    { path: '/hr/analytics', view: Analytics.view, afterRender: Analytics.afterRender, title: Analytics.title, subtitle: Analytics.subtitle },
    { path: '/hr/reports', view: Analytics.view, afterRender: Analytics.afterRender, title: Analytics.title, subtitle: Analytics.subtitle }
];

window.routes = routes;

function initApp() {
    if (window.appInitialized) return;
    window.appInitialized = true;
    console.log("App: Initializing...");

    try {
        window.router = new Router(routes);
        new Sidebar();
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
