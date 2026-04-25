// API Configuration
// Using relative URL since frontend is served from the same server
const API_BASE_URL = '/api';

// API Endpoints
const API_ENDPOINTS = {
    // Auth
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,

    // Baby
    createBaby: `${API_BASE_URL}/baby`,
    getBaby: (babyId) => `${API_BASE_URL}/baby/${babyId}`,
    updateBaby: (babyId) => `${API_BASE_URL}/baby/${babyId}`,

    // Vaccination
    getVaccination: (babyId) => `${API_BASE_URL}/vaccination/${babyId}`,
    updateVaccine: (babyId) => `${API_BASE_URL}/vaccination/${babyId}`,

    // Logs
    addSleepLog: `${API_BASE_URL}/logs/sleep`,
    addFeedingLog: `${API_BASE_URL}/logs/feeding`,
    addDiaperLog: `${API_BASE_URL}/logs/diaper`,

    // Notifications
    getNotifications: (userId) => `${API_BASE_URL}/notifications/${userId}`,
    markAsRead: (notifId) => `${API_BASE_URL}/notifications/${notifId}/read`,

    // Blog
    getBlogs: `${API_BASE_URL}/blog`,

    // FAQ
    getFAQ: `${API_BASE_URL}/faq`,

    // Users (admin)
    getUsers: `${API_BASE_URL}/auth/users`,
    toggleUserStatus: (id) => `${API_BASE_URL}/auth/users/${id}/status`,
    deleteUser: (id) => `${API_BASE_URL}/auth/users/${id}`,

    // Products
    getProducts: `${API_BASE_URL}/products`,

    // Community
    createPost: `${API_BASE_URL}/community`,
    getPosts: `${API_BASE_URL}/community`,
    addComment: (postId) => `${API_BASE_URL}/community/${postId}/comment`,

    // Chat
    sendMessage: `${API_BASE_URL}/chat`,
};

// Helper function for API calls
async function apiCall(url, method = 'GET', data = null, headers = {}) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };

    // Add token if exists
    const token = localStorage.getItem('token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.API_ENDPOINTS = API_ENDPOINTS;
    window.apiCall = apiCall;
}