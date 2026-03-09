let currentFileId = null;
let currentColumns = [];
let myChart = null;

const BASE_URL = "http://127.0.0.1:8000/api/v1/data-intelligence";

async function fetchColumns(file_id) {
    try {
        const response = await fetch(`${BASE_URL}/summary/${file_id}`);
        const data = await response.json();
        if (data.column_info) {
            currentColumns = data.column_info.map(c => c.name);
        }
    } catch (e) {
        console.error("Error fetching columns", e);
    }
}

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput");
    const uploadStatus = document.getElementById("uploadStatus");
    const featureButtons = document.getElementById("featureButtons");
    const resultCard = document.getElementById("resultCard");

    if (!fileInput.files.length) {
        uploadStatus.innerText = "Please upload a CSV file.";
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    uploadStatus.innerText = "Uploading and initializing...";
    featureButtons.style.display = "none";
    resultCard.style.display = "none";

    try {
        const response = await fetch(`${BASE_URL}/upload`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            uploadStatus.innerText = `Error: ${err.detail || 'Upload failed'}`;
            return;
        }

        const data = await response.json();
        currentFileId = data.file_id;
        uploadStatus.innerText = "File successfully uploaded. Select an action below.";
        featureButtons.style.display = "flex";

        // Fetch columns in background for visualization
        currentColumns = [];
        fetchColumns(currentFileId);

    } catch (error) {
        uploadStatus.innerText = "Backend connection failed.";
        console.error(error);
    }
});

function showResultCard(title) {
    const card = document.getElementById("resultCard");
    const titleEl = document.getElementById("resultTitle");
    const contentEl = document.getElementById("resultContent");

    card.style.display = "block";
    titleEl.innerText = title;
    contentEl.innerHTML = "<div style='color: var(--text-muted);'>Loading...</div>";

    if (myChart) {
        myChart.destroy();
        myChart = null;
    }

    return contentEl;
}

document.getElementById("btnSummary").addEventListener("click", async () => {
    if (!currentFileId) return;
    const contentEl = showResultCard("AI Summary");

    try {
        const response = await fetch(`${BASE_URL}/summary/${currentFileId}`);
        if (!response.ok) throw new Error("Failed to get summary");

        const data = await response.json();

        let html = '';
        if (data.description) {
            html += `
            <div style="background: rgba(139, 92, 246, 0.1); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-accent); margin-bottom: 2rem;">
                <h4 style="color:var(--accent-primary); margin-bottom: 0.5rem; display:flex; align-items:center; gap:0.5rem;"><i class="ph-fill ph-sparkle"></i> Dataset Intelligence</h4>
                <p style="color:var(--text-secondary); line-height: 1.6; font-size: 0.95rem; margin:0;">${data.description}</p>
            </div>
            `;
        }

        html += `
            <div style="display:flex; gap:2rem; margin-bottom: 1.5rem;">
                <div class="stat-item">
                    <h2 style="color:var(--accent-primary)">${data.rows}</h2>
                    <span>TOTAL ROWS</span>
                </div>
                <div class="stat-item">
                    <h2 style="color:var(--accent-secondary)">${data.columns}</h2>
                    <span>TOTAL COLUMNS</span>
                </div>
            </div>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Column Name</th>
                        <th>Data Type</th>
                        <th>Missing Values</th>
                        <th>Mean</th>
                        <th>Median</th>
                        <th>Std Dev</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.column_info.forEach(col => {
            html += `
                <tr>
                    <td>${col.name}</td>
                    <td>${col.type}</td>
                    <td style="color:${col.missing > 0 ? '#ef4444' : 'inherit'}">${col.missing}</td>
                    <td>${col.mean !== null && col.mean !== undefined ? col.mean.toFixed(2) : '-'}</td>
                    <td>${col.median !== null && col.median !== undefined ? col.median.toFixed(2) : '-'}</td>
                    <td>${col.std !== null && col.std !== undefined ? col.std.toFixed(2) : '-'}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        contentEl.innerHTML = html;

    } catch (e) {
        contentEl.innerHTML = `<span style="color:#ef4444">Error: ${e.message}</span>`;
    }
});

document.getElementById("btnClean").addEventListener("click", async () => {
    if (!currentFileId) return;
    const contentEl = showResultCard("Data Cleaning");

    try {
        const response = await fetch(`${BASE_URL}/clean/${currentFileId}`, { method: 'POST' });
        if (!response.ok) throw new Error("Failed to clean data");

        const data = await response.json();

        let html = `
            <div style="display:flex; gap:1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                <div style="background: rgba(6,182,212,0.1); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-accent);">
                    <strong style="color:var(--accent-primary)">Duplicates Removed:</strong> ${data.report.duplicates_removed}
                </div>
                <div style="background: rgba(59,130,246,0.1); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                    <strong style="color:var(--accent-secondary)">Missing Values Handled:</strong> ${data.report.missing_values_handled}
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                    <strong>Final Rows:</strong> ${data.report.final_rows}
                </div>
            </div>
            
            <h4 style="margin-bottom: 0.5rem; color: var(--text-primary)">Cleaned Data Preview (Top 10 rows)</h4>
        `;

        if (data.preview && data.preview.length > 0) {
            const cols = Object.keys(data.preview[0]);
            html += `<div style="overflow-x:auto;"><table class="data-table"><thead><tr>`;
            cols.forEach(c => html += `<th>${c}</th>`);
            html += `</tr></thead><tbody>`;

            data.preview.forEach(row => {
                html += `<tr>`;
                cols.forEach(c => html += `<td>${row[c] !== null ? row[c] : ''}</td>`);
                html += `</tr>`;
            });
            html += `</tbody></table></div>`;
        } else {
            html += `<div>No data available</div>`;
        }

        contentEl.innerHTML = html;

    } catch (e) {
        contentEl.innerHTML = `<span style="color:#ef4444">Error: ${e.message}</span>`;
    }
});

document.getElementById("btnVisualize").addEventListener("click", () => {
    if (!currentFileId) return;
    const contentEl = showResultCard("Data Visualization");

    let optionsHtml = currentColumns.map(c => `<option value="${c}">${c}</option>`).join('');
    if (!optionsHtml) optionsHtml = `<option value="">(Loading columns...)</option>`;

    let html = `
        <div class="neon-form" style="display:flex; gap:1rem; align-items:flex-end; flex-wrap:wrap; margin-bottom: 2rem;">
            <div style="flex:1; min-width: 150px;">
                <label style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.2rem; display:block;">Chart Type</label>
                <select id="vizType" style="width:100%; padding:0.8rem; border-radius:var(--radius-md); background:var(--bg-panel); color:var(--text-primary); border:1px solid var(--border-subtle);">
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="scatter">Scatter Plot</option>
                    <option value="histogram">Histogram</option>
                    <option value="pie">Pie Chart</option>
                </select>
            </div>
            <div style="flex:1; min-width: 150px;">
                <label style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.2rem; display:block;">X-Axis Column</label>
                <select id="vizX" style="width:100%; padding:0.8rem; border-radius:var(--radius-md); background:var(--bg-panel); color:var(--text-primary); border:1px solid var(--border-subtle);">
                    ${optionsHtml}
                </select>
            </div>
            <div style="flex:1; min-width: 150px;" id="vizYContainer">
                <label id="vizYLabel" style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.2rem; display:block;">Y-Axis Column (Numeric or Auto)</label>
                <select id="vizY" style="width:100%; padding:0.8rem; border-radius:var(--radius-md); background:var(--bg-panel); color:var(--text-primary); border:1px solid var(--border-subtle);">
                    <option value="">(None / Auto)</option>
                    ${optionsHtml}
                </select>
            </div>
            <div>
                <button id="btnGenerateViz" class="neon-btn" style="margin-top:0;">Generate</button>
            </div>
        </div>
        <div id="chartError" style="color:#ef4444; margin-bottom:1rem; display:none;"></div>
        <div style="position: relative; height: 400px; width: 100%;">
            <canvas id="vizCanvas"></canvas>
        </div>
    `;

    contentEl.innerHTML = html;

    // Toggle Y axis visibility based on chart type
    const toggleY = () => {
        const type = document.getElementById("vizType").value;
        const yContainer = document.getElementById("vizYContainer");
        const yLabel = document.getElementById("vizYLabel");

        if (type === 'histogram' || type === 'pie') {
            yContainer.style.display = 'none';
        } else {
            yContainer.style.display = 'block';
            if (yLabel) {
                yLabel.innerText = type === 'scatter' ? 'Y-Axis Column (Numeric)' : 'Y-Axis Column (Numeric or Auto)';
            }
        }
    };
    document.getElementById("vizType").addEventListener("change", toggleY);
    toggleY();

    // Auto-fetch if columns were empty
    if (currentColumns.length === 0) {
        fetchColumns(currentFileId).then(() => {
            const freshOpts = currentColumns.map(c => `<option value="${c}">${c}</option>`).join('');
            document.getElementById("vizX").innerHTML = freshOpts;
            document.getElementById("vizY").innerHTML = `<option value="">(None / Auto)</option>` + freshOpts;
        });
    }

    document.getElementById("btnGenerateViz").addEventListener("click", async () => {
        const chartType = document.getElementById("vizType").value;
        const xCol = document.getElementById("vizX").value;
        const yCol = document.getElementById("vizY").value;
        const errDiv = document.getElementById("chartError");
        errDiv.style.display = "none";

        if (!xCol) {
            errDiv.innerText = "Please select X-Axis column.";
            errDiv.style.display = "block";
            return;
        }

        const payload = { chart_type: chartType, x_col: xCol, y_col: yCol };

        try {
            const response = await fetch(`${BASE_URL}/visualize/${currentFileId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || "Visualization failed");
            }

            renderChart(chartType, data);

        } catch (e) {
            errDiv.innerText = `Error: ${e.message}`;
            errDiv.style.display = "block";
        }
    });
});

function renderChart(type, data) {
    const ctx = document.getElementById("vizCanvas").getContext("2d");
    if (myChart) {
        myChart.destroy();
    }

    const themeColors = [
        'rgba(6, 182, 212, 0.7)',  // cyan
        'rgba(59, 130, 246, 0.7)', // blue
        'rgba(139, 92, 246, 0.7)', // purple
        'rgba(236, 72, 153, 0.7)', // pink
        'rgba(245, 158, 11, 0.7)'  // amber
    ];

    const borderColors = [
        'rgb(6, 182, 212)',
        'rgb(59, 130, 246)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)',
        'rgb(245, 158, 11)'
    ];

    let chartConfig = {
        type: type === 'histogram' ? 'bar' : type,
        data: {
            labels: data.labels || [],
            datasets: data.datasets.map((ds, i) => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: (type === 'pie') ? themeColors : themeColors[i % themeColors.length],
                borderColor: (type === 'pie') ? borderColors : borderColors[i % borderColors.length],
                borderWidth: 1,
                tension: 0.3, // for line
                fill: type === 'line' ? false : true
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#f1f5f9' }
                }
            },
            scales: (type === 'pie') ? {} : {
                x: {
                    type: type === 'scatter' ? 'linear' : 'category',
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                y: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            }
        }
    };

    if (type === 'histogram') {
        // Remove gap between bars for histogram look
        chartConfig.options.scales.x.categoryPercentage = 1.0;
        chartConfig.options.scales.x.barPercentage = 1.0;
    }

    myChart = new Chart(ctx, chartConfig);
}


