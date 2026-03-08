/**
 * Study page: Pomodoro timer + Weekly study chart
 */

(function () {
    'use strict';

    var FOCUS_SEC = 25 * 60;
    var BREAK_SEC = 5 * 60;
    var timeDisplay = document.getElementById('pomodoroTime');
    var modeDisplay = document.getElementById('pomodoroMode');
    var startBtn = document.getElementById('pomodoroStart');
    var pauseBtn = document.getElementById('pomodoroPause');
    var resetBtn = document.getElementById('pomodoroReset');

    var state = {
        mode: 'focus',
        remaining: FOCUS_SEC,
        intervalId: null,
        isRunning: false
    };

    function formatMMSS(sec) {
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    function render() {
        if (timeDisplay) timeDisplay.textContent = formatMMSS(state.remaining);
        if (modeDisplay) modeDisplay.textContent = state.mode === 'focus' ? 'Focus' : 'Break';
    }

    function switchMode() {
        state.mode = state.mode === 'focus' ? 'break' : 'focus';
        state.remaining = state.mode === 'focus' ? FOCUS_SEC : BREAK_SEC;
        render();
    }

    function tick() {
        state.remaining--;
        render();
        if (state.remaining <= 0) {
            stopTimer();
            switchMode();
            playEndSound();
        }
    }

    function startTimer() {
        if (state.intervalId) return;
        state.isRunning = true;
        state.intervalId = setInterval(tick, 1000);
        if (startBtn) startBtn.disabled = true;
        if (pauseBtn) pauseBtn.disabled = false;
    }

    function stopTimer() {
        if (state.intervalId) {
            clearInterval(state.intervalId);
            state.intervalId = null;
        }
        state.isRunning = false;
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
    }

    function resetTimer() {
        stopTimer();
        state.mode = 'focus';
        state.remaining = FOCUS_SEC;
        render();
    }

    function playEndSound() {
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {}
    }

    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', stopTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);

    render();

    // Weekly Study Chart (Chart.js)
    var canvas = document.getElementById('weeklyStudyChart');
    if (canvas && typeof Chart !== 'undefined') {
        var ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Hours',
                    data: [2, 3, 1.5, 4, 2.5, 5, 3],
                    backgroundColor: [
                        'rgba(165, 180, 252, 0.8)',
                        'rgba(249, 168, 212, 0.8)',
                        'rgba(134, 239, 172, 0.8)',
                        'rgba(196, 181, 253, 0.8)',
                        'rgba(252, 211, 77, 0.8)',
                        'rgba(129, 212, 250, 0.8)',
                        'rgba(248, 191, 182, 0.8)'
                    ],
                    borderColor: [
                        'rgba(165, 180, 252, 1)',
                        'rgba(249, 168, 212, 1)',
                        'rgba(134, 239, 172, 1)',
                        'rgba(196, 181, 253, 1)',
                        'rgba(252, 211, 77, 1)',
                        'rgba(129, 212, 250, 1)',
                        'rgba(248, 191, 182, 1)'
                    ],
                    borderWidth: 1,
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
                        beginAtZero: true,
                        max: 6,
                        ticks: {
                            color: '#94a3b8',
                            callback: function (v) { return v + 'h'; }
                        },
                        grid: { color: 'rgba(255,255,255,0.06)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { display: false }
                    }
                }
            }
        });
    }
})();
