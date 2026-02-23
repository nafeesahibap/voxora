function summarizeCall(id) {
    const modal = document.getElementById('summaryModal');
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('summaryContent');

    // Open loading
    modal.classList.add('open');
    overlay.classList.add('open');
    content.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
            <i class="ph-duotone ph-spinner-gap" style="font-size: 2.5rem; animation: spin 1s linear infinite; color: var(--accent-primary);"></i>
            <p style="margin-top: 1rem;">Analyzing conversation patterns...</p>
        </div>
    `;

    // Simulated Delay
    setTimeout(() => {
        let data = {};

        if (id === 'last') {
            data = {
                title: 'Legal Contract Review',
                sentiment: 'Neutral / Professional',
                points: [
                    'Discussed clause 4.2 regarding IP ownership.',
                    'Michael requested a revision of the termination notice period (from 30 to 60 days).',
                    'Agreed to finalize the draft by Friday.'
                ],
                action: 'Send revised PDF to Legal Dept.'
            };
        } else if (id === 'apex') {
            data = {
                title: 'Technical Support Ticket #402',
                sentiment: 'Positive',
                points: [
                    'Confirmed server outage issue resolved.',
                    'Discussed new API rate limits.',
                    'Apex team confirmed SLA adherence.'
                ],
                action: 'Update internal dashboard status.'
            };
        } else {
            data = {
                title: 'Quarterly Check-in',
                sentiment: 'Very Positive',
                points: [
                    'Client is happy with Q3 results.',
                    'Looking to expand seat licenses by 20%.',
                    'Scheduled follow-up demo for next week.'
                ],
                action: 'Prepare contract expansion proposal.'
            };
        }

        content.innerHTML = `
            <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle);">
                <h3 style="font-size: 1.1rem; color: var(--accent-primary); margin-bottom: 0.5rem;">${data.title}</h3>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">Detected Sentiment: <span style="color: #10b981;">${data.sentiment}</span></p>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <h4 style="font-size: 0.9rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 1rem;">Key Discussion Points</h4>
                ${data.points.map(p => `
                    <div class="summary-point">
                        <i class="ph-bold ph-check"></i>
                        <span>${p}</span>
                    </div>
                `).join('')}
            </div>

            <div style="background: rgba(6, 182, 212, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid rgba(6, 182, 212, 0.2);">
                <h4 style="font-size: 0.85rem; color: var(--accent-primary); margin-bottom: 0.5rem; font-weight: 700;">RECOMMENDED ACTION</h4>
                <p style="font-size: 0.9rem;">${data.action}</p>
            </div>
        `;

    }, 1500);
}

function closeModal() {
    document.getElementById('summaryModal').classList.remove('open');
    document.getElementById('modalOverlay').classList.remove('open');
}

// Close on overlay click
document.getElementById('modalOverlay').addEventListener('click', closeModal);

// Simulation Functions
function initiateCall(name) {
    alert(`VOXORA:\n\nCalling ${name}...\n\n(Connecting via secure VoIP line)`);
}

function sendMessage(name) {
    const msg = prompt(`Enter message for ${name}:`);
    if (msg) {
        alert(`VOXORA:\n\nMessage Sent to ${name}:\n"${msg}"`);
    }
}

