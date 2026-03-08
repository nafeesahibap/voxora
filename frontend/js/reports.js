let currentFileId = null;

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFile = document.getElementById('removeFile');
const analysisControls = document.getElementById('analysisControls');
const resultsSection = document.getElementById('resultsSection');
const loader = document.getElementById('loader');

// Drag and drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
});

dropZone.addEventListener('drop', handleDrop, false);
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

async function handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];

    // Validate file type
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(extension)) {
        alert('Please upload a PDF, DOCX, or TXT file.');
        return;
    }

    fileName.textContent = file.name;
    fileSize.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    // Show loading state for upload
    dropZone.style.display = 'none';
    fileInfo.style.display = 'flex';

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/v1/reports/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        currentFileId = data.file_id;

        // Show analysis controls
        analysisControls.style.display = 'grid';
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('File upload failed. Please try again.');
        resetUI();
    }
}

removeFile.addEventListener('click', () => {
    resetUI();
});

function resetUI() {
    currentFileId = null;
    currentFileName = null;
    dropZone.style.display = 'flex';
    fileInfo.style.display = 'none';
    analysisControls.style.display = 'none';
    resultsSection.style.display = 'none';
    resultsSection.innerHTML = '';
}

async function runAnalysis(type) {
    if (!currentFileId) return;

    // Clear previous results and show loader
    resultsSection.style.display = 'none';
    loader.style.display = 'flex';

    try {
        const response = await fetch(`/api/v1/reports/analyze/${currentFileId}/${type}`);
        if (!response.ok) throw new Error('Analysis failed');

        const data = await response.json();
        renderResults(type, data);
    } catch (error) {
        console.error('Analysis error:', error);
        alert('Analysis failed. Please try again.');
    } finally {
        loader.style.display = 'none';
    }
}

function renderResults(type, data) {
    resultsSection.innerHTML = '';
    resultsSection.style.display = 'block';

    const card = document.createElement('div');
    card.className = 'insight-card';

    let html = `<h2 style="color: var(--accent-primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="${getIcon(type)}"></i> ${data.title}
                </h2>`;

    if (type === 'summary') {
        html += `<p style="line-height: 1.8; margin-bottom: 2rem; font-size: 1.1rem;">${data.content}</p>`;
        html += `<h4 style="margin-bottom: 1rem;">Key Highlights</h4>`;
        html += `<ul style="list-style: none; padding: 0;">`;
        data.highlights.forEach(h => {
            html += `<li style="margin-bottom: 0.75rem; display: flex; gap: 0.75rem;">
                        <i class="ph ph-check-circle" style="color: var(--accent-primary); margin-top: 0.25rem;"></i>
                        <span>${h}</span>
                    </li>`;
        });
        html += `</ul>`;
    } else if (type === 'metrics') {
        html += `<div class="metrics-grid">`;
        data.metrics.forEach(m => {
            html += `<div class="metric-item">
                        <div class="metric-value">${m.value}</div>
                        <div class="metric-label">${m.label}</div>
                    </div>`;
        });
        html += `</div>`;
    } else if (type === 'alerts') {
        data.alerts.forEach(a => {
            html += `<div class="alert-item">
                        <i class="ph ph-warning-octagon" style="font-size: 1.5rem;"></i>
                        <span>${a}</span>
                    </div>`;
        });
    } else if (type === 'demand') {
        data.insights.forEach(i => {
            html += `<div class="demand-item">
                        <i class="ph ph-trend-up" style="font-size: 1.5rem;"></i>
                        <span>${i}</span>
                    </div>`;
        });
    }

    card.innerHTML = html;
    resultsSection.appendChild(card);
}

function getIcon(type) {
    switch (type) {
        case 'summary': return 'ph ph-article-ny-times';
        case 'metrics': return 'ph ph-chart-bar';
        case 'alerts': return 'ph ph-warning-octagon';
        case 'demand': return 'ph ph-trend-up';
        default: return 'ph ph-info';
    }
}
