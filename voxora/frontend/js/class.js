/**
 * Class page: Today's Classes – status badges and Join Class (mock)
 */

(function () {
    'use strict';

    var CLASS_DURATION_MIN = 60;
    var classes = [
        { subject: 'Data Structures', time: '10:30 AM', startMin: 10 * 60 + 30 },
        { subject: 'Operating Systems', time: '1:00 PM', startMin: 13 * 60 + 0 },
        { subject: 'AI Fundamentals', time: '3:30 PM', startMin: 15 * 60 + 30 }
    ];

    function getNowMinutes() {
        var d = new Date();
        return d.getHours() * 60 + d.getMinutes();
    }

    function getStatus(startMin) {
        var now = getNowMinutes();
        var endMin = startMin + CLASS_DURATION_MIN;
        if (now < startMin) return 'upcoming';
        if (now < endMin) return 'ongoing';
        return 'completed';
    }

    function applyStatusToCards() {
        var cards = document.querySelectorAll('.class-card[data-time]');
        if (!cards.length) return;
        cards.forEach(function (card, i) {
            var startMin = classes[i] ? classes[i].startMin : 0;
            var status = getStatus(startMin);
            var badge = card.querySelector('[data-badge]');
            var btn = card.querySelector('.btn-join');
            if (badge) {
                badge.className = 'class-badge class-badge--' + status;
                badge.textContent = status === 'upcoming' ? 'Upcoming' : status === 'ongoing' ? 'Ongoing' : 'Completed';
            }
            card.classList.remove('class-card--ongoing');
            if (status === 'ongoing') card.classList.add('class-card--ongoing');
            if (btn) btn.disabled = status === 'completed';
        });
    }

    applyStatusToCards();
    setInterval(applyStatusToCards, 60000);

    document.getElementById('classGrid').addEventListener('click', function (e) {
        var btn = e.target.closest('.btn-join');
        if (!btn || btn.disabled) return;
        e.preventDefault();
        var card = btn.closest('.class-card');
        var subject = card ? card.querySelector('.class-card__subject').textContent : 'Class';
        alert('Join Class:\n\n' + subject + '\n\n(Mock – no actual join yet)');
    });
})();
