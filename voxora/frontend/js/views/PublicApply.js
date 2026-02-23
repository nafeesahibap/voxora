export default {
    title: "Apply to Acme Corp",
    subtitle: "Complete your application in seconds.",

    view: async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get('jobId');
        let job = { title: "Senior Frontend Developer", department: "Engineering" };

        if (jobId) {
            try {
                const response = await fetch(`/api/v1/jobs/${jobId}/`);
                if (response.ok) job = await response.json();
            } catch (err) { console.error("Job fetch error:", err); }
        }

        return `
            <div class="view-container" style="max-width: 600px; margin: 2rem auto; padding: 2rem; background: var(--bg-panel); border-bottom: 4px solid var(--minimal-accent); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid var(--border-subtle);">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="font-weight: 800; font-size: 1.5rem; color: var(--minimal-accent); margin-bottom: 0.5rem;">VOXORA</div>
                    <h2 style="font-size: 1.75rem; color: var(--text-primary);">${job.title}</h2>
                    <p style="color: var(--text-secondary); margin-top: 0.5rem;">${job.department} · Acme Corporation</p>
                </div>

                <div id="drop-zone" style="border: 2px dashed var(--border-subtle); border-radius: 12px; padding: 3rem 2rem; background: rgba(255, 255, 255, 0.03); cursor: pointer; transition: all 0.2s; text-align: center;">
                    <i class="ph ph-cloud-arrow-up" style="font-size: 3rem; color: var(--minimal-accent); margin-bottom: 1rem;"></i>
                    <p style="font-weight: 500; font-size: 1.1rem; color: var(--text-primary);">Drag and drop your resume here</p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">PDF or DOCX (Max 5MB)</p>
                    <input type="file" id="resume-input" hidden accept=".pdf,.docx">
                </div>

                <div style="margin-top: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label style="display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.4rem;">First Name (optional)</label>
                        <input type="text" id="first-name" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-panel); color: var(--text-primary);">
                    </div>
                    <div class="form-group">
                        <label style="display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Last Name (optional)</label>
                        <input type="text" id="last-name" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-panel); color: var(--text-primary);">
                    </div>
                    <div class="form-group" style="grid-column: span 1;">
                        <label style="display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Email (optional)</label>
                        <input type="email" id="email" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-panel); color: var(--text-primary);">
                    </div>
                    <div class="form-group" style="grid-column: span 1;">
                        <label style="display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Phone (optional)</label>
                        <input type="tel" id="candidate-phone" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-panel); color: var(--text-primary);">
                    </div>
                </div>

                <div style="margin-top: 1.5rem; display: flex; align-items: start; gap: 0.75rem;">
                    <input type="checkbox" id="privacy-consent" style="margin-top: 0.25rem; cursor: pointer;">
                    <label for="privacy-consent" style="font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;">
                        I agree to the <a href="#" style="color: var(--minimal-accent);">Privacy Policy</a> and allow Voxora to process my data.
                    </label>
                </div>

                <div style="margin-top: 2rem;">
                    <button id="btn-submit-app" class="action-btn" style="width: 100%; padding: 1rem; border-radius: 8px; font-size: 1.1rem; font-weight: 600; opacity: 0.5; cursor: not-allowed;" disabled>
                        Submit Application
                    </button>
                    <p style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 1rem;">
                         🔒 Your data is secure and will be processed according to our policy.
                    </p>
                </div>
            </div>
        `;
    },

    afterRender: () => {
        const dropZone = document.getElementById('drop-zone');
        const input = document.getElementById('resume-input');
        const submitBtn = document.getElementById('btn-submit-app');
        const consent = document.getElementById('privacy-consent');

        const validateForm = () => {
            const hasFile = input.files.length > 0;
            const hasConsent = consent.checked;
            submitBtn.disabled = !(hasFile && hasConsent);
            submitBtn.style.opacity = submitBtn.disabled ? "0.5" : "1";
            submitBtn.style.cursor = submitBtn.disabled ? "not-allowed" : "pointer";
        };

        dropZone.addEventListener('click', () => input.click());
        consent.addEventListener('change', validateForm);

        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                dropZone.innerHTML = `
                    <i class="ph ph-file-pdf" style="font-size: 3rem; color: var(--minimal-success); margin-bottom: 1rem;"></i>
                    <p style="font-weight: 600; color: var(--text-primary);">${input.files[0].name}</p>
                    <p style="font-size: 0.85rem; color: var(--minimal-accent); margin-top: 0.5rem;">Click to change file</p>
                `;
                validateForm();
            }
        });

        submitBtn.addEventListener('click', async () => {
            const file = input.files[0];
            if (!file) return;

            submitBtn.innerHTML = `<i class="ph ph-spinner ph-spin"></i> Processing...`;
            submitBtn.disabled = true;

            const urlParams = new URLSearchParams(window.location.search);
            const formData = new FormData();
            formData.append('resume', file);
            formData.append('jobId', urlParams.get('jobId') || '');
            formData.append('source', 'public_link');

            // Manual overrides from forms
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('candidate-phone').value;

            if (firstName) formData.append('firstName', firstName);
            if (lastName) formData.append('lastName', lastName);
            if (email) formData.append('email', email);
            if (phone) formData.append('phone', phone);

            try {
                const response = await fetch('/api/v1/candidates/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
                }

                const result = await response.json();

                // Show success UI
                const container = document.querySelector('.view-container');
                const targetArea = container ? (container.parentElement || container) : document.getElementById('hr-dashboard-content');

                if (targetArea) {
                    targetArea.innerHTML = `
                    <div style="max-width: 600px; margin: 4rem auto; padding: 4rem 2rem; background: var(--bg-panel); border-radius: 12px; text-align: center; border: 1px solid var(--border-subtle);">
                        <i class="ph ph-check-circle" style="font-size: 5rem; color: #10b981; margin-bottom: 2rem;"></i>
                        <h2 style="font-size: 2rem; color: var(--text-primary);">Application Received!</h2>
                        <p style="color: var(--text-secondary); margin-top: 1rem; font-size: 1.1rem;">
                            Thank you, ${result.first_name || 'Candidate'}. Your resume has been successfully uploaded for the 
                            <strong style="color: var(--accent-primary);">${result.match_score || 0}% match score</strong>.
                        </p>
                        <p style="color: var(--text-muted); margin-top: 1rem;">We'll review your application and get back to you soon.</p>
                        <button onclick="window.location.href='/apply'" class="btn-outline" style="margin-top: 3rem; padding: 0.75rem 2rem;">Apply for another role</button>
                    </div>
                `;
                } else {
                    alert('Application submitted successfully!');
                }

            } catch (error) {
                console.error('Upload Error:', error);
                alert(`Failed to submit application: ${error.message}`);
                submitBtn.innerHTML = `Submit Application`;
                submitBtn.disabled = false;
            }
        });
    }
};
