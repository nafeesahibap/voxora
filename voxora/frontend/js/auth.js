function login(email) {
    // Simulate API call
    localStorage.setItem('voxora_user', JSON.stringify({ email: email, loggedIn: true }));
    window.location.href = 'dashboard.html';
}

function logout() {
    localStorage.removeItem('voxora_user');
    window.location.href = 'index.html';
}

function checkAuthRoutes() {
    const user = localStorage.getItem('voxora_user');
    const path = window.location.pathname;

    // Protected Routes
    if (path.includes('dashboard.html') || path.includes('calls.html')) {
        if (!user) {
            window.location.href = 'index.html'; // Redirect to Landing Page
        }
    }
}

// Run immediately
checkAuthRoutes();

// Handle Login Form
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button');
            const email = document.getElementById('email').value;

            // Loading state
            if (btn) btn.innerHTML = '<i class="ph-duotone ph-spinner-gap" style="animation:spin 1s infinite"></i> Verifying...';

            setTimeout(() => {
                login(email);
            }, 1000);
        });
    }

    // FORCE LOGOUT on Landing Page to ensure full demo flow (Entry -> Login -> Dashboard)
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        localStorage.removeItem('voxora_user');
        // Reset buttons to default state just in case
        const signinBtns = document.querySelectorAll('.btn-enter, .btn-secondary-outline');
        signinBtns.forEach(btn => {
            if (btn.textContent.includes('Back to Dashboard')) {
                btn.textContent = 'Sign In';
                btn.href = 'login.html';
            }
        });
    }
});
