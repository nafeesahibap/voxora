// HR Dashboard Logic - Integrated & Enhanced

// --- State Management ---
const STATE = {
    view: 'dashboard',
    tasks: [
        { id: 101, title: "Review Offer Letter for Michael", candidate: "Michael Chen", priority: "high", status: "pending", dueDate: "2026-02-14", category: "recruitment" },
        { id: 102, title: "Schedule Onboarding for New Hires", candidate: "", priority: "medium", status: "pending", dueDate: "2026-02-15", category: "onboarding" },
        { id: 103, title: "Update Q4 Compliance Policies", candidate: "", priority: "high", status: "completed", dueDate: "2026-02-10", category: "compliance" },
        { id: 104, title: "Feedback Sync with Engineering Lead", candidate: "", priority: "low", status: "pending", dueDate: "2026-02-16", category: "interview" }
    ],
    candidates: [
        { id: 'c1', name: "Sarah Williams", role: "Senior Frontend Dev", experience: "5 years", status: "interview", matchScore: 88, lastUpdated: "2026-02-14" },
        { id: 'c2', name: "Michael Chen", role: "Product Manager", experience: "7 years", status: "offer", matchScore: 92, lastUpdated: "2026-02-13" },
        { id: 'c3', name: "Jessica Davis", role: "UX Designer", experience: "4 years", status: "screening", matchScore: 78, lastUpdated: "2026-02-14" },
        { id: 'c4', name: "David Miller", role: "DevOps Engineer", experience: "6 years", status: "applied", matchScore: 65, lastUpdated: "2026-02-12" },
        { id: 'c5', name: "Alex Rivera", role: "Backend Engineer", experience: "5 years", status: "applied", matchScore: 72, lastUpdated: "2026-02-15" }
    ],
    interviews: [
        { id: 1, candidate: "Sarah Williams", role: "Senior Frontend Dev", time: "10:00 AM", status: "Scheduled", sentiment: "Neutral" },
        { id: 2, candidate: "Michael Chen", role: "Product Manager", time: "11:30 AM", status: "Completed", sentiment: "High" }
    ]
};

// --- DOM Elements ---
const contentArea = document.getElementById('hr-dashboard-content');
const pageTitle = document.querySelector('.page-title');
const pageSubtitle = document.querySelector('.page-subtitle');
const navItems = document.querySelectorAll('.nav-item');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');

// --- Navigation Handler ---
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        const viewId = item.id;
        switch (viewId) {
            case 'nav-dashboard': renderDashboard(); break;
            case 'nav-tasks': renderTasksView(); break;
            case 'nav-candidates': renderCandidatesView(); break;
            case 'nav-interviews': renderInterviewsView(); break;
            case 'nav-reports': renderReportsView(); break;
            default: renderDashboard();
        }
    });
});

// --- Voice Features ---
let isListening = false;
const micBtn = document.querySelector('.mic-btn-container');
const statusText = document.querySelector('.status-text');

if (micBtn) {
    micBtn.addEventListener('click', toggleVoice);
}

function toggleVoice() {
    isListening = !isListening;
    if (isListening) {
        micBtn.classList.add('active');
        statusText.textContent = "Listening...";
        statusText.style.color = "var(--accent-primary)";
        // Simulate command processing
        setTimeout(() => {
            if (isListening) {
                statusText.textContent = "Processing...";
                setTimeout(() => {
                    handleVoiceCommand("show tasks");
                    isListening = false;
                    statusText.textContent = "Ready";
                    statusText.style.color = "var(--text-muted)";
                    micBtn.classList.remove('active');
                }, 1500);
            }
        }, 3000);
    } else {
        micBtn.classList.remove('active');
        statusText.textContent = "Ready";
        statusText.style.color = "var(--text-muted)";
    }
}

function handleVoiceCommand(cmd) {
    // simple keyword matching
    if (cmd.includes('task')) {
        renderTasksView();
        document.getElementById('nav-tasks').click(); // visual sync
    } else if (cmd.includes('candidate')) {
        renderCandidatesView();
        document.getElementById('nav-candidates').click();
    } else {
        alert("Command not recognized: " + cmd);
    }
}

// --- Main Render Functions ---

function renderDashboard() {
    STATE.view = 'dashboard';
    pageTitle.textContent = "Human Resources Overview";
    pageSubtitle.textContent = "Welcome back, Alex. Here's what's happening today.";

    const stats = calculateStats();

    contentArea.innerHTML = `
        <!-- Metrics Grid -->
        <div class="dashboard-grid" style="margin-bottom: 2rem;">
            ${renderMetricCard("Today's Interviews", stats.interviewsToday, "Scheduled for today", "ph-calendar-check", 12)}
            ${renderMetricCard("Pending HR Tasks", stats.pendingTasks, "Tasks due this week", "ph-list-checks", -5)}
            ${renderMetricCard("Active Candidates", stats.activeCandidates, "2 new this week", "ph-users", 18)}
            ${renderMetricCard("Open Positions", stats.openPositions, "Currently hiring", "ph-briefcase", 0)}
        </div>

        <div class="dashboard-grid">
            <!-- Recent Activity / Tasks Preview -->
            <div class="card card-g-6">
                <div class="card-header">
                    <h3>Priority Tasks</h3>
                    <button class="btn-outline" onclick="renderTasksView()" style="font-size: 0.8rem;">View All</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${STATE.tasks.slice(0, 4).map(renderTaskItem).join('')}
                </div>
            </div>

            <!-- Pipeline Snapshot -->
            <div class="card card-g-6">
                <div class="card-header">
                    <h3>Recruitment Pipeline</h3>
                    <button class="btn-outline" onclick="renderCandidatesView()" style="font-size: 0.8rem;">Manage</button>
                </div>
                <div style="display: flex; gap: 1rem; align-items: flex-end; height: 200px; padding-top: 1rem;">
                    ${renderPipelineBar("Screening", stats.pipeline.screening, 10, "#3b82f6")}
                    ${renderPipelineBar("Interview", stats.pipeline.interview, 10, "#8b5cf6")}
                    ${renderPipelineBar("Offer", stats.pipeline.offer, 10, "#10b981")}
                    ${renderPipelineBar("Hired", stats.pipeline.hired, 10, "#06b6d4")}
                </div>
            </div>
        </div>
    `;
}

function renderTasksView() {
    STATE.view = 'tasks';
    pageTitle.textContent = "Task Management";
    pageSubtitle.textContent = "Track and organize HR activities.";

    // Simplified tabs/chips
    const categories = ['all', 'interview', 'compliance', 'recruitment', 'onboarding'];
    const activeCategory = STATE.activeTaskCategory || 'all';

    contentArea.innerHTML = `
        <div class="card card-g-12">
            <div class="card-header">
                <h3>All Tasks</h3>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: flex-end;">
                     <button class="action-btn" onclick="openAddTaskModal()" style="width: auto; height: auto; padding: 0.5rem 1rem; flex-direction: row; gap: 0.5rem;">
                        <i class="ph-bold ph-plus" style="font-size: 1rem;"></i> Add Task
                    </button>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; gap: 0.5rem;">
                    ${categories.map(cat => `
                        <button onclick="filterTaskCategory('${cat}')" style="background: ${activeCategory === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)'}; color: ${activeCategory === cat ? 'white' : 'var(--text-secondary)'}; border: none; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; text-transform: capitalize; cursor: pointer;">
                            ${cat}
                        </button>
                    `).join('')}
                </div>
                <div style="display: flex; gap: 0.5rem;">
                     <button onclick="setTaskStatusFilter('all')" style="background: none; border: 1px solid var(--border-subtle); color: var(--text-secondary); padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">All</button>
                     <button onclick="setTaskStatusFilter('pending')" style="background: none; border: 1px solid var(--border-subtle); color: var(--text-secondary); padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">Pending</button>
                     <button onclick="setTaskStatusFilter('completed')" style="background: none; border: 1px solid var(--border-subtle); color: var(--text-secondary); padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">Completed</button>
                </div>
            </div>

             <div style="margin-bottom: 1rem;">
                <input type="text" placeholder="Search tasks..." style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.5rem 1rem; border-radius: 6px; color: white;" onkeyup="filterTasks(this.value)">
            </div>

            <div id="tasks-list" style="display: grid; gap: 0.75rem;">
                ${getFilteredTasks().map(renderTaskItem).join('')}
            </div>
        </div>
    `;
}

function renderCandidatesView() {
    STATE.view = 'candidates';
    pageTitle.textContent = "Candidate Management";
    pageSubtitle.textContent = "Track applicants through the hiring pipeline.";

    contentArea.innerHTML = `
        <div class="card card-g-12">
            <div class="card-header">
                <h3>Candidates</h3>
                <div style="display: flex; gap: 1rem;">
                    <input type="text" placeholder="Search candidates..." style="background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.5rem 1rem; border-radius: 6px; color: white;" onkeyup="filterCandidates(this.value)">
                    <button class="btn-outline" onclick="openResumeModal()" style="font-size: 0.9rem;">
                        <i class="ph ph-upload-simple"></i> Upload Resume
                    </button>
                    <button class="action-btn" onclick="openAddCandidateModal()" style="width: auto; height: auto; padding: 0.5rem 1rem; flex-direction: row; gap: 0.5rem;">
                        <i class="ph-bold ph-plus" style="font-size: 1rem;"></i> Add Candidate
                    </button>
                </div>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border-subtle); text-align: left;">
                            <th style="padding: 1rem; color: var(--text-secondary); font-weight: 500;">Name</th>
                            <th style="padding: 1rem; color: var(--text-secondary); font-weight: 500;">Role</th>
                            <th style="padding: 1rem; color: var(--text-secondary); font-weight: 500;">Match</th>
                            <th style="padding: 1rem; color: var(--text-secondary); font-weight: 500;">Status</th>
                            <th style="padding: 1rem; color: var(--text-secondary); font-weight: 500; text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="candidates-table-body">
                        ${STATE.candidates.map(renderCandidateRow).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
function renderInterviewsView() {
    STATE.view = 'interviews';
    pageTitle.textContent = "Interview Scheduling";
    pageSubtitle.textContent = "Manage upcoming interviews and reviews.";

    // Toggle state
    if (!STATE.interviewViewMode) STATE.interviewViewMode = 'list';

    const upcoming = STATE.interviews.filter(i => i.status !== 'Completed');
    const completed = STATE.interviews.filter(i => i.status === 'Completed');

    let mainContent = '';

    if (STATE.interviewViewMode === 'list') {
        mainContent = `
            <div style="margin-bottom: 2rem;">
                ${upcoming.length > 0 ? upcoming.map(renderInterviewCard).join('') : '<p style="color: var(--text-muted); padding: 1rem;">No upcoming interviews.</p>'}
            </div>
            <div class="card-header" style="margin-top: 2rem;">
                <h3>Completed</h3>
            </div>
            <div>
                ${completed.map(renderInterviewCard).join('')}
            </div>
        `;
    } else {
        mainContent = renderCalendarView();
    }

    contentArea.innerHTML = `
        <div class="card card-g-12">
            <div class="card-header">
                <h3>Scheduled Interviews</h3>
                <div style="display: flex; gap: 1rem;">
                    <div class="btn-group" style="display: flex; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 2px;">
                        <button onclick="setInterviewMode('list')" style="background: ${STATE.interviewViewMode === 'list' ? 'var(--accent-primary)' : 'none'}; color: ${STATE.interviewViewMode === 'list' ? 'white' : 'var(--text-secondary)'}; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">List</button>
                        <button onclick="setInterviewMode('calendar')" style="background: ${STATE.interviewViewMode === 'calendar' ? 'var(--accent-primary)' : 'none'}; color: ${STATE.interviewViewMode === 'calendar' ? 'white' : 'var(--text-secondary)'}; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Calendar</button>
                    </div>
                    <button class="action-btn" onclick="openScheduleModal()" style="width: auto; height: auto; padding: 0.5rem 1rem; flex-direction: row; gap: 0.5rem;">
                        <i class="ph-bold ph-calendar-plus" style="font-size: 1rem;"></i> Schedule New
                    </button>
                </div>
            </div>
            ${mainContent}
        </div>
    `;
}

function setInterviewMode(mode) {
    STATE.interviewViewMode = mode;
    renderInterviewsView();
}

function renderCalendarView() {
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    // Mock week dates for demo
    const weekDates = ["2026-02-09", "2026-02-10", "2026-02-11", "2026-02-12", "2026-02-13"];

    let gridHtml = '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem;">';

    weekDays.forEach((day, idx) => {
        const date = weekDates[idx];
        const dayInterviews = STATE.interviews.filter(i => i.date === date);
        const isToday = date === "2026-02-13"; // Mock today

        gridHtml += `
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="text-align: center; padding: 0.5rem; background: ${isToday ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)'}; color: ${isToday ? 'white' : 'var(--text-secondary)'}; border-radius: 4px; font-weight: 500; font-size: 0.9rem;">
                    ${day} ${date.split("-")[2]}
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; min-height: 150px; background: rgba(0,0,0,0.2); border-radius: 4px; padding: 0.5rem;">
                    ${dayInterviews.map(i => `
                        <div style="background: var(--bg-panel); border: 1px solid var(--border-subtle); padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer;" onclick="viewInterviewDetails(${i.id})">
                             <div style="font-weight: 600;">${i.time}</div>
                             <div style="color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${i.candidate}</div>
                             <div style="margin-top: 4px; font-size: 0.7rem; color: ${i.type === 'Technical' ? '#3b82f6' : (i.type === 'HR' ? '#f472b6' : '#10b981')}">${i.type}</div>
                        </div>
                    `).join('')}
                    ${dayInterviews.length === 0 ? '<div style="text-align: center; color: var(--text-muted); font-size: 0.75rem; padding-top: 1rem;">No events</div>' : ''}
                </div>
            </div>
        `;
    });

    gridHtml += '</div>';
    return gridHtml;
}

function viewInterviewDetails(id) {
    const i = STATE.interviews.find(int => int.id === id);
    if (i) {
        alert("Viewing Interview for " + i.candidate);
    }
}

function renderReportsView() {
    STATE.view = 'reports';
    pageTitle.textContent = "Analytics & Reports";
    pageSubtitle.textContent = "Hiring performance and funnel metrics.";

    // Mock Chart Data Visualization using CSS (since no rechart/external lib)
    contentArea.innerHTML = `
        <div class="dashboard-grid">
             <!--Conversion Funnel-->
            <div class="card card-g-6">
                <div class="card-header">
                    <h3>Hiring Funnel</h3>
                </div>
                <div style="padding: 1rem 0;">
                    ${renderFunnelStage("Applied", 120, "100%")}
                    ${renderFunnelStage("Screening", 45, "38%")}
                    ${renderFunnelStage("Interview", 18, "15%")}
                    ${renderFunnelStage("Offer Sent", 8, "6%")}
                    ${renderFunnelStage("Hired", 6, "5%")}
                </div>
            </div>

            <!--Time to Hire-->
            <div class="card card-g-6">
                <div class="card-header">
                    <h3>Time to Hire Breakdown</h3>
                    <span style="font-size: 0.9rem; color: var(--text-muted);">Avg: 24 Days</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1rem; padding-top: 1rem;">
                    ${renderProgressBar("Application to Screen", 3, 30, "#3b82f6")}
                    ${renderProgressBar("Screen to Interview", 5, 30, "#8b5cf6")}
                    ${renderProgressBar("Interview to Decision", 12, 30, "#f59e0b")}
                    ${renderProgressBar("Decision to Offer", 2, 30, "#10b981")}
                </div>
            </div>
        </div>
    `;
}

// --- Helper Components for New Views ---

function renderInterviewCard(i) {
    const typeColors = { Technical: '#3b82f6', HR: '#f472b6', Final: '#10b981' };
    const borderColor = i.status === 'Completed' ? 'var(--border-subtle)' : 'var(--accent-primary)';

    return `
        < div style = "display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.03); border-left: 3px solid ${i.status === 'Completed' ? 'gray' : typeColors[i.type] || 'var(--accent-primary)'}; margin-bottom: 0.75rem; border-radius: 4px;" >
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
            <div>
                 <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: rgba(255,255,255,0.05); border-radius: 4px; color: var(--text-muted); margin-right: 0.5rem;">${i.status}</span>
                 <button onclick="alert('Reschedule request sent for ' + '${i.candidate}')" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;" title="Reschedule"><i class="ph ph-arrows-clockwise"></i></button>
                 <button onclick="alert('Reminder sent to ' + '${i.candidate}')" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-left: 0.5rem;" title="Send Reminder"><i class="ph ph-paper-plane-tilt"></i></button>
            </div>
        </div >
        `;
}

function renderFunnelStage(label, count, pct) {
    return `
        <div style="display: flex; align-items: center; margin-bottom: 0.75rem;">
            <div style="width: 100px; font-size: 0.9rem; color: var(--text-secondary);">${label}</div>
            <div style="flex: 1; height: 24px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; position: relative;">
                <div style="width: ${pct}; height: 100%; background: linear-gradient(90deg, rgba(6, 182, 212, 0.4), rgba(6, 182, 212, 0.8));"></div>
                <span style="position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); font-size: 0.75rem; color: white; text-shadow: 0 0 2px black;">${count}</span>
            </div>
             <div style="width: 50px; text-align: right; font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${pct}</div>
        </div>
    `;
}

function renderProgressBar(label, val, max, color) {
    const pct = (val / max) * 100;
    return `
        <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span style="font-size: 0.85rem; color: var(--text-secondary);">${label}</span>
                <span style="font-size: 0.85rem; font-weight: 600;">${val} Days</span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: ${color};"></div>
            </div>
        </div>
    `;
}

// --- Interview Modal ---

function openScheduleModal() {
    openModal("Schedule Interview", `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                 <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Candidate</label>
                 <select id="sched-candidate" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
                    ${STATE.candidates.map(c => `<option value="${c.name}">${c.name} - ${c.role}</option>`).join('')}
                 </select>
            </div>
             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                     <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Date</label>
                     <input type="date" id="sched-date" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
                </div>
                 <div>
                     <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Time</label>
                     <input type="time" id="sched-time" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
                </div>
            </div>
             <div>
                 <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Type</label>
                 <select id="sched-type" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
                    <option value="Technical">Technical</option>
                    <option value="HR">HR Screen</option>
                    <option value="Final">Final Round</option>
                 </select>
            </div>
            <button onclick="confirmSchedule()" class="action-btn" style="margin-top: 1rem; background: var(--accent-primary); color: white; border: none;">Schedule Interview</button>
        </div>
    `);
}

function confirmSchedule() {
    const candidate = document.getElementById('sched-candidate').value;
    const date = document.getElementById('sched-date').value;
    const time = document.getElementById('sched-time').value;
    const type = document.getElementById('sched-type').value;

    if (candidate && date && time) {
        STATE.interviews.push({
            id: Date.now(),
            candidate,
            role: "Applicant", // Simplified
            date,
            time,
            type,
            status: "Scheduled"
        });
        closeModal();
        renderInterviewsView();
    }
}

// --- Component Generators ---

function renderMetricCard(title, value, subtitle, icon, trend) {
    const trendColor = trend > 0 ? '#10b981' : (trend < 0 ? '#ef4444' : 'var(--text-muted)');
    const trendIcon = trend > 0 ? 'ph-trend-up' : (trend < 0 ? 'ph-trend-down' : 'ph-minus');

    return `
        <div class="card card-g-3" style="grid-column: span 3;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;">${title}</p>
                    <h2 style="font-size: 2rem; font-weight: 700; margin: 0.5rem 0;">${value}</h2>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 8px;">
                    <i class="ph ${icon}" style="font-size: 1.5rem; color: var(--text-primary);"></i>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: ${trendColor}; font-size: 0.8rem; display: flex; align-items: center; gap: 0.25rem;">
                    <i class="ph-bold ${trendIcon}"></i> ${Math.abs(trend)}%
                </span>
                <span style="color: var(--text-muted); font-size: 0.8rem;">${subtitle}</span>
            </div>
        </div>
    `;
}

function renderTaskItem(task) {
    const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
    const isDone = task.status === 'completed';

    return `
        <div class="task-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 8px; transition: all 0.2s;">
            <div onclick="toggleTask(${task.id})" style="cursor: pointer; width: 20px; height: 20px; border-radius: 4px; border: 2px solid ${isDone ? '#10b981' : 'var(--text-muted)'}; display: flex; align-items: center; justify-content: center;">
                ${isDone ? '<i class="ph-bold ph-check" style="color: #10b981; font-size: 12px;"></i>' : ''}
            </div>
            <div style="flex: 1; cursor: pointer;" onclick="viewTaskDetails(${task.id})">
                <h4 style="font-size: 0.95rem; text-decoration: ${isDone ? 'line-through' : 'none'}; color: ${isDone ? 'var(--text-muted)' : 'var(--text-primary)'};">${task.title}</h4>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.25rem;">
                    ${task.candidate ? `<span style="font-size: 0.75rem; color: var(--text-secondary);"><i class="ph-bold ph-user"></i> ${task.candidate}</span>` : ''}
                    <span style="font-size: 0.75rem; color: ${priorityColors[task.priority]}; text-transform: capitalize;">${task.priority} Priority</span>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="editTask(${task.id})" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;" title="Edit Task">
                    <i class="ph ph-pencil-simple"></i>
                </button>
                <button onclick="deleteTask(${task.id})" style="background: none; border: none; color: var(--text-muted); cursor: pointer; opacity: 0.5;" title="Delete Task">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function renderCandidateRow(c) {
    const statusColors = {
        applied: 'var(--text-muted)',
        screening: '#f59e0b',
        interview: '#3b82f6',
        offer: '#10b981',
        hired: '#06b6d4'
    };

    return `
        <tr style="border-bottom: 1px solid var(--border-subtle); transition: background 0.2s;">
            <td style="padding: 1rem; font-weight: 500;">${c.name}</td>
            <td style="padding: 1rem; color: var(--text-secondary);">${c.role}</td>
            <td style="padding: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-weight: 600; color: ${c.matchScore >= 85 ? '#10b981' : '#f59e0b'};">${c.matchScore}%</span>
                    <div style="width: 60px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px;">
                        <div style="width: ${c.matchScore}%; height: 100%; background: ${c.matchScore >= 85 ? '#10b981' : '#f59e0b'}; border-radius: 2px;"></div>
                    </div>
                </div>
            </td>
            <td style="padding: 1rem;">
                <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid ${statusColors[c.status]}; color: ${statusColors[c.status]}; text-transform: capitalize;">${c.status}</span>
            </td>
            <td style="padding: 1rem; text-align: right; white-space: nowrap;">
                <button onclick="viewCandidate('${c.id}')" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-left: 0.5rem;" title="View Profile"><i class="ph ph-eye"></i></button>
                <button onclick="moveStage('${c.id}', '${c.status}')" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-left: 0.5rem;" title="Move to Next Stage"><i class="ph ph-arrow-right"></i></button>
                <button onclick="deleteCandidate('${c.id}')" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-left: 0.5rem;" title="Delete Candidate"><i class="ph ph-trash"></i></button>
            </td>
        </tr>
    `;
}

function renderPipelineBar(label, count, max, color) {
    const height = (count / max) * 100;
    return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
            <div style="width: 100%; height: ${height}%; background: ${color}; border-radius: 4px 4px 0 0; opacity: 0.8; min-height: 4px;"></div>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">${label}</span>
            <span style="font-size: 0.9rem; font-weight: 600;">${count}</span>
        </div>
    `;
}

// --- Logic & Helpers ---

// --- Logic & Helpers ---

function getFilteredTasks() {
    let filtered = STATE.tasks;

    // Category filter
    if (STATE.activeTaskCategory && STATE.activeTaskCategory !== 'all') {
        filtered = filtered.filter(t => t.category === STATE.activeTaskCategory);
    }

    // Status filter
    if (STATE.activeTaskStatus) {
        if (STATE.activeTaskStatus === 'pending') filtered = filtered.filter(t => t.status === 'pending');
        if (STATE.activeTaskStatus === 'completed') filtered = filtered.filter(t => t.status === 'completed');
    }

    return filtered;
}

function filterTaskCategory(cat) {
    STATE.activeTaskCategory = cat;
    renderTasksView();
}

function setTaskStatusFilter(status) {
    STATE.activeTaskStatus = status;
    renderTasksView();
}

function viewTaskDetails(id) {
    const task = STATE.tasks.find(t => t.id === id);
    if (task) {
        openModal("Task Details", `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                     <label style="font-size: 0.85rem; color: var(--text-secondary);">Title</label>
                     <p style="font-size: 1.1rem; color: var(--text-primary); font-weight: 500;">${task.title}</p>
                </div>
                <div>
                     <label style="font-size: 0.85rem; color: var(--text-secondary);">Status</label>
                     <p style="text-transform: capitalize;">${task.status}</p>
                </div>
                <div>
                     <label style="font-size: 0.85rem; color: var(--text-secondary);">Priority</label>
                     <p style="text-transform: capitalize;">${task.priority}</p>
                </div>
                <div>
                     <label style="font-size: 0.85rem; color: var(--text-secondary);">Due Date</label>
                     <p>${task.dueDate}</p>
                </div>
                 <button onclick="toggleTask(${task.id}); closeModal(); renderTasksView();" class="action-btn" style="margin-top: 1rem;">
                    ${task.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
                 </button>
            </div>
        `);
    }
}

function calculateStats() {
    const pipeline = {
        screening: STATE.candidates.filter(c => c.status === 'screening').length,
        interview: STATE.candidates.filter(c => c.status === 'interview').length,
        offer: STATE.candidates.filter(c => c.status === 'offer').length,
        hired: STATE.candidates.filter(c => c.status === 'hired').length
    };

    return {
        interviewsToday: STATE.interviews.filter(i => i.status === 'Scheduled').length,
        pendingTasks: STATE.tasks.filter(t => t.status === 'pending').length,
        activeCandidates: STATE.candidates.length,
        openPositions: 8, // Mock static
        pipeline
    };
}

function toggleTask(id) {
    const task = STATE.tasks.find(t => t.id === id);
    if (task) {
        task.status = task.status === 'completed' ? 'pending' : 'completed';
        if (STATE.view === 'dashboard') renderDashboard();
        if (STATE.view === 'tasks') renderTasksView();
    }
}



function editTask(id) {
    const task = STATE.tasks.find(t => t.id === id);
    if (task) openEditTaskModal(task);
}

function filterTasks(query) {
    const items = document.querySelectorAll('#tasks-list .task-item');
    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(query.toLowerCase()) ? 'flex' : 'none';
    });
}

// --- Modal Functions ---

function openModal(title, htmlContent) {
    modalTitle.textContent = title;
    modalBody.innerHTML = htmlContent;
    modalOverlay.style.display = 'flex';
}

function closeModal() {
    modalOverlay.style.display = 'none';
}

function openEditTaskModal(task) {
    openModal("Edit Task", `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <input type="hidden" id="edit-task-id" value="${task.id}">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Task Title</label>
                    <input type="text" id="edit-task-title" value="${task.title}" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Priority</label>
                        <select id="edit-task-priority" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
                            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Due Date</label>
                        <input type="date" id="edit-task-date" value="${task.dueDate}" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
                    </div>
                </div>
                <button onclick="confirmEditTask()" class="action-btn" style="margin-top: 1rem; background: var(--accent-primary); color: white; border: none;">Save Changes</button>
            </div>
    `);
}

function confirmEditTask() {
    const id = parseInt(document.getElementById('edit-task-id').value);
    const title = document.getElementById('edit-task-title').value;
    const priority = document.getElementById('edit-task-priority').value;
    const date = document.getElementById('edit-task-date').value;

    const task = STATE.tasks.find(t => t.id === id);
    if (task && title) {
        task.title = title;
        task.priority = priority;
        task.dueDate = date;
        closeModal();
        renderTasksView();
    }
}

function openAddTaskModal() {
    openModal("Add New Task", `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Task Title</label>
                <input type="text" id="new-task-title" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                     <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Priority</label>
                     <select id="new-task-priority" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="low">Low</option>
                     </select>
                </div>
                 <div>
                     <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Due Date</label>
                     <input type="date" id="new-task-date" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
                </div>
            </div>
            <button onclick="confirmAddTask()" class="action-btn" style="margin-top: 1rem; background: var(--accent-primary); color: white; border: none;">Create Task</button>
        </div>
    `);
}

function confirmAddTask() {
    const title = document.getElementById('new-task-title').value;
    const priority = document.getElementById('new-task-priority').value;
    const date = document.getElementById('new-task-date').value;

    if (title) {
        STATE.tasks.unshift({
            id: Date.now(),
            title,
            priority,
            dueDate: date || "2026-02-20",
            status: 'pending',
            candidate: ""
        });
        closeModal();
        renderTasksView();
    }
}

function confirmAddCandidate() {
    const name = document.getElementById('new-cand-name').value;
    const role = document.getElementById('new-cand-role').value;
    const exp = document.getElementById('new-cand-exp').value;
    const email = document.getElementById('new-cand-email').value;

    if (name && role) {
        STATE.candidates.push({
            id: Date.now().toString(),
            name,
            role,
            experience: exp || "Not specified",
            email: email || "",
            matchScore: Math.floor(Math.random() * 30) + 65, // Mock score
            status: 'applied',
            lastUpdated: new Date().toISOString().split('T')[0]
        });
        closeModal();
        renderCandidatesView();
    }
}

function openAddCandidateModal() {
    openModal("Add New Candidate", `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Full Name</label>
                <input type="text" id="new-cand-name" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Role Applied</label>
                <input type="text" id="new-cand-role" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Experience</label>
                    <input type="text" id="new-cand-exp" placeholder="e.g. 5 years" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">Email</label>
                    <input type="email" id="new-cand-email" placeholder="email@example.com" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
                </div>
            </div>
             <button onclick="confirmAddCandidate()" class="action-btn" style="margin-top: 1rem; background: var(--accent-primary); color: white; border: none;">Add to Pipeline</button>
        </div>
        `);
}

function filterCandidates(query) {
    const rows = document.querySelectorAll('#candidates-table-body tr');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

function viewCandidate(id) {
    const candidate = STATE.candidates.find(c => c.id === id);
    if (!candidate) return;

    openModal("Candidate Profile", `
        <div style="display: flex; gap: 1.5rem;">
            <div style="text-align: center;">
                <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                    <i class="ph-bold ph-user" style="font-size: 2rem; color: var(--accent-primary);"></i>
                </div>
                <h3 style="margin-bottom: 0.25rem;">${candidate.name}</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${candidate.role}</p>
                <div style="margin-top: 1rem; padding: 0.5rem; background: rgba(16, 185, 129, 0.1); color: #10b981; border-radius: 6px; font-weight: 600;">
                    ${candidate.matchScore}% Match
                </div>
            </div>
            <div style="flex: 1; border-left: 1px solid var(--border-subtle); padding-left: 1.5rem;">
                <h4 style="color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">Status</h4>
                <p style="margin-bottom: 1.5rem; font-size: 1.1rem; text-transform: capitalize;">${candidate.status}</p>
                
                <h4 style="color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">Experience</h4>
                <p style="margin-bottom: 1.5rem;">${candidate.experience}</p>
                
                <h4 style="color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">Application Date</h4>
                <p>${candidate.lastUpdated}</p>
                
                <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <button class="action-btn" style="padding: 0.5rem 1rem; width: auto; font-size: 0.9rem;">Schedule Interview</button>
                    <button class="action-btn" style="padding: 0.5rem 1rem; width: auto; font-size: 0.9rem;" onclick="closeModal()">Close</button>
                </div>
            </div>
        </div>
        `);
}

function deleteCandidate(id) {
    if (confirm('Are you sure you want to remove this candidate from the pipeline?')) {
        STATE.candidates = STATE.candidates.filter(c => c.id !== id);
        renderCandidatesView();
    }
}

function moveStage(id, currentStatus) {
    const nextStages = {
        'applied': 'screening',
        'screening': 'interview',
        'interview': 'offer',
        'offer': 'hired'
    };
    const next = nextStages[currentStatus];
    if (next) {
        const candidate = STATE.candidates.find(c => c.id === id);
        if (candidate) {
            candidate.status = next;
            renderCandidatesView();
            // Optional: generic toast could go here
        }
    }
}

function openResumeModal() {
    openModal("Upload Resume", `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Paste a link to the resume to parse and import candidate data.</p>
            <input type="text" id="resume-url" placeholder="https://drive.google.com/resume.pdf" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 6px; color: white;">
            <button onclick="handleResumeUpload()" class="action-btn" style="margin-top: 0.5rem; background: var(--accent-primary); color: white; border: none;">Submit</button>
        </div>
    `);
}

function handleResumeUpload() {
    const url = document.getElementById('resume-url').value;
    if (url) {
        closeModal();
        alert("Resume uploaded and parsing started for: " + url);
    }
}

// Close Modal on clicking outside
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// --- Init ---
renderDashboard();
