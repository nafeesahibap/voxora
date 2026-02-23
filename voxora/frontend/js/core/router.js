export default class Router {
    constructor(routes) {
        this.routes = routes;
        this.contentArea = document.getElementById('hr-dashboard-content');
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        document.body.addEventListener('click', e => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigateTo(e.target.href);
            }
            // Handle nested elements inside links
            const closestLink = e.target.closest('[data-link]');
            if (closestLink && !e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigateTo(closestLink.href);
            }
        });

        // Handle initial load
        this.handleRoute();
    }

    navigateTo(url) {
        history.pushState(null, null, url);
        this.handleRoute();
    }

    async handleRoute() {
        const path = window.location.pathname;
        console.log("Router: Handling route for", path);

        let match = null;

        for (const route of this.routes) {
            const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
            const normalizedRoutePath = route.path.endsWith('/') && route.path.length > 1 ? route.path.slice(0, -1) : route.path;

            // Check for dynamic routes like /candidates/:id
            if (route.path.includes(':')) {
                const routeParts = route.path.split('/');
                const pathParts = path.split('/');

                if (routeParts.length === pathParts.length) {
                    let isMatch = true;
                    let params = {};

                    for (let i = 0; i < routeParts.length; i++) {
                        if (routeParts[i].startsWith(':')) {
                            params[routeParts[i].slice(1)] = pathParts[i];
                        } else if (routeParts[i] !== pathParts[i]) {
                            isMatch = false;
                            break;
                        }
                    }

                    if (isMatch) {
                        match = { route, params };
                        break;
                    }
                }
            } else if (normalizedRoutePath === normalizedPath) {
                match = { route, params: {} };
                break;
            }
        }

        if (!match) {
            console.log("Router: No exact match, checking legacy paths...");
            // Default to dashboard if no match found or root
            if (path === '/' || path === '/dashboard-hr.html') {
                history.replaceState(null, null, '/hr/dashboard');
                return this.handleRoute();
            }
            match = { route: this.routes[0], params: {} }; // Fallback
        }

        console.log("Router: Match found", match.route.path);

        // Update active nav link
        document.querySelectorAll('.nav-item').forEach(link => {
            const href = link.getAttribute('href');
            if (href === match.route.path) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Set View Title
        const pageTitle = document.querySelector('.page-title');
        const pageSubtitle = document.querySelector('.page-subtitle');
        if (pageTitle && match.route.title) pageTitle.textContent = match.route.title;
        if (pageSubtitle && match.route.subtitle) pageSubtitle.textContent = match.route.subtitle;

        // Sidebar Visibility Logic
        const showSidebar = path.startsWith('/hr/');
        if (showSidebar) {
            document.body.classList.remove('layout-fullscreen');
        } else {
            document.body.classList.add('layout-fullscreen');
        }

        // Render View
        try {
            const el = document.getElementById('hr-dashboard-content');
            if (el) {
                el.innerHTML = `<div class="card card-g-12"><div class="card-header"><h3>Initializing View...</h3><p style="color:var(--text-muted)">Stage: Executing ${match.route.title || 'View'}</p></div></div>`;
            }

            console.log("Router: [TRACE] Executing view function for:", path);
            const html = await match.route.view(match.params);

            if (typeof html !== 'string') {
                throw new Error("View function returned " + typeof html + " instead of string.");
            }

            this.contentArea = document.getElementById('hr-dashboard-content');
            if (this.contentArea) {
                console.log("Router: [TRACE] Injecting " + html.length + " chars.");
                this.contentArea.innerHTML = html;
            } else {
                console.error("Router: CRITICAL Error - Content area #hr-dashboard-content NOT FOUND in DOM!");
                // Fallback: try one more time after a tiny delay
                setTimeout(() => {
                    const el = document.getElementById('hr-dashboard-content');
                    if (el) { el.innerHTML = html; console.log("Router: Recovered content area via timeout."); }
                }, 100);
            }

            // Execute any afterRender logic
            if (match.route.afterRender) {
                console.log("Router: Executing afterRender...");
                match.route.afterRender(match.params);
            }
        } catch (error) {
            console.error("Routing Error:", error);
            const el = document.getElementById('hr-dashboard-content');
            if (el) {
                el.innerHTML = `<div class="card card-g-12"><div class="card-header"><h3 style="color:#ef4444">Error Loading View</h3><p>${error.message}</p><small>${error.stack}</small></div></div>`;
            }
        }
    }
}
