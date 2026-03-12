// SFIMP - Minimal Community Showcase JS

document.addEventListener('DOMContentLoaded', () => {
    initSmoothFade();
    initCardHoverEffects();
});

// Smooth fade-in on scroll
function initSmoothFade() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    // Observe community message
    const message = document.querySelector('.community-message');
    if (message) {
        message.style.opacity = '0';
        message.style.transform = 'translateY(20px)';
        message.style.transition = 'opacity 1s ease, transform 1s ease';
        observer.observe(message);
    }
    
    // Observe Instagram cards
    const cards = document.querySelectorAll('.insta-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
        observer.observe(card);
    });
}

// Add subtle hover glow effect
function initCardHoverEffects() {
    const cards = document.querySelectorAll('.insta-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.filter = 'brightness(1.1)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.filter = 'brightness(1)';
        });
    });
}

// Console signature
console.log('SFIMP - Music. Community. Vibes.');
