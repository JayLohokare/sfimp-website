// SFIMP - Mobile-First Website JS

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initScrollAnimations();
    initHorizontalSwipe();
    initBottomNav();
});

// Loading screen with logo
function initLoadingScreen() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = '<div class="loader-content"><img src="logo.png" alt="SFIMP Logo" class="loader-logo"></div>';
    document.body.appendChild(loader);
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(() => loader.remove(), 500);
        }, 800);
    });
}

// Scroll animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    // Animate sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
    
    // Animate cards
    const cards = document.querySelectorAll('.activity-card, .platform-card, .community-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
        observer.observe(card);
    });
}

// Horizontal swipe carousel for "What We Do"
function initHorizontalSwipe() {
    const track = document.querySelector('.activities-track');
    if (!track) return;
    
    // Touch/swipe support (native via CSS scroll-snap)
    // Add mouse drag support for desktop
    let isDown = false;
    let startX;
    let scrollLeft;
    
    track.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
        track.style.cursor = 'grabbing';
    });
    
    track.addEventListener('mouseleave', () => {
        isDown = false;
        track.style.cursor = 'grab';
    });
    
    track.addEventListener('mouseup', () => {
        isDown = false;
        track.style.cursor = 'grab';
    });
    
    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 2;
        track.scrollLeft = scrollLeft + walk;
    });
    
    // Update carousel dots based on scroll position
    track.addEventListener('scroll', () => {
        updateCarouselDots();
    });
}

function updateCarouselDots() {
    const track = document.querySelector('.activities-track');
    const dots = document.querySelector('.carousel-dots');
    if (!track || !dots) return;
    
    const cards = document.querySelectorAll('.activity-card');
    const scrollPos = track.scrollLeft;
    const cardWidth = cards[0]?.offsetWidth || 280;
    const activeIndex = Math.round(scrollPos / cardWidth);
    
    const dotsString = '○'.split('');
    dotsString[activeIndex] = '⬤';
    dots.textContent = dotsString.join(' ');
}

// Bottom navigation - scroll spy
function initBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('#home, #what-we-do, #videos, #instagram');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${id}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.5 });
    
    sections.forEach(section => observer.observe(section));
    
    // Smooth scroll for nav clicks
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Console signature
console.log('SFIMP - Music. Community. Vibes. 🎵');
