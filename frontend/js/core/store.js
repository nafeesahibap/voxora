export const Store = {
    state: {
        candidates: [
            { id: 'c1', name: "Sarah Williams", role: "Senior Frontend Dev", experience: "5 years", status: "interview", matchScore: 88, lastUpdated: "2026-02-14" },
            { id: 'c2', name: "Michael Chen", role: "Product Manager", experience: "7 years", status: "offer", matchScore: 92, lastUpdated: "2026-02-13" },
            { id: 'c3', name: "Jessica Davis", role: "UX Designer", experience: "4 years", status: "screening", matchScore: 78, lastUpdated: "2026-02-14" },
            { id: 'c4', name: "David Miller", role: "DevOps Engineer", experience: "6 years", status: "applied", matchScore: 65, lastUpdated: "2026-02-12" },
            { id: 'c5', name: "Alex Rivera", role: "Backend Engineer", experience: "5 years", status: "applied", matchScore: 72, lastUpdated: "2026-02-15" }
        ],
        tasks: [
            { id: 101, title: "Review Offer Letter for Michael", candidate: "Michael Chen", priority: "high", status: "pending", dueDate: "2026-02-14", category: "recruitment" },
            { id: 102, title: "Schedule Onboarding for New Hires", candidate: "", priority: "medium", status: "pending", dueDate: "2026-02-15", category: "onboarding" },
            { id: 103, title: "Update Q4 Compliance Policies", candidate: "", priority: "high", status: "completed", dueDate: "2026-02-10", category: "compliance" },
            { id: 104, title: "Feedback Sync with Engineering Lead", candidate: "", priority: "low", status: "pending", dueDate: "2026-02-16", category: "interview" }
        ],
        interviews: [
            { id: 1, candidate: "Sarah Williams", role: "Senior Frontend Dev", time: "10:00 AM", status: "Scheduled", sentiment: "Neutral", type: "Technical", date: "2026-02-13" },
            { id: 2, candidate: "Michael Chen", role: "Product Manager", time: "11:30 AM", status: "Completed", sentiment: "High", type: "Final", date: "2026-02-13" }
        ],
        analytics: {
            hiredCount: 6,
            interviewCount: 18,
            offerCount: 8,
            screeningCount: 45
        }
    },
    listeners: [],

    subscribe(listener) {
        this.listeners.push(listener);
    },

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    },

    // Actions
    addTask(task) {
        this.state.tasks.unshift(task);
        this.notify();
    },

    updateTaskStatus(id) {
        const task = this.state.tasks.find(t => t.id === id);
        if (task) {
            task.status = task.status === 'completed' ? 'pending' : 'completed';
            this.notify();
        }
    },

    updateTask(updatedTask) {
        const index = this.state.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
            this.state.tasks[index] = updatedTask;
            this.notify();
        }
    },

    deleteTask(id) {
        this.state.tasks = this.state.tasks.filter(t => t.id !== id);
        this.notify();
    },

    addCandidate(candidate) {
        this.state.candidates.push(candidate);
        this.notify();
    },

    deleteCandidate(id) {
        this.state.candidates = this.state.candidates.filter(c => c.id !== id);
        this.notify();
    },

    addInterview(interview) {
        this.state.interviews.push(interview);
        this.notify();
    }
};
