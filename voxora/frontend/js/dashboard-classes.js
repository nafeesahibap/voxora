/**
 * Dashboard – Today's Classes: add class, status (Attended/Missed), join link
 */

(function () {
    'use strict';

    var STORAGE_KEY = 'voxora_dashboard_classes';

    var DEFAULT_CLASSES = [
        { id: 1, subject: 'Data Structures', time: '10:30', platform: 'Zoom', link: 'https://zoom.us/j/example', status: 'Upcoming' },
        { id: 2, subject: 'Operating Systems', time: '13:00', platform: 'Google Meet', link: 'https://meet.google.com/abc-defg-hij', status: 'Upcoming' },
        { id: 3, subject: 'AI Fundamentals', time: '15:30', platform: 'Offline', link: '', status: 'Upcoming' }
    ];

    function getClasses() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
            return DEFAULT_CLASSES.slice();
        } catch (e) {
            return DEFAULT_CLASSES.slice();
        }
    }

    function setClasses(arr) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }

    function escapeHtml(s) {
        if (!s) return '';
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    function nextId(arr) {
        var max = 0;
        arr.forEach(function (c) { if (c.id > max) max = c.id; });
        return max + 1;
    }

    function formatTime(t) {
        if (!t) return '';
        if (t.length === 5) return t;
        var parts = t.split(':');
        var h = parseInt(parts[0], 10);
        var m = parts[1] || '00';
        var am = h < 12 ? 'AM' : 'PM';
        if (h === 0) h = 12;
        else if (h > 12) h -= 12;
        return h + ':' + m + ' ' + am;
    }

    function renderList() {
        var classes = getClasses();
        var list = document.getElementById('dashboardClassesList');
        if (!list) return;
        list.innerHTML = classes.map(function (c) {
            var statusClass = 'dashboard-classes-badge--' + c.status.toLowerCase().replace(/\s/g, '');
            var showJoin = c.link && c.platform !== 'Offline';
            return '<div class="dashboard-classes-card" data-id="' + c.id + '">' +
                '<div class="dashboard-classes-card__main">' +
                '<h4 class="dashboard-classes-card__subject">' + escapeHtml(c.subject) + '</h4>' +
                '<p class="dashboard-classes-card__time">' + escapeHtml(formatTime(c.time)) + '</p>' +
                '<p class="dashboard-classes-card__platform">' + escapeHtml(c.platform) + '</p>' +
                '<span class="dashboard-classes-badge ' + statusClass + '">' + escapeHtml(c.status) + '</span>' +
                '</div>' +
                '<div class="dashboard-classes-card__actions">' +
                (showJoin ? '<button type="button" class="dashboard-classes-btn dashboard-classes-btn--join" data-link="' + escapeHtml(c.link) + '">🔗 Join Class</button>' : '') +
                '<button type="button" class="dashboard-classes-btn dashboard-classes-btn--attended" data-id="' + c.id + '">Mark as Attended</button>' +
                '<button type="button" class="dashboard-classes-btn dashboard-classes-btn--missed" data-id="' + c.id + '">Mark as Missed</button>' +
                '</div></div>';
        }).join('');

        list.querySelectorAll('.dashboard-classes-btn--join').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var link = btn.getAttribute('data-link');
                if (link) window.open(link, '_blank');
            });
        });
        list.querySelectorAll('.dashboard-classes-btn--attended').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(btn.getAttribute('data-id'), 10);
                var arr = getClasses();
                var c = arr.find(function (x) { return x.id === id; });
                if (c) { c.status = 'Attended'; setClasses(arr); renderList(); }
            });
        });
        list.querySelectorAll('.dashboard-classes-btn--missed').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(btn.getAttribute('data-id'), 10);
                var arr = getClasses();
                var c = arr.find(function (x) { return x.id === id; });
                if (c) { c.status = 'Missed'; setClasses(arr); renderList(); }
            });
        });
    }

    function openModal() {
        document.getElementById('dashboardClassesModalOverlay').classList.add('dashboard-classes-modal--open');
        document.getElementById('dashboardClassesModal').classList.add('dashboard-classes-modal--open');
    }

    function closeModal() {
        document.getElementById('dashboardClassesModalOverlay').classList.remove('dashboard-classes-modal--open');
        document.getElementById('dashboardClassesModal').classList.remove('dashboard-classes-modal--open');
    }

    document.getElementById('dashboardAddClassBtn').addEventListener('click', openModal);
    document.getElementById('dashboardClassesModalClose').addEventListener('click', closeModal);
    document.getElementById('dashboardClassesModalOverlay').addEventListener('click', closeModal);

    document.getElementById('dashboardClassesForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var subject = document.getElementById('addClassSubject').value.trim();
        var time = document.getElementById('addClassTime').value;
        var platform = document.getElementById('addClassPlatform').value;
        var link = (document.getElementById('addClassLink').value || '').trim();
        var arr = getClasses();
        arr.push({
            id: nextId(arr),
            subject: subject,
            time: time,
            platform: platform,
            link: link,
            status: 'Upcoming'
        });
        setClasses(arr);
        document.getElementById('dashboardClassesForm').reset();
        closeModal();
        renderList();
    });

    renderList();
})();
