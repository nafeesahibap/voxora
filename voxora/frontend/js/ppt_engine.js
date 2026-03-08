class PPTGenerator {
    constructor() {
        this.slides = [];
        this.currentSlide = 0;
        this.viewer = document.querySelector('.ppt-viewer');
        this.slideContainer = document.querySelector('.slides-wrapper');
        this.progressOverlay = document.querySelector('.progress-overlay');
        this.progressText = document.querySelector('.progress-text');
    }

    async generate(topic) {
        if (!topic) return;

        // Reset
        this.slides = [];
        this.currentSlide = 0;
        this.slideContainer.innerHTML = '';
        this.viewer.classList.add('active');
        this.progressOverlay.style.display = 'flex';

        // Simulate AI Steps
        const steps = [
            "Analyzing Topic...",
            "Structuring Narrative...",
            "Designing Layouts...",
            "Generating Graphics...",
            "Finalizing Deck..."
        ];

        for (const step of steps) {
            this.progressText.textContent = step;
            await new Promise(r => setTimeout(r, 800)); // Simulate delay
        }

        // Generate Content (Mock)
        this.createSlides(topic);

        this.progressOverlay.style.display = 'none';
        this.renderSlide(0);
        this.updateControls();
    }

    createSlides(topic) {
        // Slide 1: Title
        this.slides.push({
            type: 'title',
            title: topic,
            subtitle: 'Strategic Overview & Analysis'
        });

        // Slide 2: Agenda
        this.slides.push({
            type: 'list',
            title: 'Agenda',
            items: [
                'Current Market Landscape',
                'Key Performance Indicators',
                'Strategic Opportunities',
                'Next Steps & Roadmap'
            ]
        });

        // Slide 3: Analysis
        this.slides.push({
            type: 'list',
            title: 'Key Insights',
            items: [
                'Growth projected at 15% YoY',
                'Customer retention stable at 92%',
                'New vertical expansion recommended'
            ]
        });

        // Slide 4: Conclusion
        this.slides.push({
            type: 'title',
            title: 'Thank You',
            subtitle: 'Questions & Discussion'
        });
    }

    renderSlide(index) {
        const slideData = this.slides[index];
        const slideEl = document.createElement('div');
        slideEl.className = 'slide active';
        slideEl.style.animation = 'fade-in-up 0.5s ease';

        if (slideData.type === 'title') {
            slideEl.classList.add('slide-title-page');
            slideEl.innerHTML = `
                <h1 class="slide-title">${slideData.title}</h1>
                <p class="slide-subtitle">${slideData.subtitle}</p>
            `;
        } else if (slideData.type === 'list') {
            slideEl.classList.add('slide-content');
            const listItems = slideData.items.map(item => `<li>${item}</li>`).join('');
            slideEl.innerHTML = `
                <h2>${slideData.title}</h2>
                <ul class="slide-list">
                    ${listItems}
                </ul>
            `;
        }

        this.slideContainer.innerHTML = '';
        this.slideContainer.appendChild(slideEl);
    }

    next() {
        if (this.currentSlide < this.slides.length - 1) {
            this.currentSlide++;
            this.renderSlide(this.currentSlide);
        }
    }

    prev() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.renderSlide(this.currentSlide);
        }
    }

    updateControls() {
        // Could add logic to disable buttons here
    }
}

// Global hook
window.pptEngine = new PPTGenerator();

function startGeneration() {
    const topic = document.getElementById('pptPrompt').value;
    if (topic) window.pptEngine.generate(topic);
}
