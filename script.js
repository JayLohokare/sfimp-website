// SFIMP - Minimal Community Showcase JS

document.addEventListener('DOMContentLoaded', () => {
    initSmoothFade();
    initInstagramPlaceholders();
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
}

// Add placeholders for Instagram embeds while they load
function initInstagramPlaceholders() {
    const embeds = document.querySelectorAll('.instagram-media');
    embeds.forEach((embed, i) => {
        embed.style.background = 'rgba(255, 255, 255, 0.05)';
        embed.style.borderRadius = '12px';
        embed.style.minHeight = '400px';
        embed.style.display = 'flex';
        embed.style.alignItems = 'center';
        embed.style.justifyContent = 'center';
        
        // Add subtle shimmer effect
        embed.style.position = 'relative';
        embed.style.overflow = 'hidden';
        
        const shimmer = document.createElement('div');
        shimmer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
        `;
        
        embed.appendChild(shimmer);
        
        // Add loading text
        const loadingText = document.createElement('div');
        loadingText.textContent = 'Loading post...';
        loadingText.style.cssText = `
            color: rgba(255, 255, 255, 0.4);
            font-size: 0.875rem;
            font-weight: 300;
            z-index: 1;
            position: relative;
        `;
        
        embed.insertBefore(loadingText, shimmer);
        
        // Remove placeholder when Instagram content loads
        const checkLoad = setInterval(() => {
            if (embed.querySelector('iframe')) {
                clearInterval(checkLoad);
                loadingText.remove();
                shimmer.remove();
                embed.style.background = 'transparent';
                embed.style.display = 'block';
            }
        }, 500);
    });
    
    // Add shimmer animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
    `;
    document.head.appendChild(style);
}

// Console signature
console.log('SFIMP - Music. Community. Vibes.');
