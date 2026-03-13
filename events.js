// Events configuration for SF Indian Music Project
const eventsConfig = [
    {
        id: 1,
        title: "4th April Community Jam",
        date: "2025-04-04",
        time: "2:00 PM PT",
        location: "SPARK Social SF",
        description: "Join us for Indian / Bollywood music in San Francisco! This is a free to attend jam session / concert. Play/Sing along, or just join for the great vibes!",
        url: "https://partiful.com/e/QeLdo7rNlXW5VmQY6pib",
        isNext: true
    }
    // Add more events here as needed
    // {
    //     id: 2,
    //     title: "Future Event",
    //     date: "2025-05-15",
    //     time: "3:00 PM PT",
    //     location: "TBD",
    //     description: "Description here",
    //     url: "https://example.com",
    //     isNext: false
    // }
];

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = eventsConfig;
}
