import { Store } from '../core/store.js';

export default {
    title: "Task Management",
    subtitle: "Track and organize HR activities.",

    view: async () => {
        // Initial fetch if store is empty or just to sync
        await Store.initTasks();

        const activeCategory = Store.state.activeTaskCategory || 'all';
        const categories = ['all', 'interview', 'compliance', 'recruitment', 'onboarding', 'general'];

        const filteredTasks = activeCategory === 'all'
            ? Store.state.tasks
            : Store.state.tasks.filter(t => t.category === activeCategory);

        const renderTaskItem = (task) => {
            const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
            const isDone = task.status === 'completed';
            const isVoice = task.voice_created === 'true';

            return `
                <div class="task-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 8px; transition: all 0.2s;">
                    <button class="btn-toggle-task" data-id="${task.id}" style="cursor: pointer; width: 24px; height: 24px; border-radius: 4px; border: 2px solid ${isDone ? '#10b981' : 'var(--text-muted)'}; background: ${isDone ? 'rgba(16,185,129,0.1)' : 'transparent'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        ${isDone ? '<i class="ph-bold ph-check" style="color: #10b981; font-size: 14px;"></i>' : ''}
                    </button>
                    <div style="flex: 1; opacity: ${isDone ? 0.5 : 1};">
                        <h4 style="font-size: 0.95rem; text-decoration: ${isDone ? 'line-through' : 'none'}; color: ${isDone ? 'var(--text-muted)' : 'var(--text-primary)'};">
                            ${task.title}
                            ${isVoice ? '<span style="font-size: 0.65rem; padding: 1px 6px; background: rgba(59,130,246,0.15); color: #3b82f6; border-radius: 3px; margin-left: 0.5rem; vertical-align: middle;">🎤 Voice</span>' : ''}
                        </h4>
                        <div style="display: flex; gap: 0.5rem; margin-top: 0.25rem; flex-wrap: wrap;">
                            ${task.candidate ? `<span style="font-size: 0.75rem; color: var(--text-secondary);"><i class="ph-bold ph-user"></i> ${task.candidate}</span>` : ''}
                            <span style="font-size: 0.75rem; color: ${priorityColors[task.priority]}; text-transform: capitalize;">${task.priority} Priority</span>
                            ${task.category ? `<span style="font-size: 0.75rem; background: rgba(255,255,255,0.05); padding: 0 0.5rem; border-radius: 4px;">${task.category}</span>` : ''}
                            ${task.date ? `<span style="font-size: 0.75rem; color: var(--text-muted);"><i class="ph ph-calendar"></i> ${new Date(task.date).toLocaleDateString()}</span>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                        <button class="btn-edit-task" data-id="${task.id}" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                        <button class="btn-delete-task" data-id="${task.id}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; opacity: 0.5;" title="Delete"><i class="ph ph-trash"></i></button>
                    </div>
                </div>
            `;
        };

        const pendingCount = Store.state.tasks.filter(t => t.status === 'pending').length;
        const completedCount = Store.state.tasks.filter(t => t.status === 'completed').length;

        return `
            <!-- Task Summary Bar -->
            <div class="dashboard-grid" style="margin-bottom: 1.5rem;">
                <div class="card card-g-4" style="padding: 1rem 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <i class="ph-fill ph-clock" style="font-size: 1.5rem; color: #f59e0b;"></i>
                        <div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Pending</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">${pendingCount}</div>
                        </div>
                    </div>
                </div>
                <div class="card card-g-4" style="padding: 1rem 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <i class="ph-fill ph-check-circle" style="font-size: 1.5rem; color: #10b981;"></i>
                        <div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Completed</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">${completedCount}</div>
                        </div>
                    </div>
                </div>
                <div class="card card-g-4" style="padding: 1rem 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <i class="ph-fill ph-list-checks" style="font-size: 1.5rem; color: var(--accent-primary);"></i>
                        <div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Total</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">${Store.state.tasks.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card card-g-12">
                <div class="card-header">
                    <h3>Tasks</h3>
                    <div style="display: flex; gap: 1rem;">
                        <button id="btn-voice-task" class="btn-outline" style="padding: 0.5rem 1rem; font-size: 0.85rem; border-color: #3b82f6; color: #3b82f6;">
                            <i class="ph-fill ph-microphone"></i> Voice Add
                        </button>
                        <button id="btn-add-task" class="action-btn" style="width: auto; height: auto; padding: 0.5rem 1rem; flex-direction: row; gap: 0.5rem;">
                            <i class="ph-bold ph-plus"></i> Add Task
                        </button>
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    ${categories.map(cat => `
                        <button class="filter-category" data-cat="${cat}" style="background: ${activeCategory === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)'}; color: ${activeCategory === cat ? 'white' : 'var(--text-secondary)'}; border: none; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; text-transform: capitalize; cursor: pointer; transition: all 0.2s;">
                            ${cat}
                        </button>
                    `).join('')}
                </div>

                <div id="tasks-list" style="display: grid; gap: 0.75rem;">
                    ${filteredTasks.length > 0
                ? filteredTasks.map(renderTaskItem).join('')
                : '<div style="text-align: center; color: var(--text-muted); padding: 2rem;"><i class="ph ph-check-circle" style="font-size: 2rem; opacity: 0.3;"></i><p>No tasks in this category</p></div>'}
                </div>
            </div>
        `;
    },

    afterRender: () => {
        const taskList = document.getElementById('tasks-list');
        if (taskList) {
            taskList.addEventListener('click', async (e) => {
                const toggleBtn = e.target.closest('.btn-toggle-task');
                const deleteBtn = e.target.closest('.btn-delete-task');
                const editBtn = e.target.closest('.btn-edit-task');

                if (toggleBtn) {
                    const id = toggleBtn.dataset.id;
                    await Store.updateTaskStatus(id);
                    window.router.handleRoute();
                } else if (deleteBtn) {
                    const id = deleteBtn.dataset.id;
                    const task = Store.state.tasks.find(t => t.id === id);
                    openModal('Confirm Delete', `
                        <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">Are you sure you want to delete <strong>"${task?.title || 'this task'}"</strong>?</p>
                        <div style="display: flex; gap: 1rem;">
                            <button id="btn-confirm-delete" class="action-btn" style="flex: 1; padding: 0.75rem; border-radius: 8px; background: linear-gradient(135deg, #ef4444, #dc2626);">Delete</button>
                            <button onclick="closeModal()" class="btn-outline" style="flex: 1; padding: 0.75rem; border-radius: 8px;">Cancel</button>
                        </div>
                    `);
                    document.getElementById('btn-confirm-delete')?.addEventListener('click', async () => {
                        await Store.deleteTask(id);
                        closeModal();
                        showToast('Task deleted', 'success');
                        window.router.handleRoute();
                    });
                } else if (editBtn) {
                    const id = editBtn.dataset.id;
                    const task = Store.state.tasks.find(t => t.id === id);
                    if (!task) return;

                    openModal('Edit Task', `
                        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                            <div>
                                <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Title</label>
                                <input type="text" id="edit-task-title" value="${task.title}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div>
                                    <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Priority</label>
                                    <select id="edit-task-priority" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                                        <option ${task.priority === 'high' ? 'selected' : ''}>high</option>
                                        <option ${task.priority === 'medium' ? 'selected' : ''}>medium</option>
                                        <option ${task.priority === 'low' ? 'selected' : ''}>low</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Category</label>
                                    <select id="edit-task-category" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                                        <option ${task.category === 'interview' ? 'selected' : ''}>interview</option>
                                        <option ${task.category === 'compliance' ? 'selected' : ''}>compliance</option>
                                        <option ${task.category === 'recruitment' ? 'selected' : ''}>recruitment</option>
                                        <option ${task.category === 'onboarding' ? 'selected' : ''}>onboarding</option>
                                        <option ${task.category === 'general' ? 'selected' : ''}>general</option>
                                    </select>
                                </div>
                            </div>
                            <button id="btn-save-edit" class="action-btn" style="width: 100%; padding: 0.75rem; border-radius: 8px;">Save Changes</button>
                        </div>
                    `);
                    document.getElementById('btn-save-edit')?.addEventListener('click', async () => {
                        const title = document.getElementById('edit-task-title').value;
                        const priority = document.getElementById('edit-task-priority').value;
                        const category = document.getElementById('edit-task-category').value;

                        await Store.updateTask(task.id, { title, priority, category });
                        closeModal();
                        showToast('Task updated', 'success');
                        window.router.handleRoute();
                    });
                }
            });
        }

        // Real Voice Recognition Integration
        document.getElementById('btn-voice-task')?.addEventListener('click', () => {
            const btn = document.getElementById('btn-voice-task');
            const originalText = btn.innerHTML;

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                showToast("Voice Recognition not supported in this browser.", "error");
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                btn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Listening...';
                btn.style.borderColor = 'var(--accent-primary)';
                btn.classList.add('pulse-glow');
            };

            recognition.onresult = async (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                console.log("Voice Transcript:", transcript);
                showToast(`🎤 Heard: "${transcript}"`, 'info');

                // Command Parsing
                if (transcript.includes("interview of nafeesa hiba")) {
                    const isDone = transcript.includes("done") || transcript.includes("completed");
                    if (isDone) {
                        // Mark as done
                        const taskToFinish = Store.state.tasks.find(t => t.title.toLowerCase().includes("nafeesa hiba"));
                        if (taskToFinish) {
                            await Store.updateTaskStatus(taskToFinish.id);
                            showToast("Task marked as completed!", "success");
                        } else {
                            showToast("Task not found to mark as done.", "error");
                        }
                    } else {
                        // Add new
                        await Store.addTask({
                            title: "Interview of Nafeesa Hiba",
                            priority: "high",
                            status: "pending",
                            category: "interview",
                            voice_created: "true"
                        });
                        showToast("Voice task created: Interview of Nafeesa Hiba", "success");
                    }
                } else if (transcript.startsWith("add task")) {
                    const taskTitle = transcript.replace("add task", "").trim();
                    if (taskTitle) {
                        await Store.addTask({
                            title: taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1),
                            priority: "high",
                            status: "pending",
                            category: "general",
                            voice_created: "true"
                        });
                        showToast(`Task added: "${taskTitle}"`, "success");
                    }
                } else if (transcript.includes("mark") && (transcript.includes("done") || transcript.includes("completed"))) {
                    // "Mark [task name] as done"
                    const taskNameSearch = transcript.replace("mark", "").replace("as done", "").replace("completed", "").trim();
                    const taskToFinish = Store.state.tasks.find(t => t.title.toLowerCase().includes(taskNameSearch));
                    if (taskToFinish) {
                        await Store.updateTaskStatus(taskToFinish.id);
                        showToast(`Task "${taskToFinish.title}" completed!`, "success");
                    }
                } else if (transcript.includes("completed") || transcript.includes("done")) {
                    // "[task name] completed" variations
                    const taskNameSearch = transcript.replace("completed", "").replace("done", "").trim();
                    if (taskNameSearch) {
                        const taskToFinish = Store.state.tasks.find(t => t.title.toLowerCase().includes(taskNameSearch));
                        if (taskToFinish) {
                            await Store.updateTaskStatus(taskToFinish.id);
                            showToast(`Task "${taskToFinish.title}" completed!`, "success");
                        }
                    }
                }

                await window.router.handleRoute(); // Refresh UI
            };

            recognition.onerror = (event) => {
                console.error("Speech Error:", event.error);
                showToast("Voice Recognition Error: " + event.error, "error");
            };

            recognition.onend = () => {
                btn.innerHTML = originalText;
                btn.style.borderColor = '#3b82f6';
                btn.classList.remove('pulse-glow');
            };

            recognition.start();
        });

        // Add Task via Modal
        document.getElementById('btn-add-task')?.addEventListener('click', () => {
            openModal('Add New Task', `
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div>
                        <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Task Title</label>
                        <input type="text" id="new-task-title" placeholder="Enter task title" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Priority</label>
                            <select id="new-task-priority" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                                <option value="high">High</option>
                                <option value="medium" selected>Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Category</label>
                            <select id="new-task-category" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                                <option>interview</option>
                                <option>recruitment</option>
                                <option>compliance</option>
                                <option>onboarding</option>
                                <option selected>general</option>
                            </select>
                        </div>
                    </div>
                    <button id="btn-save-new-task" class="action-btn" style="width: 100%; padding: 0.75rem; border-radius: 8px;">Create Task</button>
                </div>
            `);

            document.getElementById('btn-save-new-task')?.addEventListener('click', async () => {
                const title = document.getElementById('new-task-title').value;
                if (!title) { showToast('Please enter a task title', 'error'); return; }

                await Store.addTask({
                    title: title,
                    priority: document.getElementById('new-task-priority').value,
                    status: "pending",
                    category: document.getElementById('new-task-category').value
                });
                closeModal();
                showToast('Task created: "' + title + '"', 'success');
                window.router.handleRoute();
            });
        });

        // Category Filters
        document.querySelectorAll('.filter-category').forEach(btn => {
            btn.addEventListener('click', () => {
                Store.state.activeTaskCategory = btn.dataset.cat;
                window.router.handleRoute();
            });
        });
    }
};
