// SFIMP - Modern Website JS

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initHoverAnimations();
    initInstagramPosts();
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

// Hover animations only - no scroll-based hiding
function initHoverAnimations() {
    const cards = document.querySelectorAll('.activity-card, .video-card, .insta-card, .community-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });
    });
}

// Fetch and display Instagram posts
async function initInstagramPosts() {
    const instaCards = document.querySelectorAll('.insta-card[data-instagram-url]');
    
    instaCards.forEach(async (card) => {
        const postUrl = card.getAttribute('data-instagram-url');
        const imageContainer = card.querySelector('.insta-image-container');
        const placeholder = card.querySelector('.insta-image-placeholder');
        const image = card.querySelector('.insta-image');
        
        try {
            // Try direct Instagram oEmbed API first (works on GitHub Pages)
            const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(postUrl)}&omitscript=true`;
            let response = await fetch(oembedUrl);
            
            // If direct access fails, try with CORS proxy as fallback
            if (!response.ok) {
                const proxyUrl = 'https://api.allorigins.win/raw?url=';
                response = await fetch(proxyUrl + encodeURIComponent(oembedUrl));
            }
            
            if (!response.ok) {
                throw new Error('Failed to fetch Instagram post');
            }
            
            const data = await response.json();
            
            if (data.thumbnail_url) {
                image.src = data.thumbnail_url;
                image.alt = data.title || 'Instagram Post';
                image.style.display = 'block';
                
                image.onload = () => {
                    imageContainer.classList.add('loaded');
                };
                
                image.onerror = () => {
                    console.error('Failed to load Instagram image');
                    // Keep placeholder visible on image load error
                };
            }
        } catch (error) {
            console.error('Error fetching Instagram post:', error);
            // Keep placeholder visible on error - graceful degradation
        }
    });
}

// Console signature
console.log('SFIMP - Music. Community. Vibes. 🎵');
