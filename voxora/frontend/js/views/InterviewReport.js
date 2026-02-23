import { Store } from '../core/store.js';

export default {
    title: "Interview Report",
    subtitle: "Detailed analysis and scoring of completed interview.",

    view: async (params) => {
        const id = params.id;
        // In a real app, fetch report data. For now, mock or use existing interview data.
        const interview = Store.state.interviews?.find(i => i.id == id) || { candidate: "Unknown", role: "Applicant", type: "Technical" };

        return `
            <div class="card card-g-12" style="margin-bottom: 2rem;">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="margin-bottom: 0.25rem;">${interview.candidate} - ${interview.type} Interview</h3>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">${new Date().toLocaleDateString()} • Duration: 45m</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 2rem; font-weight: 700; color: #10b981;">88/100</div>
                        <p style="color: var(--text-secondary); font-size: 0.8rem;">Overall Score</p>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                <!-- Left Column: Key Insights & Transcript -->
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    
                    <div class="card card-g-12">
                        <div class="card-header"><h4><i class="ph-bold ph-star"></i> Key Strengths</h4></div>
                        <ul style="padding: 1.5rem; list-style: none; display: flex; flex-direction: column; gap: 0.75rem;">
                            <li style="display: flex; gap: 0.75rem; align-items: start;">
                                <i class="ph-fill ph-check-circle" style="color: #10b981; margin-top: 2px;"></i>
                                <div>
                                    <strong>Technical Depth</strong>
                                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">Demonstrated deep understanding of asynchronous programming and event loops.</p>
                                </div>
                            </li>
                             <li style="display: flex; gap: 0.75rem; align-items: start;">
                                <i class="ph-fill ph-check-circle" style="color: #10b981; margin-top: 2px;"></i>
                                <div>
                                    <strong>Communication</strong>
                                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">Articulated complex concepts clearly and listened well to questions.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="card card-g-12">
                        <div class="card-header"><h4><i class="ph-bold ph-warning-circle"></i> Areas for Improvement</h4></div>
                         <ul style="padding: 1.5rem; list-style: none; display: flex; flex-direction: column; gap: 0.75rem;">
                            <li style="display: flex; gap: 0.75rem; align-items: start;">
                                <i class="ph-fill ph-circle" style="color: #f59e0b; margin-top: 2px;"></i>
                                <div>
                                    <strong>System Design at Scale</strong>
                                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">Struggled slightly with sharding strategies for high-write workloads.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                     <div class="card card-g-12">
                        <div class="card-header"><h4>Full Transcript</h4></div>
                        <div style="padding: 1.5rem; max-height: 300px; overflow-y: auto; font-size: 0.9rem; line-height: 1.6;">
                            <p style="margin-bottom: 0.5rem;"><strong style="color: #60a5fa;">Interviewer:</strong> Can you explain the difference between TCP and UDP?</p>
                            <p style="margin-bottom: 0.5rem;"><strong style="color: var(--text-primary);">Candidate:</strong> Sure, TCP is connection-oriented and ensures reliable delivery, while UDP is connectionless and faster but doesn't guarantee delivery.</p>
                            <p style="margin-bottom: 0.5rem;"><strong style="color: #60a5fa;">Interviewer:</strong> Great. When would you use one over the other?</p>
                            <p style="margin-bottom: 0.5rem;"><strong style="color: var(--text-primary);">Candidate:</strong> I'd use TCP for file transfers or emails where data integrity is crucial. UDP is better for live streaming or gaming where speed matters more than perfect transmission.</p>
                            <!-- More transcript lines would go here -->
                        </div>
                    </div>

                </div>

                <!-- Right Column: Skills & Recommendation -->
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    
                    <div class="card card-g-12">
                        <div class="card-header"><h4>Skill Assessment</h4></div>
                        <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                            <div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                                    <span>Problem Solving</span><span>9/10</span>
                                </div>
                                <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                    <div style="width: 90%; background: #3b82f6; height: 100%;"></div>
                                </div>
                            </div>
                             <div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                                    <span>Technical Knowledge</span><span>8.5/10</span>
                                </div>
                                <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                    <div style="width: 85%; background: #3b82f6; height: 100%;"></div>
                                </div>
                            </div>
                             <div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                                    <span>Communication</span><span>9/10</span>
                                </div>
                                <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                    <div style="width: 90%; background: #3b82f6; height: 100%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card card-g-12" style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2);">
                        <div class="card-header"><h4><i class="ph-bold ph-thumbs-up"></i> Hiring Recommendation</h4></div>
                        <div style="padding: 1.5rem; text-align: center;">
                            <h3 style="color: #10b981; margin-bottom: 0.5rem;">Strong Hire</h3>
                            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem;">The candidate exceeds expectations for this role level.</p>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <button class="action-btn" style="background: #10b981; color: white; border: none;">Proceed</button>
                                <button class="btn-outline" style="border-color: var(--text-muted); color: var(--text-muted);">Reject</button>
                            </div>
                        </div>
                    </div>

                    <button class="btn-outline" onclick="window.router.navigateTo('/hr/interviews')" style="width: 100%; border: none; color: var(--text-secondary); text-align: center;">
                        <i class="ph-bold ph-arrow-left"></i> Back to Interviews
                    </button>

                </div>
            </div>
        `;
    },

    afterRender: () => {
        // Any chart initialization or interactive elements for the report
    }
};
