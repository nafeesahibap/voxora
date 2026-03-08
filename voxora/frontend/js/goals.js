/**
 * Goals: Streaks, Goals, Planner – state and localStorage
 */

(function () {
    'use strict';

    var STORAGE_GOALS = 'voxora_goals';
    var STORAGE_TASKS = 'voxora_tasks';
    var STORAGE_STREAK = 'voxora_streak_daily';

    function todayKey() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function getGoals() {
        try {
            var raw = localStorage.getItem(STORAGE_GOALS);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function setGoals(arr) {
        localStorage.setItem(STORAGE_GOALS, JSON.stringify(arr));
    }

    function getTasks() {
        try {
            var raw = localStorage.getItem(STORAGE_TASKS);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function setTasks(arr) {
        localStorage.setItem(STORAGE_TASKS, JSON.stringify(arr));
    }

    function getStreakDaily() {
        try {
            var raw = localStorage.getItem(STORAGE_STREAK);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function setStreakDaily(obj) {
        localStorage.setItem(STORAGE_STREAK, JSON.stringify(obj));
    }

    function addCompletedToday() {
        var key = todayKey();
        var daily = getStreakDaily();
        daily[key] = (daily[key] || 0) + 1;
        setStreakDaily(daily);
    }

    function removeCompletedToday() {
        var key = todayKey();
        var daily = getStreakDaily();
        if (daily[key]) {
            daily[key]--;
            if (daily[key] <= 0) delete daily[key];
            setStreakDaily(daily);
        }
    }

    function computeStreaks() {
        var daily = getStreakDaily();
        var key = todayKey();
        var current = 0;
        var d = new Date(key);
        while (true) {
            var k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            if ((daily[k] || 0) >= 1) current++;
            else break;
            d.setDate(d.getDate() - 1);
        }
        var allDates = Object.keys(daily).filter(function (k) { return (daily[k] || 0) >= 1; }).sort();
        var longest = 0;
        var run = 0;
        for (var i = 0; i < allDates.length; i++) {
            if (i > 0) {
                var prev = new Date(allDates[i - 1]);
                var curr = new Date(allDates[i]);
                var diff = (curr - prev) / (24 * 60 * 60 * 1000);
                if (diff === 1) run++;
                else run = 1;
            } else run = 1;
            if (run > longest) longest = run;
        }
        var todayCount = daily[key] || 0;
        var todayDate = new Date(key);
        var weekStart = new Date(todayDate);
        weekStart.setDate(weekStart.getDate() - 6);
        var daysWithTask = 0;
        for (var j = 0; j < 7; j++) {
            var ds = new Date(weekStart.getTime());
            ds.setDate(ds.getDate() + j);
            var ks = ds.getFullYear() + '-' + String(ds.getMonth() + 1).padStart(2, '0') + '-' + String(ds.getDate()).padStart(2, '0');
            if ((daily[ks] || 0) >= 1) daysWithTask++;
        }
        var weeklyPct = Math.round((daysWithTask / 7) * 100);
        return { current: current, longest: longest, today: todayCount, weekly: weeklyPct };
    }

    // Tabs
    function showPanel(name) {
        document.querySelectorAll('.goals-panel').forEach(function (p) {
            p.classList.add('goals-panel--hidden');
        });
        document.querySelectorAll('.goals-tab').forEach(function (t) {
            t.classList.remove('goals-tab--active');
            t.setAttribute('aria-selected', t.getAttribute('data-tab') === name ? 'true' : 'false');
        });
        var panel = document.getElementById('panel-' + name);
        var tab = document.querySelector('.goals-tab[data-tab="' + name + '"]');
        if (panel) panel.classList.remove('goals-panel--hidden');
        if (tab) tab.classList.add('goals-tab--active');
    }

    document.querySelectorAll('.goals-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            showPanel(tab.getAttribute('data-tab'));
        });
    });

    // Streaks render
    function renderStreaks() {
        var s = computeStreaks();
        var el = document.getElementById('streakCurrent');
        if (el) el.textContent = s.current;
        el = document.getElementById('streakLongest');
        if (el) el.textContent = s.longest;
        el = document.getElementById('streakToday');
        if (el) el.textContent = s.today;
        el = document.getElementById('streakWeekly');
        if (el) el.textContent = s.weekly + '%';
    }

    // Goals
    function nextId(arr) {
        var max = 0;
        arr.forEach(function (g) { if (g.id > max) max = g.id; });
        return max + 1;
    }

    function goalProgress(goal, tasks) {
        var linked = tasks.filter(function (t) { return t.goalId === goal.id; });
        if (linked.length === 0) return 0;
        var done = linked.filter(function (t) { return t.completed; }).length;
        return Math.round((done / linked.length) * 100);
    }

    function daysRemaining(deadline) {
        var a = new Date(deadline);
        var b = new Date(todayKey());
        a.setHours(0, 0, 0, 0);
        b.setHours(0, 0, 0, 0);
        return Math.max(0, Math.ceil((a - b) / (24 * 60 * 60 * 1000)));
    }

    document.getElementById('goalForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var goals = getGoals();
        var g = {
            id: nextId(goals),
            title: document.getElementById('goalTitle').value.trim(),
            type: document.getElementById('goalType').value,
            deadline: document.getElementById('goalDeadline').value
        };
        goals.push(g);
        setGoals(goals);
        document.getElementById('goalTitle').value = '';
        document.getElementById('goalDeadline').value = '';
        renderGoals();
        renderTaskGoalDropdown();
    });

    function renderGoals() {
        var goals = getGoals();
        var tasks = getTasks();
        var list = document.getElementById('goalsList');
        list.innerHTML = goals.map(function (goal) {
            var prog = goalProgress(goal, tasks);
            var linked = tasks.filter(function (t) { return t.goalId === goal.id; });
            var days = daysRemaining(goal.deadline);
            var typeLabel = goal.type === 'long' ? 'Long-Term' : 'Short-Term';
            var completeBtn = prog >= 100 ? '<button type="button" class="goals-btn goals-btn--small goals-btn--complete" data-goal-id="' + goal.id + '">Mark complete</button>' : '';
            return '<div class="goals-goal-card" data-goal-id="' + goal.id + '">' +
                '<div class="goals-goal-card__head">' +
                '<h4 class="goals-goal-card__title">' + escapeHtml(goal.title) + '</h4>' +
                '<span class="goals-badge goals-badge--' + goal.type + '">' + typeLabel + '</span>' +
                '</div>' +
                '<p class="goals-goal-card__meta">Deadline: ' + escapeHtml(goal.deadline) + ' · ' + days + ' days left</p>' +
                '<div class="goals-progress-wrap"><div class="goals-progress-bar"><div class="goals-progress-fill" style="width:' + prog + '%"></div></div><span>' + prog + '%</span></div>' +
                '<p class="goals-goal-card__linked">' + linked.length + ' linked tasks</p>' +
                completeBtn +
                '</div>';
        }).join('');
        list.querySelectorAll('.goals-btn--complete').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(btn.getAttribute('data-goal-id'), 10);
                var goals = getGoals().filter(function (g) { return g.id !== id; });
                setGoals(goals);
                renderGoals();
                renderTaskGoalDropdown();
            });
        });
    }

    function escapeHtml(s) {
        if (!s) return '';
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    function renderTaskGoalDropdown() {
        var goals = getGoals();
        var sel = document.getElementById('taskGoal');
        if (!sel) return;
        var v = sel.value;
        sel.innerHTML = '<option value="">No goal</option>' + goals.map(function (g) {
            return '<option value="' + g.id + '">' + escapeHtml(g.title) + '</option>';
        }).join('');
        sel.value = v || '';
    }

    // Tasks
    document.getElementById('taskForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var tasks = getTasks();
        var goalId = document.getElementById('taskGoal').value;
        var t = {
            id: nextId(tasks),
            name: document.getElementById('taskName').value.trim(),
            subject: document.getElementById('taskSubject').value.trim(),
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value || '',
            goalId: goalId ? parseInt(goalId, 10) : null,
            completed: false
        };
        tasks.push(t);
        setTasks(tasks);
        document.getElementById('taskName').value = '';
        document.getElementById('taskSubject').value = '';
        document.getElementById('taskDueDate').value = '';
        renderTasks();
        renderFiltersSubject();
    });

    function renderFiltersSubject() {
        var tasks = getTasks();
        var subjects = [];
        tasks.forEach(function (t) {
            if (t.subject && subjects.indexOf(t.subject) === -1) subjects.push(t.subject);
        });
        var sel = document.getElementById('filterSubject');
        if (!sel) return;
        var v = sel.value;
        sel.innerHTML = '<option value="">All subjects</option>' + subjects.map(function (s) {
            return '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + '</option>';
        }).join('');
        sel.value = v || '';
    }

    function renderTasks() {
        var tasks = getTasks();
        var subject = (document.getElementById('filterSubject') || {}).value || '';
        var priority = (document.getElementById('filterPriority') || {}).value || '';
        var status = (document.getElementById('filterStatus') || {}).value || 'all';
        if (subject) tasks = tasks.filter(function (t) { return t.subject === subject; });
        if (priority) tasks = tasks.filter(function (t) { return t.priority === priority; });
        if (status === 'pending') tasks = tasks.filter(function (t) { return !t.completed; });
        if (status === 'completed') tasks = tasks.filter(function (t) { return t.completed; });
        var list = document.getElementById('tasksList');
        list.innerHTML = tasks.map(function (task) {
            var prioClass = 'goals-prio--' + task.priority;
            return '<div class="goals-task-card" data-task-id="' + task.id + '">' +
                '<label class="goals-task-card__check">' +
                '<input type="checkbox" class="goals-task-check" data-task-id="' + task.id + '"' + (task.completed ? ' checked' : '') + '>' +
                '<span class="goals-task-card__title">' + escapeHtml(task.name) + '</span>' +
                '</label>' +
                (task.subject ? '<span class="goals-tag">' + escapeHtml(task.subject) + '</span>' : '') +
                '<span class="goals-prio ' + prioClass + '">' + task.priority + '</span>' +
                (task.dueDate ? '<span class="goals-task-card__due">' + escapeHtml(task.dueDate) + '</span>' : '') +
                '</div>';
        }).join('');
        list.querySelectorAll('.goals-task-check').forEach(function (cb) {
            cb.addEventListener('change', function () {
                var id = parseInt(cb.getAttribute('data-task-id'), 10);
                var tasks = getTasks();
                var task = tasks.find(function (t) { return t.id === id; });
                if (!task) return;
                if (cb.checked) {
                    task.completed = true;
                    addCompletedToday();
                } else {
                    task.completed = false;
                    removeCompletedToday();
                }
                setTasks(tasks);
                renderStreaks();
                renderGoals();
            });
        });
    }

    document.getElementById('filterSubject').addEventListener('change', renderTasks);
    document.getElementById('filterPriority').addEventListener('change', renderTasks);
    document.getElementById('filterStatus').addEventListener('change', renderTasks);

    // Init
    renderTaskGoalDropdown();
    renderFiltersSubject();
    renderStreaks();
    renderGoals();
    renderTasks();
})();
