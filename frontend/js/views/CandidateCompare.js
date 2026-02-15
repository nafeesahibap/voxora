import { Store } from '../core/store.js';
import { renderRadarChart } from '../components/SkillRadar.js';

export default {
    title: "Candidate Comparison",
    subtitle: "Side-by-side skill assessment.",

    view: async () => {
        // Selection Logic: For demo, compare the first 2 candidates
        const candidates = Store.state.candidates.slice(0, 2);

        return `
            <div class="card card-g-12">
                <div class="card-header">
                    <h3>Skills Radar Comparison</h3>
                    <p>John Doe vs. Michael Chen</p>
                </div>
                <div style="height: 400px; display: flex; justify-content: center; padding: 1rem;">
                    <canvas id="comparisonRadarChart"></canvas>
                </div>
            </div>

            <div class="dashboard-grid" style="margin-top: 2rem;">
                ${candidates.map(candidate => `
                    <div class="card card-g-6">
                        <div style="text-align: center; padding: 1.5rem;">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--minimal-accent); margin: 0 auto 1rem;">
                                ${candidate.name.charAt(0)}
                            </div>
                            <h4 style="font-size: 1.25rem;">${candidate.name}</h4>
                            <p style="color: var(--minimal-text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">${candidate.role}</p>
                            
                            <div style="display: flex; flex-direction: column; gap: 0.75rem; text-align: left;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                                    <span>Match Score</span>
                                    <span style="font-weight: 600; color: var(--minimal-accent);">${candidate.matchScore}%</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                                    <span>Experience</span>
                                    <span style="font-weight: 600;">${candidate.experience || '5 years'}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                                    <span>Location</span>
                                    <span style="font-weight: 600;">${candidate.location || 'Remote'}</span>
                                </div>
                            </div>
                            <button class="btn-outline" style="width: 100%; margin-top: 1.5rem; padding: 0.75rem;">View Full Profile</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    afterRender: () => {
        const skills = ["React", "Node.js", "Python", "TypeScript", "AWS", "Leadership"];
        renderRadarChart('comparisonRadarChart', {
            labels: skills,
            datasets: [
                {
                    label: "John Doe",
                    data: [95, 85, 40, 90, 30, 80],
                    color: '#4A90E2'
                },
                {
                    label: "Michael Chen",
                    data: [70, 90, 80, 60, 85, 70],
                    color: '#2ecc71'
                }
            ]
        });
    }
};
