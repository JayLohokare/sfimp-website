// SFIMP - Modern Website JS

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initScrollAnimations();
    loadYouTubeVideos();
    loadInstagramPosts();
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
    
    // Animate cards dynamically
    observeCards();
}

function observeCards() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    const cards = document.querySelectorAll('.video-card, .insta-card, .community-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
        observer.observe(card);
    });
}

// Load YouTube videos dynamically using YouTube Data API
async function loadYouTubeVideos() {
    const videoGrid = document.getElementById('video-grid');
    if (!videoGrid) return;
    
    // SFIMP YouTube Channel ID: UCm8gKLqSJkNzrXhKvPzTzKw (from @sfindianmusicproject)
    // Using YouTube's oEmbed for simplicity without API key
    const channelHandle = '@sfindianmusicproject';
    
    // Fallback: Static videos that will be replaced when API is configured
    const fallbackVideos = [
        {
            id: 'NF673jaWZ3k',
            title: 'Studio session: Atach baya ka / Bharla Madhumas',
            meta: 'SF Indian Music Project'
        },
        {
            id: '6PqNc5p1Mho',
            title: 'The Reason / Tune jo na kaha / Naina',
            meta: '376 views'
        },
        {
            id: 'WfEbCQKOjyQ',
            title: 'Pardesiya / Jiya Jale / Ye Haseen Waadiyan',
            meta: '528 views'
        },
        {
            id: '_YdjmxkqjGM',
            title: 'Bin Tere / Sweet Child O Mine',
            meta: '329 views'
        },
        {
            id: 'mRPUOheEJZI',
            title: 'Pehela Nasha / Everything I do',
            meta: '643 views'
        }
    ];
    
    // Render fallback videos
    renderVideos(videoGrid, fallbackVideos);
    
    // TODO: To enable live YouTube API:
    // 1. Get API key from Google Cloud Console
    // 2. Replace with fetch to YouTube Data API v3
    // Example:
    // const apiKey = 'YOUR_API_KEY';
    // const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=UCm8gKLqSJkNzrXhKvPzTzKw&order=date&part=snippet&maxResults=6`);
    // const data = await response.json();
    // const videos = data.items.map(item => ({
    //     id: item.id.videoId,
    //     title: item.snippet.title,
    //     meta: item.snippet.channelTitle
    // }));
    // renderVideos(videoGrid, videos);
}

function renderVideos(container, videos) {
    container.innerHTML = videos.map((video, index) => `
        <div class="video-card ${index === 0 ? 'featured' : ''}">
            <div class="video-wrapper">
                <iframe src="https://www.youtube.com/embed/${video.id}" title="${video.title}" frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-meta">${video.meta}</p>
            </div>
        </div>
    `).join('');
    
    // Re-observe new cards
    observeCards();
}

// Load Instagram posts
// Note: Instagram doesn't provide a simple public embed API anymore
// This uses static posts that should be updated manually or via Instagram Basic Display API
function loadInstagramPosts() {
    const instaGrid = document.getElementById('insta-grid');
    if (!instaGrid) return;
    
    // Static Instagram posts (update these manually or use Instagram Basic Display API)
    const posts = [
        'DVxLOXdkXEx',
        'DVnT5-nDc4Y',
        'DVWp-I1knB3',
        'DVL-KDTAHgO',
        'DU7W66yEVlB',
        'DUuPQ-jEUnN'
    ];
    
    instaGrid.innerHTML = posts.map(id => `
        <a href="https://www.instagram.com/reel/${id}/" target="_blank" class="insta-card">
            <div class="insta-wrapper">
                <iframe src="https://www.instagram.com/reel/${id}/embed" class="insta-embed" title="Instagram Post"></iframe>
            </div>
        </a>
    `).join('');
    
    // Re-observe new cards
    observeCards();
    
    // TODO: To enable Instagram API:
    // Use Instagram Basic Display API with OAuth
    // Requires: Facebook Developer App, access token, and server-side refresh
}

// Console signature
console.log('SFIMP - Music. Community. Vibes. 🎵');
