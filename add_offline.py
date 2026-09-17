import os

offline_js = """
// OFFLINE NETWORK DETECTOR (Android / Web)
window.addEventListener('load', () => {
    const updateOnlineStatus = () => {
        if (!navigator.onLine) {
            if (window.showToast) {
                window.showToast('You are offline. Some features may be limited.', 'error');
            } else {
                alert('You are offline. Some features may be limited.');
            }
        } else {
            if (window.showToast) {
                window.showToast('Back online!', 'success');
            }
        }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});
"""

with open("src/farmer-app.js", "a", encoding='utf-8') as f:
    f.write(offline_js)
    
print("Added offline detector.")
