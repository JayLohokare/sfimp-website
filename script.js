// SFIMP - Minimal Community Showcase JS

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initSmoothFade();
});

// Loading screen
function initLoadingScreen() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = '<span class="loader-music-note">♪</span>';
    document.body.appendChild(loader);
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(() => loader.remove(), 500);
        }, 600);
    });
}

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
}

// Console signature
console.log('SFIMP - Music. Community. Vibes.');
