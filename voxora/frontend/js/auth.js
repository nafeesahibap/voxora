const ROLES = {
    BUSINESS: 'business',
    HR: 'hr',
    PERSONAL: 'personal'
};

const DASHBOARDS = {
    [ROLES.BUSINESS]: 'dashboard.html',
    [ROLES.HR]: 'dashboard-hr.html',
    [ROLES.PERSONAL]: 'dashboard-personal.html'
};

function login(email) {
    let storedUser = JSON.parse(localStorage.getItem('voxora_user_data') || '{}');
    let role = storedUser.role || ROLES.BUSINESS;

    const user = {
        email: email,
        role: role,
        loggedIn: true
    };

    localStorage.setItem('voxora_user', JSON.stringify(user));
    window.location.href = DASHBOARDS[role];
}

function register(name, email, role) {
    const user = {
        name: name,
        email: email,
        role: role,
        loggedIn: true
    };

    localStorage.setItem('voxora_user', JSON.stringify(user));
    localStorage.setItem('voxora_user_data', JSON.stringify(user));
    window.location.href = DASHBOARDS[role];
}

function logout() {
    localStorage.removeItem('voxora_user');
    window.location.href = 'index.html';
}

function checkAuthRoutes() {
    const userJson = localStorage.getItem('voxora_user');
    let user = userJson ? JSON.parse(userJson) : null;
    const path = window.location.pathname;

    // Auto-seed HR user for SPA routes (demo mode - user said no login needed)
    if (!user && (path.startsWith('/hr/') || path.includes('dashboard-hr'))) {
        user = {
            name: 'Alex Morgan',
            email: 'alex@voxora.com',
            role: ROLES.HR,
            loggedIn: true
        };
        localStorage.setItem('voxora_user', JSON.stringify(user));
        localStorage.setItem('voxora_user_data', JSON.stringify(user));
        console.log('Auth: Auto-seeded HR demo user.');
    }

    // /apply is PUBLIC - no auth needed
    if (path === '/apply') {
        return; // Allow unauthenticated access
    }

    // List of protected pages
    const protectedPages = [
        'dashboard.html',
        'dashboard-hr.html',
        'dashboard-personal.html',
        'calls.html'
    ];

    const isProtected = protectedPages.some(page => path.includes(page)) ||
        path.startsWith('/hr/');

    if (isProtected) {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
    }
}

// Run immediately
checkAuthRoutes();

// Handle DOM Events
document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button');
            const email = document.getElementById('email').value;

            if (btn) btn.innerHTML = '<i class="ph-duotone ph-spinner-gap" style="animation:spin 1s infinite"></i> Verifying...';

            setTimeout(() => {
                login(email);
            }, 1000);
        });
    }

    // 2. Handle Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = registerForm.querySelector('button[type="submit"]');
            const name = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const role = document.getElementById('selectedRole').value;

            if (!role) {
                alert("Please select a role to continue.");
                return;
            }

            if (btn) btn.innerHTML = '<i class="ph-duotone ph-spinner-gap" style="animation:spin 1s infinite"></i> Creating Workspace...';

            setTimeout(() => {
                register(name, email, role);
            }, 1500);
        });
    }

    // 3. Handle Logout Button
    const logoutBtn = document.querySelector('a[href="/index.html"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});
