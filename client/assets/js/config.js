const getApiBaseUrl = () => {
    // If running on localhost (dev), point to Python/Node backend directly
    // OR if you want to test the Vercel proxy locally you'd need `vercel dev`
    // For now, let's assume if hostname is localhost, we use port 5000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }
    // For Production (Vercel), we hit Render backend directly to avoid proxy config issues
    return 'https://iste-event-portal.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
