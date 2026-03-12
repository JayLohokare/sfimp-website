// SFIMP Website - Interactive JavaScript
// Material Design UI with smooth animations and dynamic features

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initNavbar();
    initScrollAnimations();
    initCounterAnimations();
    initTiltEffects();
    initSmoothScroll();
    initTypingEffect();
    initParticleBackground();
});

// Navbar scroll effect
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Add fade-in class to all cards and sections
    const animateElements = document.querySelectorAll('.vision-card, .pod-card, .event-card, .post-card, .role-card, .stat');
    animateElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// Animated counter for stats
function initCounterAnimations() {
    const stats = document.querySelectorAll('.stat-number, .hero-stat');
    
    const animateCounter = (element) => {
        const text = element.textContent;
        const hasPlus = text.includes('+');
        const hasK = text.includes('K');
        
        // Extract numeric value
        let numeric = text.replace(/[^0-9.]/g, '');
        let num = parseFloat(numeric);
        
        if (isNaN(num)) return;
        
        // Handle K suffix
        if (hasK) num = num * 1000;
        
        let current = 0;
        const increment = num / 50;
        const duration = 2000;
        const stepTime = duration / 50;
        
        const counter = setInterval(() => {
            current += increment;
            
            if (current >= num) {
                current = num;
                clearInterval(counter);
            }
            
            // Format display
            let display;
            if (hasK && num >= 1000) {
                display = (current / 1000).toFixed(0) + 'K';
            } else if (hasPlus) {
                display = Math.floor(current) + '+';
            } else {
                display = Math.floor(current).toString();
            }
            
            element.textContent = display;
        }, stepTime);
    };
    
    // Use IntersectionObserver for stats
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => statsObserver.observe(stat));
}

// 3D tilt effect on cards
function initTiltEffects() {
    const cards = document.querySelectorAll('.vision-card, .pod-card, .event-card, .post-card, .role-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
        });
    });
}

// Smooth scroll for navigation
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Typing effect for hero tagline
function initTypingEffect() {
    const tagline = document.querySelector('.hero .tagline');
    if (!tagline) return;
    
    const text = tagline.textContent;
    tagline.textContent = '';
    tagline.style.borderRight = '2px solid white';
    tagline.style.display = 'inline-block';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            tagline.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        } else {
            tagline.style.borderRight = 'none';
        }
    };
    
    setTimeout(typeWriter, 1000);
}

// Particle background effect
function initParticleBackground() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    // Create particle container
    const particleContainer = document.createElement('div');
    particleContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
        z-index: 0;
    `;
    
    hero.insertBefore(particleContainer, hero.firstChild);
    
    // Create particles
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        createParticle(particleContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    const size = Math.random() * 5 + 2;
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3});
        border-radius: 50%;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation: floatParticle ${Math.random() * 10 + 10}s linear infinite;
        animation-delay: ${Math.random() * 5}s;
    `;
    
    container.appendChild(particle);
    
    // Add keyframes dynamically
    if (!document.getElementById('particle-animation')) {
        const style = document.createElement('style');
        style.id = 'particle-animation';
        style.textContent = `
            @keyframes floatParticle {
                0% {
                    transform: translateY(0) translateX(0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Parallax effect for sections
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero, .section.alt-bg');
        
        parallaxElements.forEach((el, index) => {
            const speed = 0.3 + (index * 0.1);
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Dynamic gradient animation
function animateGradient() {
    const gradients = document.querySelectorAll('.vision-card::before, .pod-card::after');
    
    let hue = 0;
    setInterval(() => {
        hue = (hue + 1) % 360;
        gradients.forEach(gradient => {
            gradient.style.background = `linear-gradient(${hue}deg, hsl(${hue}, 70%, 60%), hsl(${hue + 30}, 70%, 60%))`;
        });
    }, 50);
}

// Music note float animation
function createMusicNotes() {
    const musicSection = document.querySelector('#music');
    if (!musicSection) return;
    
    const notes = ['♪', '♫', '♩', '♬'];
    
    setInterval(() => {
        const note = document.createElement('div');
        note.textContent = notes[Math.floor(Math.random() * notes.length)];
        note.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 20 + 15}px;
            color: rgba(99, 102, 241, ${Math.random() * 0.3 + 0.2});
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: floatNote ${Math.random() * 5 + 5}s linear infinite;
            pointer-events: none;
            z-index: 0;
        `;
        
        musicSection.style.position = 'relative';
        musicSection.appendChild(note);
    }, 2000);
}

// Add dynamic styles for music notes
const musicNoteStyle = document.createElement('style');
musicNoteStyle.textContent = `
    @keyframes floatNote {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        100% {
            transform: translateY(-200px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(musicNoteStyle);

// Ripple effect on buttons
function initRippleEffect() {
    const buttons = document.querySelectorAll('.cta-button, .social-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add ripple keyframes
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
}

// Initialize ripple effect
initRippleEffect();

// Mouse trail effect
function initMouseTrail() {
    let coords = { x: 0, y: 0 };
    const circles = document.querySelectorAll('.circle');
    
    // Create trail circles
    for (let i = 0; i < 20; i++) {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        circle.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s;
            opacity: 0;
        `;
        document.body.appendChild(circle);
    }
    
    const newCircles = document.querySelectorAll('.circle');
    let currentCircle = 0;
    
    window.addEventListener('mousemove', (e) => {
        coords.x = e.clientX;
        coords.y = e.clientY;
        
        newCircles[currentCircle].style.left = coords.x + 'px';
        newCircles[currentCircle].style.top = coords.y + 'px';
        newCircles[currentCircle].style.opacity = '1';
        newCircles[currentCircle].style.transform = 'scale(1)';
        
        currentCircle = (currentCircle + 1) % newCircles.length;
        
        setTimeout(() => {
            newCircles[currentCircle].style.opacity = '0';
            newCircles[currentCircle].style.transform = 'scale(0.5)';
        }, 100);
    });
}

// Initialize mouse trail
initMouseTrail();

// Console easter egg
console.log(`
    🎵 SF Indian Music Project 🎵
    ════════════════════════════
    Built with ❤️ and Material Design
    North Star: Largest Asian music group in Bay Area by 2028
    
    🎸 Want to join? Contact: sfindianmusicproject@gmail.com
    📱 Follow: @sfindianmusicproject
`);

// Performance optimization: Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.onload = () => img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
lazyLoadImages();

// Add loaded class styling
const lazyLoadStyle = document.createElement('style');
lazyLoadStyle.textContent = `
    img {
        transition: opacity 0.3s ease;
        opacity: 0;
    }
    img.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(lazyLoadStyle);

// Dynamic year update in footer
function updateFooterYear() {
    const footerYear = document.querySelector('footer p');
    if (footerYear) {
        const currentYear = new Date().getFullYear();
        footerYear.innerHTML = footerYear.innerHTML.replace(/20\d{2}/g, currentYear.toString());
    }
}

updateFooterYear();

// Add loading screen
function addLoadingScreen() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-music-note">♪</div>
            <p>Loading SFIMP Experience...</p>
        </div>
    `;
    
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        transition: opacity 0.5s ease, visibility 0.5s ease;
    `;
    
    const loaderContent = loader.querySelector('.loader-content');
    loaderContent.style.cssText = `
        text-align: center;
        color: white;
        animation: pulse 1.5s ease-in-out infinite;
    `;
    
    const musicNote = loader.querySelector('.loader-music-note');
    musicNote.style.cssText = `
        font-size: 4rem;
        display: block;
        margin-bottom: 1rem;
        animation: spin 2s linear infinite;
    `;
    
    document.body.appendChild(loader);
    
    // Add animations
    const loaderStyle = document.createElement('style');
    loaderStyle.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(0.95); }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(loaderStyle);
    
    // Remove loader when page is fully loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(() => loader.remove(), 500);
        }, 1000);
    });
}

// Initialize loading screen
addLoadingScreen();

// Add dynamic meta tags for SEO
function addSEOTags() {
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'SF Indian Music Project - Bay Area\'s premier Asian music community. Join 50+ musicians, 150+ videos, and growing!';
    document.head.appendChild(metaDescription);
    
    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content = 'SF Indian Music, Bay Area Music, Asian Music, Bollywood, Classical, Fusion, Live Music, Music Community';
    document.head.appendChild(metaKeywords);
}

addSEOTags();

// Social media share functionality
function initSocialShare() {
    // Add share buttons dynamically if needed
    const shareData = {
        title: 'SF Indian Music Project',
        text: 'Check out SFIMP - Bay Area\'s largest Asian music community!',
        url: window.location.href
    };
    
    // Can be triggered from a share button
    window.shareSite = () => {
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareData.url);
            alert('Link copied to clipboard!');
        }
    };
}

initSocialShare();

// Track scroll depth for analytics
function trackScrollDepth() {
    let maxScroll = 0;
    
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / document.body.scrollHeight) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
        }
        
        // Could send to analytics
        // console.log(`Scroll depth: ${maxScroll}%`);
    });
}

trackScrollDepth();

// Add keyboard navigation
function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        // Press 'H' to go home
        if (e.key.toLowerCase() === 'h' && e.ctrlKey) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Press 'G' for get involved section
        if (e.key.toLowerCase() === 'g' && e.ctrlKey) {
            const joinSection = document.querySelector('#join');
            if (joinSection) {
                joinSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

initKeyboardNav();

console.log('✨ SFIMP Website fully loaded and ready to rock! 🎸');
