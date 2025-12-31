// Main JS for shared functionality (Navbar, Mobile Menu, etc.)

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle (Placeholder)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn'); // If we add one
    const navList = document.querySelector('.nav-list');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }

    // Dynamic Active Link Highlighting
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});

// Utility to Fetch Events for Home Page (Featured)
const featuredContainer = document.getElementById('featured-events-container');
if (featuredContainer) {
    fetch('http://localhost:5000/api/events')
        .then(res => res.json())
        .then(events => {
            if (events.length === 0) {
                featuredContainer.innerHTML = '<p class="loading-state">No upcoming events.</p>';
                return;
            }
            // Show only first 3
            const featured = events.slice(0, 3);
            featuredContainer.innerHTML = featured.map(event => `
                <div class="event-card" style="background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h3 style="margin-bottom: 0.5rem; color: #0f172a;">${event.title}</h3>
                    <p style="color: #64748b; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${event.description}</p>
                    <a href="register.html?id=${event._id}" style="color: #2563eb; font-weight: 500;">Register &rarr;</a>
                </div>
            `).join('');
        })
        .catch(err => {
            featuredContainer.innerHTML = '<p class="loading-state error">Could not load events.</p>';
        });
}
