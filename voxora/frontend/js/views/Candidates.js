import { Store } from '../core/store.js';

export default {
    title: "Candidate Management",
    subtitle: "Search, filter, and manage your talent pool.",

    view: async () => {
        let candidates = [];
        try {
            const response = await fetch('/api/v1/candidates/');
            if (response.ok) {
                const apiCandidates = await response.json();
                console.log("API Candidates received:", apiCandidates);
                if (Array.isArray(apiCandidates)) {
                    candidates = apiCandidates.map(c => ({
                        id: c.id,
                        name: `${c.first_name} ${c.last_name || ''}`.trim(),
                        role: c.current_title || "Applicant",
                        experience: `${c.experience_years || 0} years`,
                        status: c.stage || "applied",
                        matchScore: c.match_score || 0,
                        skills: c.skills ? c.skills.split(',') : [],
                        source: c.application_source || 'manual',
                        appliedViaLink: c.applied_via_link || false,
                        lastUpdated: c.updated_at ? c.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]
                    }));
                    console.log("Mapped candidates for UI:", candidates);
                    Store.state.candidates = candidates;
                } else {
                    console.error("API response is not an array:", apiCandidates);
                    candidates = Store.state.candidates || [];
                }
            } else {
                console.warn("Candidates API failed:", response.status);
                candidates = Store.state.candidates;
            }
        } catch (error) {
            console.error("Fetch candidates error:", error);
            candidates = Array.isArray(Store.state.candidates) ? Store.state.candidates : [];
        }

        return `
            <div class="card card-g-12">
                <div class="card-header" style="justify-content: space-between; align-items: center; display: flex;">
                    <div style="flex: 1; max-width: 400px; position: relative;">
                        <i class="ph ph-magnifying-glass" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary);"></i>
                        <input type="text" id="candidate-search" placeholder="Search candidates..." style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid var(--border-subtle); border-radius: 8px; background: rgba(0, 0, 0, 0.2); color: var(--text-primary);">
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-left: 1rem;">
                        <button class="filter-chip active" data-filter="all" style="padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid var(--border-subtle); background: var(--bg-panel); color: var(--text-secondary); cursor: pointer; font-size: 0.8rem;">All</button>
                        <button class="filter-chip" data-filter="public_link" style="padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid var(--border-subtle); background: var(--bg-panel); color: var(--text-secondary); cursor: pointer; font-size: 0.8rem;">Public Link</button>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <button id="btn-compare-candidates" class="btn-outline" style="padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--accent-secondary); color: var(--accent-secondary); background: transparent; flex-direction: row;">
                            <i class="ph ph-scales"></i> Compare
                        </button>
                        <button id="btn-generate-link" class="btn-outline" style="padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--accent-primary); color: var(--accent-primary); background: transparent; flex-direction: row;">
                            <i class="ph ph-link"></i> Generate Voxora Link
                        </button>
                        <button id="btn-upload-candidates" class="action-btn" style="padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; flex-direction: row;">
                            <i class="ph ph-upload-simple"></i> Upload Resume
                        </button>
                        <input type="file" id="resume-upload-input" accept=".pdf,.docx,.txt" style="display: none;">
                    </div>
                </div>

                <div style="overflow-x: auto; margin-top: 1.5rem;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr>
                                <th style="padding: 1rem; color: var(--text-secondary);">Name</th>
                                <th style="padding: 1rem; color: var(--text-secondary);">Match Score</th>
                                <th style="padding: 1rem; color: var(--text-secondary);">Skills</th>
                                <th style="padding: 1rem; color: var(--text-secondary);">Stage</th>
                                <th style="padding: 1rem; color: var(--text-secondary);">Action</th>
                            </tr>
                        </thead>
                        <tbody id="candidates-table-body">
                            ${candidates.map(candidate => `
                                <tr class="candidate-row" data-id="${candidate.id}" style="cursor: pointer; transition: background 0.2s;">
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--border-subtle);">
                                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                                            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-panel); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--accent-primary); font-size: 0.8rem;">
                                                ${candidate.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style="font-weight: 600; color: var(--text-primary);">${candidate.name}</div>
                                                <div style="font-size: 0.75rem; color: var(--text-secondary);">${candidate.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--border-subtle);">
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <div style="width: 100px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                                <div style="width: ${candidate.matchScore}%; height: 100%; background: ${candidate.matchScore >= 90 ? '#10b981' : (candidate.matchScore >= 75 ? '#f59e0b' : '#ef4444')};"></div>
                                            </div>
                                            <span style="font-weight: 600; font-size: 0.85rem; color: ${candidate.matchScore >= 75 ? 'var(--text-primary)' : '#ef4444'}">${candidate.matchScore}%</span>
                                        </div>
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--border-subtle);">
                                        <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
                                            ${candidate.skills ? (Array.isArray(candidate.skills) ? candidate.skills : candidate.skills.split(',')).slice(0, 3).map(skill => `
                                                <span style="font-size: 0.7rem; padding: 2px 6px; background: rgba(6, 182, 212, 0.1); color: var(--accent-primary); border-radius: 4px; border: 1px solid rgba(6, 182, 212, 0.2);">${skill.trim()}</span>
                                            `).join('') : ''}
                                        </div>
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--border-subtle);">
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <span style="font-size: 0.8rem; padding: 4px 10px; border-radius: 20px; background: ${candidate.status === 'hired' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; color: ${candidate.status === 'hired' ? '#10b981' : 'var(--text-secondary)'}; text-transform: capitalize;">
                                                ${candidate.status || 'New'}
                                            </span>
                                            ${candidate.source === 'public_link' ? `<i class="ph ph-link" style="color: #8b5cf6;" title="Applied via Public Link"></i>` : ''}
                                        </div>
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--border-subtle);">
                                        <button style="background: none; border: none; color: var(--text-muted); cursor: pointer;"><i class="ph ph-dots-three-vertical"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    afterRender: () => {
        // Row Click Navigation
        document.querySelectorAll('.candidate-row').forEach(row => {
            row.addEventListener('click', () => {
                const id = row.dataset.id;
                window.router.navigateTo(`/hr/candidates/${id}`);
            });
        });

        // Search & Filter Logic
        const filterRows = () => {
            const term = document.getElementById('candidate-search')?.value.toLowerCase() || '';
            const activeFilter = document.querySelector('.filter-chip.active')?.dataset.filter || 'all';

            document.querySelectorAll('.candidate-row').forEach(row => {
                const text = row.innerText.toLowerCase();
                const id = row.dataset.id;
                const candidate = Store.state.candidates.find(c => c.id == id);

                const matchesSearch = text.includes(term);
                const matchesFilter = activeFilter === 'all' || (candidate && candidate.source === activeFilter);

                row.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
            });
        };

        document.getElementById('candidate-search')?.addEventListener('input', filterRows);

        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.filter-chip').forEach(c => {
                    c.classList.remove('active');
                    c.style.background = 'var(--bg-panel)';
                    c.style.color = 'var(--text-secondary)';
                    c.style.borderColor = 'var(--border-subtle)';
                });
                chip.classList.add('active');
                chip.style.background = 'rgba(6, 182, 212, 0.1)';
                chip.style.color = 'var(--accent-primary)';
                chip.style.borderColor = 'var(--accent-primary)';
                filterRows();
            });
        });

        // Generate Link Modal
        document.getElementById('btn-generate-link')?.addEventListener('click', () => {
            alert("Voxora Upload Link Generated:\nhttps://voxora.hr/apply/acme-corp/job_123/unique_token_77");
        });

        // Compare Candidates Navigation
        document.getElementById('btn-compare-candidates')?.addEventListener('click', () => {
            window.router.navigateTo('/hr/candidates/compare');
        });

        // Upload Resume Logic
        const uploadBtn = document.getElementById('btn-upload-candidates');
        const fileInput = document.getElementById('resume-upload-input');

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // Show loading state
                const originalText = uploadBtn.innerHTML;
                uploadBtn.innerHTML = `<i class="ph ph-spinner ph-spin"></i> Uploading...`;
                uploadBtn.disabled = true;

                const formData = new FormData();
                formData.append('resume', file);

                try {
                    const response = await fetch('/api/v1/candidates/upload', {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
                    }

                    const newCandidate = await response.json();

                    // Map API response to Frontend Model
                    const mappedCandidate = {
                        id: newCandidate.id,
                        name: `${newCandidate.first_name} ${newCandidate.last_name}`,
                        role: newCandidate.current_title || "Applicant", // Fallback if title not parsed
                        experience: `${newCandidate.experience_years} years`,
                        status: newCandidate.stage || "applied",
                        matchScore: newCandidate.match_score || 0,
                        skills: newCandidate.skills || "",
                        source: newCandidate.application_source || "manual",
                        appliedViaLink: newCandidate.applied_via_link || false,
                        lastUpdated: new Date().toISOString().split('T')[0]
                    };

                    // Update Store and Reload View
                    Store.addCandidate(mappedCandidate);
                    alert(`Resume uploaded successfully! Match Score: ${mappedCandidate.matchScore}%`);
                    window.router.handleRoute(); // Reload current view

                } catch (error) {
                    console.error('Upload Error:', error);
                    alert(`Failed to upload resume: ${error.message}`);
                } finally {
                    uploadBtn.innerHTML = originalText;
                    uploadBtn.disabled = false;
                    fileInput.value = ''; // Reset input
                }
            });
        }
    }
};
