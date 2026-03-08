import '../voice_engine.js';

export const Store = {
    state: {
        candidates: [
            { id: 'c1', name: "Sarah Williams", role: "Senior Frontend Dev", experience: "5 years", status: "interview", matchScore: 88, lastUpdated: "2026-02-14" },
            { id: 'c2', name: "Michael Chen", role: "Product Manager", experience: "7 years", status: "offer", matchScore: 92, lastUpdated: "2026-02-13" },
            { id: 'c3', name: "Jessica Davis", role: "UX Designer", experience: "4 years", status: "screening", matchScore: 78, lastUpdated: "2026-02-14" },
            { id: 'c4', name: "David Miller", role: "DevOps Engineer", experience: "6 years", status: "applied", matchScore: 65, lastUpdated: "2026-02-12" },
            { id: 'c5', name: "Alex Rivera", role: "Backend Engineer", experience: "5 years", status: "applied", matchScore: 72, lastUpdated: "2026-02-15" }
        ],
        tasks: [],
        interviews: [
            { id: 1, candidate: "Sarah Williams", role: "Senior Frontend Dev", time: "10:00 AM", status: "Scheduled", sentiment: "Neutral", type: "Technical", date: "2026-02-13", zoom_link: "https://zoom.us/j/123456789" },
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
    async initTasks() {
        try {
            const response = await fetch('/api/v1/tasks/');
            if (response.ok) {
                this.state.tasks = await response.json();
                this.notify();
            }
        } catch (err) { console.error("Init tasks error:", err); }
    },

    async addTask(taskData) {
        const response = await fetch('/api/v1/tasks/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) return null;

        const newTask = await response.json();

        this.state.tasks.unshift(newTask);

        this.notify();

        return newTask;
    },

    async updateTaskStatus(id) {
        const task = this.state.tasks.find(t => t.id === id);
        if (task) {
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            const newProgress = newStatus === 'completed' ? 100 : 0;

            try {
                const response = await fetch(`/api/v1/tasks/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus, progress: newProgress })
                });
                if (response.ok) {
                    const updated = await response.json();
                    Object.assign(task, updated);
                    this.notify();
                }
            } catch (err) { console.error("Update status error:", err); }
        }
    },

    async updateTask(id, updates) {
        try {
            const response = await fetch(`/api/v1/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (response.ok) {
                const updated = await response.json();
                const index = this.state.tasks.findIndex(t => t.id === id);
                if (index !== -1) {
                    this.state.tasks[index] = updated;
                    this.notify();
                }
                return updated;
            }
        } catch (err) { console.error("Update task error:", err); return null; }
    },

    async deleteTask(id) {
        try {
            const response = await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE' });
            if (response.ok) {
                this.state.tasks = this.state.tasks.filter(t => t.id !== id);
                this.notify();
            }
        } catch (err) { console.error("Delete task error:", err); }
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
    },

    async initInterviews() {
        try {
            const response = await fetch('/api/v1/interviews/');
            if (response.ok) {
                this.state.interviews = await response.json();
                this.notify();
            }
        } catch (err) { console.error("Init interviews error:", err); }
    },

    async addInterviewApi(interview) {
        // Find candidate ID if name is provided instead of ID (fallback for legacy/simple calls)
        let candidateId = interview.candidate_id;
        if (!candidateId && interview.candidate) {
            const cand = this.state.candidates.find(c =>
                c.name === interview.candidate ||
                `${c.first_name} ${c.last_name}`.trim() === interview.candidate
            );
            candidateId = cand ? cand.id : interview.candidate; // Fallback to name if not found
        }

        const payload = {
            candidate_id: String(candidateId || ''),
            job_posting_id: String(interview.job_posting_id || 'j1'),
            interview_date: interview.date ? new Date(interview.date).toISOString() : new Date().toISOString(),
            interview_time: interview.time || '10:00 AM',
            interview_type: interview.type || 'Technical',
            status: interview.status || 'Scheduled',
            zoom_link: interview.zoom_link || '',
            notes: interview.notes || ''
        };

        try {
            const response = await fetch('/api/v1/interviews/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const newInt = await response.json();
                this.state.interviews.push(newInt);
                this.notify();
                return newInt;
            } else {
                const error = await response.text();
                console.error("Add interview API failed:", response.status, error);
                return null;
            }
        } catch (err) {
            console.error("Add interview error:", err);
            return null;
        }
    },

    async updateInterview(id, updates) {
        try {
            const response = await fetch(`/api/v1/interviews/${id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (response.ok) {
                const updated = await response.json();
                const index = this.state.interviews.findIndex(i => i.id === id);
                if (index !== -1) {
                    this.state.interviews[index] = updated;
                    this.notify();
                }
            }
        } catch (err) { console.error("Update interview error:", err); }
    },

    async deleteInterview(id) {
        try {
            const response = await fetch(`/api/v1/interviews/${id}/`, { method: 'DELETE' });
            if (response.ok) {
                this.state.interviews = this.state.interviews.filter(i => i.id !== id);
                this.notify();
            }
        } catch (err) { console.error("Delete interview error:", err); }
    }
};
