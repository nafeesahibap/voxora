// Personal Productivity Dashboard Logic

// --- Mock Data ---
const PERSONAL_DATA = {
    stats: {
        completed: 8,
        pending: 4,
        productivity: 85
    },
    tasks: [
        { id: 1, title: "Morning Standup", time: "09:00 AM", done: true },
        { id: 2, title: "Review Q3 Report", time: "10:30 AM", done: true },
        { id: 3, title: "Client Call with Apex", time: "02:00 PM", done: false },
        { id: 4, title: "Update Project Timeline", time: "04:00 PM", done: false },
        { id: 5, title: "Email Weekly Summary", time: "05:00 PM", done: false }
    ],
    insights: {
        weekly: [65, 75, 80, 85, 70, 90, 85], // Mon-Sun
        alerts: ["Missed 'Team Sync' on Tuesday", "Consistent progress this week!"]
    }
};

// --- DOM Elements ---
const contentArea = document.getElementById('personal-dashboard-content');
const pageTitle = document.querySelector('.page-title');
const pageSubtitle = document.querySelector('.page-subtitle');
const navItems = document.querySelectorAll('.nav-item');

// --- Navigation Handler ---
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();

        // Update Active State
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Render Content based on ID
        const viewId = item.id;
        switch (viewId) {
            case 'nav-dashboard':
                renderDashboard();
                break;
            case 'nav-tasks':
                renderTasksView();
                break;
            case 'nav-calendar':
                renderCalendar();
                break;
            case 'nav-insights':
                renderInsights();
                break;
            case 'nav-settings':
                renderSettings();
                break;
            default:
                renderDashboard();
        }
    });
});

// --- Render Functions ---

function renderDashboard() {
    pageTitle.textContent = "My Day";
    pageSubtitle.textContent = "Stay focused and productive.";

    contentArea.innerHTML = `
        <!-- Top Stats -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; width: 100%; margin-bottom: 2rem;">
            <div class="card" style="text-align: center; padding: 2rem;">
                 <h2 style="font-size: 2.5rem; color: #10b981; margin-bottom: 0.5rem;">${PERSONAL_DATA.stats.completed}</h2>
                 <p style="color: var(--text-secondary);">Tasks Completed</p>
            </div>
             <div class="card" style="text-align: center; padding: 2rem;">
                 <h2 style="font-size: 2.5rem; color: var(--accent-primary); margin-bottom: 0.5rem;">${PERSONAL_DATA.stats.pending}</h2>
                 <p style="color: var(--text-secondary);">Pending Tasks</p>
            </div>
             <div class="card" style="text-align: center; padding: 2rem; position: relative; overflow: hidden;">
                 <div style="position: absolute; top:0; left:0; width: 100%; height: 5px; background: linear-gradient(90deg, var(--accent-secondary), var(--accent-primary));"></div>
                 <h2 style="font-size: 2.5rem; color: white; margin-bottom: 0.5rem;">${PERSONAL_DATA.stats.productivity}%</h2>
                 <p style="color: var(--text-secondary);">Productivity Score</p>
            </div>
        </div>

        <div class="dashboard-grid">
            <!-- Today's Schedule -->
            <div class="card card-g-6">
                <div class="card-header">
                    <h3>Today's Schedule</h3>
                    <button class="btn-outline" style="width: auto; padding: 0.25rem 0.75rem;" onclick="renderCalendar()">Full Calendar</button>
                </div>
                 <div class="schedule-list">
                    ${PERSONAL_DATA.tasks.map(t => `
                    <div class="schedule-item" style="opacity: ${t.done ? 0.5 : 1}">
                        <div class="schedule-time">${t.time}</div>
                        <div class="schedule-info">
                            <h4 style="text-decoration: ${t.done ? 'line-through' : 'none'}">${t.title}</h4>
                            <p>${t.done ? 'Completed' : 'Upcoming'}</p>
                        </div>
                         <div style="margin-left: auto;">
                            <!-- Checkbox mock -->
                            <div onclick="toggleTask(${t.id})" style="width: 24px; height: 24px; border: 2px solid ${t.done ? '#10b981' : 'var(--text-muted)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                                ${t.done ? '<i class="ph-bold ph-check" style="color: #10b981"></i>' : ''}
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>

            <!-- Voice Trigger Actions -->
            <div class="card card-g-6">
                <div class="card-header">
                    <h3>Voice Commands</h3>
                    <i class="ph-fill ph-microphone" style="color: var(--accent-primary);"></i>
                </div>
                
                <div style="display: grid; gap: 1rem;">
                    <button class="btn-full" onclick="simulateVoiceAction('Adding new task...')" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: rgba(59, 130, 246, 0.1); border: 1px solid var(--accent-primary); color: var(--accent-primary);">
                        <i class="ph-bold ph-plus-circle"></i> Add Task via Voice
                    </button>
                    
                    <button class="btn-full" onclick="simulateVoiceAction('Updating task status...')" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981;">
                        <i class="ph-bold ph-check-circle"></i> Update Status via Voice
                    </button>

                    <button class="btn-full" onclick="simulateVoiceAction('Generating summary...')" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: rgba(236, 72, 153, 0.1); border: 1px solid #ec4899; color: #ec4899;">
                        <i class="ph-bold ph-file-audio"></i> Play Daily Summary
                    </button>
                </div>

                <div id="voice-feedback" style="margin-top: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; display: none; text-align: center;">
                    <div class="mic-btn-ring" style="width: 40px; height: 40px; margin: 0 auto 0.5rem auto; position: relative;"></div>
                    <p style="color: var(--text-primary); font-size: 0.9rem;" id="voice-text">Listening...</p>
                </div>
            </div>
        </div>
    `;
}

function renderTasksView() {
    pageTitle.textContent = "Task Management";
    pageSubtitle.textContent = "Organize and prioritize.";
    renderDashboard(); // Reusing dashboard view for now but this could be more detailed
}

function renderCalendar() {
    pageTitle.textContent = "Calendar";
    pageSubtitle.textContent = "Schedule and events.";
    contentArea.innerHTML = `<div class="card"><h3>Calendar View Placeholder</h3><p>Full monthly calendar would be rendered here.</p></div>`;
}

function renderInsights() {
    pageTitle.textContent = "Productivity Insights";
    pageSubtitle.textContent = "Analyze your performance.";

    // Simple bar chart using CSS
    const maxVal = Math.max(...PERSONAL_DATA.insights.weekly);
    const bars = PERSONAL_DATA.insights.weekly.map((val, idx) => {
        const height = (val / maxVal) * 100;
        const day = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx];
        return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; flex: 1;">
                <div style="width: 100%; height: ${height}%; background: ${val >= 85 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}; border-radius: 4px; transition: height 0.5s ease-out;"></div>
                <span style="color: var(--text-secondary); font-size: 0.8rem;">${day}</span>
            </div>
        `;
    }).join('');

    contentArea.innerHTML = `
        <div class="dashboard-grid">
            <div class="card card-g-8">
                <div class="card-header">
                    <h3>Weekly Completion Rate</h3>
                </div>
                <div style="height: 200px; display: flex; align-items: flex-end; gap: 0.5rem; padding-top: 2rem;">
                    ${bars}
                </div>
            </div>

            <div class="card card-g-4">
                 <div class="card-header">
                    <h3>Missed Alerts</h3>
                    <i class="ph-fill ph-bell-ringing" style="color: #ef4444;"></i>
                </div>
                <ul style="list-style: none; padding: 0;">
                    ${PERSONAL_DATA.insights.alerts.map(alert => `
                    <li style="padding: 1rem; border-bottom: 1px solid var(--border-subtle); color: var(--text-secondary);">
                        ${alert}
                    </li>
                    `).join('')}
                </ul>
                <button class="btn-full" style="margin-top: 1rem;">Download Report</button>
            </div>
        </div>
    `;
}

function renderSettings() {
    pageTitle.textContent = "Settings";
    contentArea.innerHTML = `<div class="card"><h3>Settings Placeholder</h3></div>`;
}

// --- Helpers ---

function toggleTask(id) {
    const task = PERSONAL_DATA.tasks.find(t => t.id === id);
    if (task) {
        task.done = !task.done;
        // Update stats
        if (task.done) {
            PERSONAL_DATA.stats.completed++;
            PERSONAL_DATA.stats.pending--;
        } else {
            PERSONAL_DATA.stats.completed--;
            PERSONAL_DATA.stats.pending++;
        }
        renderDashboard();
    }
}

function simulateVoiceAction(message) {
    const feedback = document.getElementById('voice-feedback');
    const text = document.getElementById('voice-text');

    if (feedback) {
        feedback.style.display = 'block';
        text.textContent = message;

        setTimeout(() => {
            text.textContent = "Processing...";
            setTimeout(() => {
                feedback.style.display = 'none';
                alert("Simulated voice action completed!");
            }, 1000);
        }, 1500);
    }
}

// --- Init ---
renderDashboard();
