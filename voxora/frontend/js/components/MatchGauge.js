export const MatchGauge = (score) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 90 ? '#2ecc71' : (score >= 75 ? '#f39c12' : '#e74c3c');

    return `
        <div class="match-gauge" style="position: relative; width: 150px; height: 150px; margin: 0 auto;">
            <svg width="150" height="150" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="${radius}" fill="none" stroke="#eee" stroke-width="8" />
                <circle cx="50" cy="50" r="${radius}" fill="none" stroke="${color}" stroke-width="8" 
                        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" 
                        stroke-linecap="round" transform="rotate(-90 50 50)" style="transition: stroke-dashoffset 1s ease-out;" />
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <span style="font-size: 2rem; font-weight: 700; color: ${color};">${score}%</span>
                <p style="font-size: 0.75rem; color: var(--minimal-text-secondary); margin: 0;">Match</p>
            </div>
        </div>
    `;
};
