// SFIMP - Modern Website JS

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initHoverAnimations();
    initInstagramPosts();
    initEvents();
    initYouTubeVideos();
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

        let filteredEvents = eventsConfig.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            
            // Filter by date
            if (!showPastEvents && eventDate < now && !event.isNext) {
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
            // Sort by isNext first, then by date (upcoming first, then past)
            if (a.isNext && !b.isNext) return -1;
            if (!a.isNext && b.isNext) return 1;
            
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            // If showing past events, sort upcoming first, then past
            if (showPastEvents) {
                const nowA = dateA >= now;
                const nowB = dateB >= now;
                if (nowA && !nowB) return -1;
                if (!nowA && nowB) return 1;
            }
            
            return dateA - dateB;
        });

        if (filteredEvents.length === 0) {
            eventsContainer.innerHTML = '<p class="no-events">No events found. Try adjusting your filters!</p>';
            return;
        }

        // Display events
        eventsContainer.innerHTML = filteredEvents.map(event => {
            const eventDate = new Date(event.date);
            const isUpcoming = eventDate >= now || event.isNext;
            const isPast = eventDate < now && !event.isNext;

            return `
                <div class="event-card ${event.isNext ? 'next-event' : ''} ${isPast ? 'past-event' : ''}" data-type="${event.type}">
                    ${event.isNext ? '<div class="next-event-badge">Next Event</div>' : ''}
                    ${isPast ? '<div class="past-event-badge">Past Event</div>' : ''}
                    <div class="event-type-badge">${event.type}</div>
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

        // Add smooth scroll to next event if it exists
        const nextEventCard = eventsContainer.querySelector('.next-event');
        if (nextEventCard && !showPastEvents) {
            setTimeout(() => {
                nextEventCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }

    // Initial render
    renderEvents();
}

// YouTube channel configuration
const YOUTUBE_CONFIG = {
    channelHandle: 'sfindianmusicproject',
    channelId: null, // Will be auto-detected or can be set manually
    maxVideos: 4
};

// Helper: Get channel ID from a video ID using YouTube oEmbed
async function getChannelIdFromVideoId(videoId) {
    try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oembedUrl);
        if (response.ok) {
            const data = await response.json();
            // Extract channel ID from author URL if available
            if (data.author_url) {
                const match = data.author_url.match(/channel\/([^\/]+)/);
                if (match && match[1].startsWith('UC')) {
                    return match[1];
                }
            }
        }
    } catch (e) {
        console.log('Could not get channel ID from video:', e);
    }
    return null;
}

// Fetch and display YouTube videos
async function initYouTubeVideos() {
    console.log('initYouTubeVideos called');
    const videoGrid = document.getElementById('video-grid');
    if (!videoGrid) {
        console.warn('Video grid not found');
        return;
    }

    // Store original videos as fallback
    const originalVideos = videoGrid.innerHTML;
    console.log('Starting YouTube video fetch for:', YOUTUBE_CONFIG.channelHandle);

    try {
        const videos = await fetchYouTubeVideos(YOUTUBE_CONFIG.channelHandle, YOUTUBE_CONFIG.maxVideos, YOUTUBE_CONFIG.channelId);
        console.log('Fetched videos:', videos.length);
        
        if (videos.length === 0) {
            // Keep original videos if no videos found
            console.warn('No videos found, keeping fallback videos');
            return;
        }

        // Render videos - matching the exact format of the original
        videoGrid.innerHTML = videos.map((video, index) => {
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

    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        // Keep original videos on error - they're already there as fallback
        // No need to show error message, just silently fall back
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fetch YouTube videos from channel - Simplified approach
async function fetchYouTubeVideos(channelHandle, maxResults = 4, providedChannelId = null) {
    try {
        // Try multiple RSS feed formats that work with YouTube
        const rssFormats = [];
        
        // If channel ID is provided, use it directly
        if (providedChannelId) {
            rssFormats.push(`https://www.youtube.com/feeds/videos.xml?channel_id=${providedChannelId}`);
        }
        
        // Try channel handle formats
        rssFormats.push(`https://www.youtube.com/feeds/videos.xml?user=${channelHandle}`);
        rssFormats.push(`https://www.youtube.com/@${channelHandle}/videos.rss`);
        
        // If we have a channel ID from previous attempts, add it
        let channelId = providedChannelId;
        
        // Use rss2json API to convert RSS to JSON (handles CORS and parsing)
        for (const rssUrl of rssFormats) {
            try {
                const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=public&count=${maxResults}`;
                
                const response = await fetch(rss2jsonUrl);
                
                if (!response.ok) {
                    continue; // Try next format
                }

                const data = await response.json();
                
                if (data.status === 'ok' && data.items && data.items.length > 0) {
                    // Success! Extract videos
                    const videos = data.items.map(item => {
                        // Extract video ID from link
                        let videoId = null;
                        if (item.link) {
                            const match = item.link.match(/[?&]v=([^&]+)/);
                            videoId = match ? match[1] : null;
                        }
                        if (!videoId && item.guid) {
                            const match = item.guid.match(/[?&]v=([^&]+)/);
                            videoId = match ? match[1] : null;
                        }
                        
                        return {
                            id: videoId,
                            title: item.title || 'Untitled Video',
                            published: item.pubDate || ''
                        };
                    }).filter(video => video.id); // Only include videos with valid IDs
                    
                    if (videos.length > 0) {
                        // Store channel ID if we found it in the feed
                        if (!channelId && data.feed && data.feed.link) {
                            const channelMatch = data.feed.link.match(/channel\/([^\/]+)/);
                            if (channelMatch && channelMatch[1].startsWith('UC')) {
                                channelId = channelMatch[1];
                                console.log('Found channel ID:', channelId);
                            }
                        }
                        return videos;
                    }
                }
            } catch (e) {
                console.log('RSS format failed, trying next:', rssUrl, e.message);
                continue; // Try next format
            }
        }
        
        // If all RSS formats failed, try to get channel ID from existing video
        if (!channelId) {
            // Try to get channel ID from one of the fallback videos
            const fallbackVideoId = 'NF673jaWZ3k'; // First video in fallback list
            channelId = await getChannelIdFromVideoId(fallbackVideoId);
            
            if (channelId) {
                console.log('Found channel ID from video:', channelId);
                const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
                const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=public&count=${maxResults}`;
                const response = await fetch(rss2jsonUrl);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'ok' && data.items && data.items.length > 0) {
                        const videos = data.items.map(item => {
                            let videoId = null;
                            if (item.link) {
                                const match = item.link.match(/[?&]v=([^&]+)/);
                                videoId = match ? match[1] : null;
                            }
                            return {
                                id: videoId,
                                title: item.title || 'Untitled Video',
                                published: item.pubDate || ''
                            };
                        }).filter(video => video.id);
                        if (videos.length > 0) {
                            return videos;
                        }
                    }
                }
            }
            
            // Last resort: try the handle lookup methods
            channelId = await getChannelIdFromHandle(channelHandle);
            if (channelId) {
                const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
                const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=public&count=${maxResults}`;
                const response = await fetch(rss2jsonUrl);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'ok' && data.items && data.items.length > 0) {
                        const videos = data.items.map(item => {
                            let videoId = null;
                            if (item.link) {
                                const match = item.link.match(/[?&]v=([^&]+)/);
                                videoId = match ? match[1] : null;
                            }
                            return {
                                id: videoId,
                                title: item.title || 'Untitled Video',
                                published: item.pubDate || ''
                            };
                        }).filter(video => video.id);
                        if (videos.length > 0) {
                            return videos;
                        }
                    }
                }
            }
        }
        
        throw new Error('Could not fetch videos from any RSS format');
    } catch (error) {
        console.error('Error in fetchYouTubeVideos:', error);
        throw error;
    }
}

// Get channel ID from handle using YouTube page
async function getChannelIdFromHandle(handle) {
    try {
        // Method 1: Try using rss2json with channel handle directly (some channels support this)
        try {
            const testRssUrl = `https://www.youtube.com/feeds/videos.xml?user=${handle}`;
            const testApiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(testRssUrl)}&api_key=public&count=1`;
            const testResponse = await fetch(testApiUrl);
            if (testResponse.ok) {
                const testData = await testResponse.json();
                if (testData.status === 'ok' && testData.feed && testData.feed.link) {
                    // Extract channel ID from feed link
                    const channelMatch = testData.feed.link.match(/channel\/([^\/]+)/);
                    if (channelMatch && channelMatch[1].startsWith('UC')) {
                        return channelMatch[1];
                    }
                }
            }
        } catch (e) {
            // Continue to next method
        }

        // Method 2: Try to fetch the channel page and extract channel ID
        const channelUrl = `https://www.youtube.com/@${handle}`;
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(channelUrl));
        
        if (!response.ok) {
            throw new Error('Failed to fetch channel page');
        }

        const html = await response.text();
        
        // Extract channel ID from the page - try multiple patterns
        const patterns = [
            /"channelId":"([^"]+)"/,
            /"externalId":"([^"]+)"/,
            /channel_id=([^"&\/]+)/,
            /\/channel\/([^"\/\?]+)/,
            /"browseId":"([^"]+)"/,
            /"ucid":"([^"]+)"/
        ];
        
        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1] && match[1].startsWith('UC')) {
                // YouTube channel IDs start with UC
                return match[1];
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error getting channel ID from handle:', error);
        return null;
    }
}

// Alternative method: Get channel ID from uploads playlist
async function getChannelIdFromUploadsPlaylist(handle) {
    try {
        // Try using the channel handle with different RSS feed formats
        const rssFormats = [
            `https://www.youtube.com/feeds/videos.xml?user=${handle}`,
            `https://www.youtube.com/feeds/videos.xml?channel_id=${handle}` // In case handle is actually an ID
        ];
        
        for (const rssUrl of rssFormats) {
            try {
                const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=public&count=1`;
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'ok' && data.feed && data.feed.link) {
                        const channelMatch = data.feed.link.match(/channel\/([^\/]+)/);
                        if (channelMatch && channelMatch[1].startsWith('UC')) {
                            return channelMatch[1];
                        }
                    }
                }
            } catch (e) {
                // Try next format
                continue;
            }
        }
        
        // Fallback: Try to access the channel's videos page
        const videosUrl = `https://www.youtube.com/@${handle}/videos`;
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(videosUrl));
        
        if (!response.ok) {
            return null;
        }

        const html = await response.text();
        
        // Look for channel ID in the videos page
        const patterns = [
            /"channelId":"([^"]+)"/,
            /channel_id=([^"&\/]+)/,
            /"browseId":"([^"]+)"/
        ];
        
        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1] && match[1].startsWith('UC')) {
                return match[1];
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error getting channel ID from uploads playlist:', error);
        return null;
    }
}

// Console signature
console.log('SFIMP - Music. Community. Vibes. 🎵');
