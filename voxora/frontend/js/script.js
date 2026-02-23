document.addEventListener('DOMContentLoaded', () => {
    // Parallax Effect for Hero
    const heroVisual = document.querySelector('.hero-visual');
    
    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 768 && heroVisual) {
            const x = (e.clientX - window.innerWidth / 2) * 0.02;
            const y = (e.clientY - window.innerHeight / 2) * 0.02;
            
            heroVisual.style.transform = `translate(${x}px, ${y}px)`;
        }
    });

    // Reveal on Scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Mobile Menu Toggle (Simple implementation)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
             // For a robust mobile menu, we'd toggle a class. 
             // Here we'll just alert for demo purposes or log.
             console.log('Mobile menu clicked');
        });
    }
});
