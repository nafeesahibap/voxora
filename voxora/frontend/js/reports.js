/**
 * Reports – Academic Analytics: records, trend chart, comparison chart, insights
 */

(function () {
    'use strict';

    var STORAGE_RECORDS = 'voxora_academic_records';

    function getRecords() {
        try {
            var raw = localStorage.getItem(STORAGE_RECORDS);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function setRecords(arr) {
        localStorage.setItem(STORAGE_RECORDS, JSON.stringify(arr));
    }

    function uniqueSubjects(records) {
        var set = {};
        records.forEach(function (r) {
            if (r.subject) set[r.subject] = true;
        });
        return Object.keys(set).sort();
    }

    function updateSubjectDatalist() {
        var records = getRecords();
        var subjects = uniqueSubjects(records);
        var list = document.getElementById('subjectList');
        if (!list) return;
        list.innerHTML = subjects.map(function (s) {
            return '<option value="' + escapeHtml(s) + '">';
        }).join('');
    }

    function escapeHtml(s) {
        if (!s) return '';
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    // Form
    document.getElementById('recordForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var marks = parseFloat(document.getElementById('recordMarks').value, 10);
        var total = parseFloat(document.getElementById('recordTotal').value, 10);
        if (total <= 0) return;
        var percentage = Math.round((marks / total) * 100);
        var records = getRecords();
        var record = {
            id: Date.now(),
            subject: document.getElementById('recordSubject').value.trim(),
            examType: document.getElementById('recordExamType').value,
            marks: marks,
            total: total,
            percentage: percentage
        };
        records.push(record);
        setRecords(records);
        document.getElementById('recordForm').reset();
        updateSubjectDatalist();
        updateTrendSubjectDropdown();
        renderTrendChart();
        renderComparisonChart();
        renderInsights();
    });

    function updateTrendSubjectDropdown() {
        var subjects = uniqueSubjects(getRecords());
        var sel = document.getElementById('trendSubject');
        if (!sel) return;
        var v = sel.value;
        sel.innerHTML = subjects.length ? subjects.map(function (s) {
            return '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + '</option>';
        }).join('') : '<option value="">No subjects yet</option>';
        if (subjects.indexOf(v) !== -1) sel.value = v;
        else if (subjects.length) sel.value = subjects[0];
    }

    var EXAM_TYPE_ORDER = ['Internal 1', 'Internal 2', 'Model', 'Semester'];

    function examTypeIndex(examType) {
        var i = EXAM_TYPE_ORDER.indexOf(examType);
        return i === -1 ? 999 : i;
    }

    function sortByExamTypeOrder(records) {
        return records.slice().sort(function (a, b) {
            return examTypeIndex(a.examType) - examTypeIndex(b.examType);
        });
    }

    var trendChartInstance = null;

    function renderTrendChart() {
        var records = getRecords();
        var subject = (document.getElementById('trendSubject') || {}).value || '';
        var filtered = subject ? records.filter(function (r) { return r.subject === subject; }) : records;
        filtered = sortByExamTypeOrder(filtered);

        var canvas = document.getElementById('trendChart');
        if (!canvas || typeof Chart === 'undefined') return;

        var ctx = canvas.getContext('2d');
        if (trendChartInstance) trendChartInstance.destroy();

        var labels = filtered.map(function (r) { return r.examType; });
        var data = filtered.map(function (r) { return r.percentage; });

        trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Percentage',
                    data: data,
                    borderColor: '#a5b4fc',
                    backgroundColor: 'rgba(165, 180, 252, 0.15)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        ticks: { color: '#94a3b8', callback: function (v) { return v + '%'; } },
                        grid: { color: 'rgba(255,255,255,0.06)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8', maxRotation: 45 },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    var comparisonChartInstance = null;

    function renderComparisonChart() {
        var records = getRecords();
        var bySubject = {};
        records.forEach(function (r) {
            if (!bySubject[r.subject]) bySubject[r.subject] = [];
            bySubject[r.subject].push(r.percentage);
        });
        var subjects = Object.keys(bySubject).sort();
        var averages = subjects.map(function (s) {
            var arr = bySubject[s];
            return Math.round(arr.reduce(function (a, b) { return a + b; }, 0) / arr.length);
        });

        var canvas = document.getElementById('comparisonChart');
        if (!canvas || typeof Chart === 'undefined') return;

        var ctx = canvas.getContext('2d');
        if (comparisonChartInstance) comparisonChartInstance.destroy();

        var colors = ['#a5b4fc', '#f9a8d4', '#86efac', '#c4b5fd', '#fcd34d', '#7dd3fc'];

        comparisonChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: subjects,
                datasets: [{
                    label: 'Average %',
                    data: averages,
                    backgroundColor: subjects.map(function (_, i) { return colors[i % colors.length]; }),
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        ticks: { color: '#94a3b8', callback: function (v) { return v + '%'; } },
                        grid: { color: 'rgba(255,255,255,0.06)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8', maxRotation: 45 },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    function renderInsights() {
        var records = getRecords();
        var bySubject = {};
        records.forEach(function (r) {
            if (!bySubject[r.subject]) bySubject[r.subject] = [];
            bySubject[r.subject].push(r);
        });
        var insights = [];
        Object.keys(bySubject).forEach(function (subject) {
            var arr = sortByExamTypeOrder(bySubject[subject]);
            var avg = arr.reduce(function (s, r) { return s + r.percentage; }, 0) / arr.length;
            if (arr.length >= 2) {
                var latest = arr[arr.length - 1].percentage;
                var prev = arr[arr.length - 2].percentage;
                var diff = latest - prev;
                if (diff > 0) {
                    insights.push({ type: 'improvement', msg: 'Improved by ' + diff + '% in ' + subject + '.', icon: '📈' });
                } else if (diff < 0) {
                    insights.push({ type: 'warning', msg: 'Performance dropped by ' + Math.abs(diff) + '% compared to last exam in ' + subject + '.', icon: '⚠️' });
                }
            }
            if (avg < 70) {
                insights.push({ type: 'suggestion', msg: subject + ' needs attention (avg below 70%).', icon: '💡' });
            }
        });

        var box = document.getElementById('insightsBox');
        if (!box) return;
        if (!insights.length) {
            box.innerHTML = '<p class="reports-insight reports-insight--empty">Add records to see insights.</p>';
            return;
        }
        box.innerHTML = insights.map(function (i) {
            return '<div class="reports-insight reports-insight--' + i.type + '">' +
                '<span class="reports-insight__icon">' + i.icon + '</span>' +
                '<p class="reports-insight__text">' + escapeHtml(i.msg) + '</p></div>';
        }).join('');
    }

    document.getElementById('trendSubject').addEventListener('change', renderTrendChart);

    // Init
    updateSubjectDatalist();
    updateTrendSubjectDropdown();
    renderTrendChart();
    renderComparisonChart();
    renderInsights();
})();
