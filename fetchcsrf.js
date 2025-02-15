document.addEventListener("DOMContentLoaded", function () {
    // Function to get the CSRF token from the meta tag
    function getCsrfToken() {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : '';
    }

    // Override the global fetch function
    const originalFetch = window.fetch;
    window.fetch = async function (url, options = {}) {
        options.headers = options.headers || {};
        const csrfToken = getCsrfToken();
        if (options.method && options.method.toUpperCase() === 'POST' && csrfToken) {
            options.headers['X-CSRF-Token'] = csrfToken;
        }
        return originalFetch(url, options);
    };
});