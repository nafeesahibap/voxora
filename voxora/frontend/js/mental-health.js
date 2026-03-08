/**
 * Mental Health / Balance: Mood, Sleep, Water trackers
 */

(function () {
    'use strict';

    var WATER_GOAL_ML = 2500;
    var WATER_STEP_ML = 250;

    // Mood
    var moodMessages = {
        happy: "Great to hear you're feeling good! Keep it up.",
        okay: "That's okay. Small steps matter.",
        tired: "Rest when you need to. You're doing enough.",
        stressed: "Take a breath. It's okay to slow down."
    };

    var moodState = null;

    document.getElementById('moodOptions').addEventListener('click', function (e) {
        var btn = e.target.closest('.mood-btn');
        if (!btn) return;
        var mood = btn.getAttribute('data-mood');
        document.querySelectorAll('.mood-btn').forEach(function (b) {
            b.classList.remove('mood-btn--selected');
            b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('mood-btn--selected');
        btn.setAttribute('aria-pressed', 'true');
        moodState = mood;
        var el = document.getElementById('moodMessage');
        el.textContent = moodMessages[mood] || '';
    });

    // Sleep
    var sleepSlider = document.getElementById('sleepSlider');
    var sleepHoursEl = document.getElementById('sleepHours');
    var sleepInsightEl = document.getElementById('sleepInsight');

    function updateSleepInsight(hours) {
        if (hours < 6) sleepInsightEl.textContent = 'Try to rest more.';
        else if (hours <= 8) sleepInsightEl.textContent = 'Good balance.';
        else sleepInsightEl.textContent = 'Well rested!';
    }

    if (sleepSlider) {
        sleepSlider.addEventListener('input', function () {
            var val = parseFloat(sleepSlider.value);
            sleepHoursEl.textContent = val;
            updateSleepInsight(val);
        });
        updateSleepInsight(parseFloat(sleepSlider.value));
    }

    // Water
    var waterCurrent = 0;
    var fillEl = document.getElementById('waterProgressFill');
    var percentEl = document.getElementById('waterPercent');
    var currentEl = document.getElementById('waterCurrent');
    var addBtn = document.getElementById('waterAddBtn');

    function updateWaterUI() {
        var pct = Math.min(100, (waterCurrent / WATER_GOAL_ML) * 100);
        if (fillEl) fillEl.style.width = pct + '%';
        if (percentEl) percentEl.textContent = Math.round(pct) + '%';
        if (currentEl) currentEl.textContent = waterCurrent;
        var progressBar = document.querySelector('.water-progress-bar');
        if (progressBar) progressBar.setAttribute('aria-valuenow', waterCurrent);
    }

    if (addBtn) {
        addBtn.addEventListener('click', function () {
            waterCurrent += WATER_STEP_ML;
            updateWaterUI();
        });
    }
    updateWaterUI();
})();
