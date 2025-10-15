// Content script - runs on all pages
console.log('FB Cookie Loader - Content script loaded');

// Listen for custom events from web pages
window.addEventListener('message', (event) => {
  // Only accept messages from same origin
  if (event.source !== window) return;
  
  if (event.data.type === 'FB_LOAD_COOKIES') {
    console.log('Received cookie load request');
    
    // Forward to background script
    chrome.runtime.sendMessage({
      action: 'openFacebookWithCookies',
      cookies: event.data.cookies
    }, (response) => {
      if (response && response.success) {
        console.log('Cookies loaded successfully, Facebook opened');
        // Send success back to page
        window.postMessage({
          type: 'FB_COOKIES_LOADED',
          success: true
        }, '*');
      } else {
        console.error('Failed to load cookies:', response?.message);
        window.postMessage({
          type: 'FB_COOKIES_LOADED',
          success: false,
          error: response?.message || 'Unknown error'
        }, '*');
      }
    });
  }
});

// Inject a script to make the extension detectable
const script = document.createElement('script');
script.textContent = `
  window.FB_COOKIE_LOADER_INSTALLED = true;
  console.log('FB Cookie Loader Extension is active!');
`;
(document.head || document.documentElement).appendChild(script);
script.remove();
