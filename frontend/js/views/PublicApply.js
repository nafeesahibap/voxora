export default {
    title: "Apply to Acme Corp",
    subtitle: "Complete your application in seconds.",

    view: async () => {
        return `
            <div style="max-width: 600px; margin: 4rem auto; padding: 2rem; background: var(--bg-panel); border-bottom: 4px solid var(--minimal-accent); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; border: 1px solid var(--border-subtle);">
                <div style="margin-bottom: 2rem;">
                    <div style="font-weight: 800; font-size: 1.5rem; color: var(--minimal-accent); margin-bottom: 0.5rem;">VOXORA</div>
                    <h2 style="font-size: 1.75rem; color: var(--text-primary);">Apply for Senior Frontend Developer</h2>
                    <p style="color: var(--text-secondary); margin-top: 0.5rem;">at Acme Corporation</p>
                </div>

                <div id="drop-zone" style="border: 2px dashed var(--border-subtle); border-radius: 12px; padding: 4rem 2rem; background: rgba(255, 255, 255, 0.03); cursor: pointer; transition: all 0.2s;">
                    <i class="ph ph-cloud-arrow-up" style="font-size: 3rem; color: var(--minimal-accent); margin-bottom: 1rem;"></i>
                    <p style="font-weight: 500; font-size: 1.1rem; color: var(--text-primary);">Drag and drop your resume here</p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">PDF or DOCX (Max 5MB)</p>
                    <input type="file" id="resume-input" hidden accept=".pdf,.docx">
                </div>

                <div style="margin-top: 2rem;">
                    <button id="btn-submit-app" class="action-btn" style="width: 100%; padding: 1rem; border-radius: 8px; font-size: 1.1rem; font-weight: 600; opacity: 0.5; cursor: not-allowed;" disabled>
                        Submit Application
                    </button>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem;">
                        By submitting, you agree to our <a href="#" style="color: var(--minimal-accent);">Privacy Policy</a> and <a href="#" style="color: var(--minimal-accent);">Terms of Service</a>.
                    </p>
                </div>
            </div>
        `;
    },

    afterRender: () => {
        const dropZone = document.getElementById('drop-zone');
        const input = document.getElementById('resume-input');
        const submitBtn = document.getElementById('btn-submit-app');

        dropZone.addEventListener('click', () => input.click());

        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                dropZone.innerHTML = `
                    <i class="ph ph-file-pdf" style="font-size: 3rem; color: var(--minimal-success); margin-bottom: 1rem;"></i>
                    <p style="font-weight: 600; color: var(--text-primary);">${input.files[0].name}</p>
                    <p style="font-size: 0.85rem; color: var(--minimal-accent); margin-top: 0.5rem;">Click to change file</p>
                `;
                submitBtn.style.opacity = "1";
                submitBtn.style.cursor = "pointer";
                submitBtn.disabled = false;
            }
        });

        submitBtn.addEventListener('click', async () => {
            const file = input.files[0];
            if (!file) return;

            submitBtn.innerHTML = `<i class="ph ph-spinner ph-spin"></i> Processing...`;
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append('resume', file);

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
                if (container && container.parentElement) {
                    container.parentElement.innerHTML = `
                    <div style="max-width: 600px; margin: 4rem auto; padding: 4rem 2rem; background: var(--bg-panel); border-radius: 12px; text-align: center; border: 1px solid var(--border-subtle);">
                        <i class="ph ph-check-circle" style="font-size: 5rem; color: #10b981; margin-bottom: 2rem;"></i>
                        <h2 style="font-size: 2rem; color: var(--text-primary);">Application Received!</h2>
                        <p style="color: var(--text-secondary); margin-top: 1rem; font-size: 1.1rem;">
                            Thank you, ${result.first_name}. Your resume has been uploaded and analyzed with a 
                            <strong style="color: var(--accent-primary);">${result.match_score}% match score</strong>.
                        </p>
                        <button onclick="window.location.href='/apply'" class="btn-outline" style="margin-top: 3rem; padding: 0.75rem 2rem;">Apply for another role</button>
                    </div>
                `;
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
