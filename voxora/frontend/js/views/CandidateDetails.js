import { Store } from '../core/store.js';
import { MatchGauge } from '../components/MatchGauge.js';

export default {
    title: "Candidate Profile",
    subtitle: "Detailed assessment and skill analysis.",

    view: async (params) => {
        const candidate = Store.state.candidates.find(c => c.id == params.id) || Store.state.candidates[0];
        if (!candidate) return `<div class="card card-g-12"><h3>Candidate not found</h3></div>`;

        const skills = ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Docker"];
        const scores = [95, 80, 70, 40, 30, 85];
        const required = [90, 85, 80, 70, 60, 50];

        const renderHeatmap = () => `
            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
                ${skills.map((skill, i) => {
            const gap = scores[i] - required[i];
            const gapColor = gap >= 0 ? '#10b981' : (gap > -20 ? '#f59e0b' : '#ef4444');
            return `
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 100px; font-size: 0.85rem; color: var(--text-secondary);">${skill}</div>
                            <div style="flex: 1; height: 24px; background: rgba(255,255,255,0.05); border-radius: 4px; position: relative; overflow: hidden;">
                                <div style="width: ${scores[i]}%; height: 100%; background: ${gapColor}; opacity: 0.8; transition: width 0.8s ease-out;"></div>
                                <div style="position: absolute; left: ${required[i]}%; top: 0; width: 2px; height: 100%; background: white; opacity: 0.3;" title="Required: ${required[i]}%"></div>
                            </div>
                            <div style="width: 45px; font-size: 0.85rem; font-weight: 600; text-align: right; color: ${gapColor};">${gap > 0 ? '+' : ''}${gap}%</div>
                        </div>`;
        }).join('')}
                <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 0.5rem; font-size: 0.7rem; color: var(--text-secondary);">
                    <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width: 8px; height: 8px; background: white; opacity: 0.3;"></div> Required</span>
                    <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width: 8px; height: 8px; background: #10b981;"></div> Exceeds</span>
                    <span style="display: flex; align-items: center; gap: 0.25rem;"><div style="width: 8px; height: 8px; background: #ef4444;"></div> Gap</span>
                </div>
            </div>
        `;

        return `
            <div class="dashboard-grid">
                <!-- Header Card -->
                <div class="card card-g-12" style="display: flex; justify-content: space-between; align-items: center; padding: 2rem; flex-wrap: wrap; gap: 1rem;">
                    <div style="display: flex; gap: 1.5rem; align-items: center;">
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-primary), #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; font-weight: 700;">
                            ${candidate.name.charAt(0)}
                        </div>
                        <div>
                            <h2 style="font-size: 2rem; margin-bottom: 0.25rem;">${candidate.name}</h2>
                            <p style="color: var(--text-secondary); font-size: 1.1rem;">${candidate.role} • ${candidate.experience || '5 years'}</p>
                            <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                                <span style="font-size: 0.85rem; color: var(--text-secondary);"><i class="ph ph-envelope"></i> ${candidate.email || candidate.name.toLowerCase().replace(' ', '.') + '@email.com'}</span>
                                <span style="font-size: 0.85rem; color: var(--text-secondary);"><i class="ph ph-map-pin"></i> ${candidate.location || 'Remote'}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                        <button class="btn-outline" id="btn-download-cv" style="padding: 0.75rem 1.5rem; border-radius: 8px;"><i class="ph ph-download"></i> Download CV</button>
                        <button class="action-btn" id="btn-schedule-interview" style="width: auto; height: auto; padding: 0.75rem 1.5rem; border-radius: 8px; flex-direction: row; gap: 0.5rem;"><i class="ph ph-calendar-plus"></i> Schedule Interview</button>
                        <button class="btn-outline" id="btn-offer-letter" style="padding: 0.75rem 1.5rem; border-radius: 8px; border-color: #10b981; color: #10b981;"><i class="ph ph-file-text"></i> Generate Offer</button>
                    </div>
                </div>

                <!-- Match Score Card -->
                <div class="card card-g-4">
                    <div class="card-header"><h3>Match Score</h3></div>
                    <div style="display: flex; flex-direction: column; align-items: center; padding: 1rem 0;">
                        ${MatchGauge(candidate.matchScore)}
                        <div style="margin-top: 2rem; width: 100%;">
                            <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">Score Breakdown</h4>
                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;"><span>Skills Match</span><span style="font-weight: 600;">92%</span></div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;"><span>Experience Fit</span><span style="font-weight: 600;">100%</span></div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;"><span>Education Fit</span><span style="font-weight: 600;">85%</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Skill Gap Card -->
                <div class="card card-g-8">
                    <div class="card-header">
                        <h3>Skill Gap Analysis</h3>
                        <p>Compared to ${candidate.role} requirement</p>
                    </div>
                    ${renderHeatmap()}
                </div>

                <!-- Resume Summary -->
                <div class="card card-g-12">
                    <div class="card-header"><h3>Resume Summary</h3></div>
                    <div style="padding: 1rem; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); border-radius: 8px; font-family: 'Roboto Mono', monospace; font-size: 0.9rem; max-height: 300px; overflow-y: auto; color: var(--text-primary); line-height: 1.6;">
                        ${candidate.resume_text || `Experienced ${candidate.role} with ${candidate.experience || '5 years'} of professional background. Strong technical skills in modern frameworks and tools. Demonstrated leadership abilities and proven track record of delivering high-impact projects. Excellent communicator with experience working in cross-functional teams.`}
                    </div>
                </div>
            </div>
        `;
    },

    afterRender: (params) => {
        const candidate = Store.state.candidates.find(c => c.id == params.id) || Store.state.candidates[0];
        if (!candidate) return;

        // Schedule Interview Modal
        document.getElementById('btn-schedule-interview')?.addEventListener('click', () => {
            openModal('Schedule Interview', `
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div>
                        <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Candidate</label>
                        <input type="text" value="${candidate.name}" disabled style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Date</label>
                            <input type="date" id="interview-date" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                        </div>
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Time</label>
                            <input type="time" id="interview-time" value="10:00" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                        </div>
                    </div>
                    <div>
                        <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Interviewer</label>
                        <select id="interview-interviewer" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                            <option>Alex Morgan (HR Manager)</option>
                            <option>David Kim (Engineering Lead)</option>
                            <option>Sarah Chen (CTO)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Interview Type</label>
                        <select id="interview-type" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                            <option>Technical</option>
                            <option>HR</option>
                            <option>Final</option>
                        </select>
                    </div>
                    <button id="btn-confirm-interview" class="action-btn" style="width: 100%; padding: 0.75rem; border-radius: 8px; margin-top: 0.5rem;">
                        <i class="ph-bold ph-calendar-check"></i> Confirm Interview
                    </button>
                </div>
            `);

            document.getElementById('btn-confirm-interview')?.addEventListener('click', () => {
                const date = document.getElementById('interview-date').value || new Date().toISOString().split('T')[0];
                const time = document.getElementById('interview-time').value || '10:00';
                const type = document.getElementById('interview-type').value;

                Store.addInterview({
                    id: Date.now(),
                    candidate: candidate.name,
                    role: candidate.role,
                    time: time,
                    status: 'Scheduled',
                    type: type,
                    date: date
                });

                closeModal();
                showToast(`Interview scheduled for ${candidate.name} on ${date} at ${time}`);
            });
        });

        // Offer Letter Generator Modal
        document.getElementById('btn-offer-letter')?.addEventListener('click', () => {
            openModal('Offer Letter Generator', `
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Candidate Name</label>
                            <input type="text" value="${candidate.name}" disabled style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                        </div>
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Position</label>
                            <input type="text" value="${candidate.role}" disabled style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                        </div>
                    </div>
                    <div>
                        <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Salary Package</label>
                        <input type="text" id="offer-salary" value="$125,000 / year" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                    </div>
                    <div>
                        <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Start Date</label>
                        <input type="date" id="offer-start" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2); color: var(--text-primary);">
                    </div>
                    <div style="padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid var(--border-subtle);">
                        <h4 style="font-size: 0.9rem; margin-bottom: 0.75rem;">Preview</h4>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
                            Dear ${candidate.name},<br><br>
                            We are pleased to offer you the position of <strong>${candidate.role}</strong> at Acme Corporation.
                            Your compensation package includes a base salary of <strong>$125,000/year</strong>, health benefits,
                            and equity options. We believe your skills and experience will be a valuable addition to our team.<br><br>
                            Please confirm your acceptance by replying to this letter.<br><br>
                            Best regards,<br>Alex Morgan<br>HR Manager, Acme Corporation
                        </div>
                    </div>
                    <button id="btn-download-offer" class="action-btn" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="ph-bold ph-download"></i> Download Offer Letter
                    </button>
                </div>
            `);

            document.getElementById('btn-download-offer')?.addEventListener('click', () => {
                closeModal();
                showToast(`Offer letter generated for ${candidate.name}`, 'success');
            });
        });

        // Download CV
        document.getElementById('btn-download-cv')?.addEventListener('click', () => {
            showToast(`Resume downloaded for ${candidate.name}`, 'info');
        });
    }
};
