// SFIMP - Modern Website JS

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initHoverAnimations();
    initEvents();
    initYouTubeVideos();
    initHeroSlider();
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

// Hero background slider
function initHeroSlider() {
    const sliderContainer = document.getElementById('main-hero-slider');
    if (!sliderContainer || typeof epkImages === 'undefined') return;

    const validImages = epkImages.filter(img => img.match(/\.(jpg|jpeg|png|webp|gif)$/i));
    if (validImages.length === 0) return;

    const slides = [];
    validImages.forEach((imgName, index) => {
        const slide = document.createElement('div');
        slide.className = 'hero-slide';
        if (index === 0) slide.classList.add('active');
        slide.style.backgroundImage = `url('assets/epk/${imgName}')`;
        sliderContainer.appendChild(slide);
        slides.push(slide);
    });

    if (slides.length > 1) {
        let currentIndex = 0;
        setInterval(() => {
            slides[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % slides.length;
            slides[currentIndex].classList.add('active');
        }, 5000);
    }
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


// Load and display events from config
function initEvents() {
    const eventsContainer = document.getElementById('events-container');
    const eventsFilters = document.getElementById('events-filters');
    if (!eventsContainer || typeof eventsConfig === 'undefined') {
        console.warn('Events config not found');
        return;
    }

    // Set up filtering
    let showPastEvents = false;
    let selectedType = 'all';

    // Create filter UI
    if (eventsFilters) {
        const uniqueTypes = [...new Set(eventsConfig.map(e => e.type))];
        eventsFilters.innerHTML = `
            <div class="events-filter-group">
                <button class="filter-btn ${selectedType === 'all' ? 'active' : ''}" data-type="all">All Events</button>
                ${uniqueTypes.map(type => `
                    <button class="filter-btn" data-type="${type}">${type}</button>
                `).join('')}
            </div>
            <button class="toggle-past-btn" id="toggle-past-events">
                ${showPastEvents ? 'Hide' : 'Show'} Past Events
            </button>
        `;

        // Filter button handlers
        eventsFilters.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                eventsFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedType = btn.dataset.type;
                renderEvents();
            });
        });

        // Toggle past events handler
        const toggleBtn = document.getElementById('toggle-past-events');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                showPastEvents = !showPastEvents;
                toggleBtn.textContent = `${showPastEvents ? 'Hide' : 'Show'} Past Events`;
                renderEvents();
            });
        }
    }

    // Render events function
    function renderEvents() {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Pre-process events
        const processedEvents = eventsConfig.map(event => {
            // Robust local timezone parsing using raw integers
            const [year, month, day] = event.date.split('-');
            const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            eventDate.setHours(0, 0, 0, 0);
            return {
                ...event,
                parsedDate: eventDate,
                isUpcoming: eventDate >= now,
                isPast: eventDate < now,
                isNext: false
            };
        });

        // Identify the "next" event out of upcoming ones
        const upcomingEvents = processedEvents.filter(e => e.isUpcoming).sort((a,b) => a.parsedDate - b.parsedDate);
        if (upcomingEvents.length > 0) {
            upcomingEvents[0].isNext = true;
        }

        let filteredEvents = processedEvents.filter(event => {
            // Filter by date
            if (!showPastEvents && event.isPast) {
                return false;
            }
            
            // Filter by type
            if (selectedType !== 'all' && event.type !== selectedType) {
                return false;
            }
            
            return true;
        });

        // Sort events
        filteredEvents.sort((a, b) => {
            if (showPastEvents) {
                // If showing past events, sort upcoming first, then past
                if (a.isUpcoming && !b.isUpcoming) return -1;
                if (!a.isUpcoming && b.isUpcoming) return 1;
                
                if (a.isUpcoming && b.isUpcoming) {
                    return a.parsedDate - b.parsedDate;
                } else {
                    return b.parsedDate - a.parsedDate; // Descending for past
                }
            } else {
                // Default: just sort upcoming by date ascending
                return a.parsedDate - b.parsedDate;
            }
        });

        if (filteredEvents.length === 0) {
            eventsContainer.innerHTML = '<p class="no-events">No events found. Try adjusting your filters!</p>';
            return;
        }

        // Display events
        eventsContainer.innerHTML = filteredEvents.map(event => {
            const eventDate = event.parsedDate;
            const isUpcoming = event.isUpcoming;
            const isPast = event.isPast;

            return `
                <div class="event-card ${event.isNext ? 'next-event' : ''} ${isPast ? 'past-event' : ''}" data-type="${event.type}">
                    ${event.isNext ? '<div class="next-event-badge">Next Event</div>' : ''}
                    ${isPast ? '<div class="past-event-badge">Past Event</div>' : ''}
                    <div class="event-date">
                        <div class="event-date-day">${eventDate.getDate()}</div>
                        <div class="event-date-month">${eventDate.toLocaleDateString('en-US', { month: 'short' })}</div>
                        <div class="event-date-year">${eventDate.getFullYear()}</div>
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
                            ${event.price ? `
                                <div class="event-detail-item">
                                    <svg viewBox="0 0 24 24" fill="currentColor" class="event-icon">
                                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                                    </svg>
                                    <span>${event.price} ${event.isFree ? '' : 'per person'}</span>
                                </div>
                            ` : ''}
                            ${event.isFree ? `
                                <div class="event-detail-item free-badge">
                                    <svg viewBox="0 0 24 24" fill="currentColor" class="event-icon">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                    <span>Free Event</span>
                                </div>
                            ` : ''}
                        </div>
                        ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                        ${isUpcoming ? `
                            <a href="${event.url}" target="_blank" class="event-rsvp-btn" rel="noopener noreferrer">
                                <span>RSVP Now</span>
                                <svg viewBox="0 0 24 24" fill="currentColor" class="event-link-icon">
                                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                                </svg>
                            </a>
                        ` : `
                            <a href="${event.url}" target="_blank" class="event-link" rel="noopener noreferrer">
                                View Event Details
                                <svg viewBox="0 0 24 24" fill="currentColor" class="event-link-icon">
                                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                                </svg>
                            </a>
                        `}
                    </div>
                </div>
            `;
        }).join('');

    }

    // Initial render
    renderEvents();
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Render YouTube videos from statically generated youtubeVideos array
function initYouTubeVideos() {
    const videoGrid = document.getElementById('video-grid');
    if (!videoGrid || typeof youtubeVideos === 'undefined') return;

    if (youtubeVideos.length === 0) return;

    videoGrid.innerHTML = youtubeVideos.map((video, index) => {
        const isFeatured = index === 0;
        return `
            <div class="video-card ${isFeatured ? 'featured' : ''}">
                <div class="video-wrapper">
                    <iframe src="https://www.youtube.com/embed/${video.id}" 
                            title="${escapeHtml(video.title)}" 
                            frameborder="0" 
                            allowfullscreen></iframe>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${escapeHtml(video.title)}</h3>
                    <p class="video-meta">SF Indian Music Project</p>
                </div>
            </div>
        `;
    }).join('');

    // Re-initialize hover animations for new video cards
    const newCards = videoGrid.querySelectorAll('.video-card');
    newCards.forEach(card => {
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

// Console signature
console.log('SFIMP - Music. Community. Vibes. 🎵');

// Render Gallery from epkImages array
function initGallery() {
    const galleryContainer = document.getElementById('main-gallery');
    if (!galleryContainer || typeof epkImages === 'undefined') return;

    // Use a subset or all images for gallery (excluding logo/assets if any)
    const galleryImages = epkImages.filter(img => !img.includes('logo'));
    
    let html = '';
    galleryImages.forEach((img, index) => {
        html += `
            <div class="masonry-item">
                <img src="assets/epk/${img}" alt="SFIMP Performance ${index + 1}" loading="lazy">
            </div>
        `;
    });
    
    galleryContainer.innerHTML = html;
}

// Call initGallery on load
document.addEventListener('DOMContentLoaded', initGallery);
