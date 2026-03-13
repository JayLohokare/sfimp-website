// SFIMP - Modern Website JS

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initHoverAnimations();
    initInstagramPosts();
    initEvents();
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

// Load and display events from config
function initEvents() {
    const eventsContainer = document.getElementById('events-container');
    if (!eventsContainer || typeof eventsConfig === 'undefined') {
        console.warn('Events config not found');
        return;
    }

    // Filter and sort events - show upcoming events first
    const now = new Date();
    const upcomingEvents = eventsConfig
        .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= now || event.isNext;
        })
        .sort((a, b) => {
            // Sort by isNext first, then by date
            if (a.isNext && !b.isNext) return -1;
            if (!a.isNext && b.isNext) return 1;
            return new Date(a.date) - new Date(b.date);
        });

    if (upcomingEvents.length === 0) {
        eventsContainer.innerHTML = '<p class="no-events">No upcoming events scheduled. Check back soon!</p>';
        return;
    }

    // Display events
    eventsContainer.innerHTML = upcomingEvents.map(event => {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        return `
            <div class="event-card ${event.isNext ? 'next-event' : ''}">
                ${event.isNext ? '<div class="next-event-badge">Next Event</div>' : ''}
                <div class="event-date">
                    <div class="event-date-day">${eventDate.getDate()}</div>
                    <div class="event-date-month">${eventDate.toLocaleDateString('en-US', { month: 'short' })}</div>
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-details">
                        <div class="event-detail-item">
                            <svg viewBox="0 0 24 24" fill="currentColor" class="event-icon">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            <span>${event.location}</span>
                        </div>
                        <div class="event-detail-item">
                            <svg viewBox="0 0 24 24" fill="currentColor" class="event-icon">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                            </svg>
                            <span>${event.time}</span>
                        </div>
                    </div>
                    ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                    <a href="${event.url}" target="_blank" class="event-link" rel="noopener noreferrer">
                        RSVP / Learn More
                        <svg viewBox="0 0 24 24" fill="currentColor" class="event-link-icon">
                            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                        </svg>
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

// Console signature
console.log('SFIMP - Music. Community. Vibes. 🎵');
