// Background service worker
console.log('Facebook Cookie Loader Extension Started');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'loadCookies') {
    loadCookiesToFacebook(request.cookies)
      .then(() => {
        sendResponse({ success: true, message: 'Cookies loaded successfully' });
      })
      .catch((error) => {
        console.error('Error loading cookies:', error);
        sendResponse({ success: false, message: error.message });
      });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'openFacebookWithCookies') {
    openFacebookWithCookies(request.cookies)
      .then((tabId) => {
        sendResponse({ success: true, tabId: tabId });
      })
      .catch((error) => {
        console.error('Error:', error);
        sendResponse({ success: false, message: error.message });
      });
    return true;
  }
});

async function loadCookiesToFacebook(cookiesData) {
  console.log('Loading cookies to Facebook...');
  
  let cookies = [];
  
  // Parse cookies
  try {
    if (typeof cookiesData === 'string') {
      cookies = JSON.parse(cookiesData);
    } else if (Array.isArray(cookiesData)) {
      cookies = cookiesData;
    } else if (cookiesData.cookies && Array.isArray(cookiesData.cookies)) {
      cookies = cookiesData.cookies;
    }
  } catch (e) {
    throw new Error('Invalid cookie format: ' + e.message);
  }
  
  if (!cookies || cookies.length === 0) {
    throw new Error('No cookies to load');
  }
  
  // Clear existing Facebook cookies first
  try {
    const existingCookies = await chrome.cookies.getAll({ domain: '.facebook.com' });
    for (const cookie of existingCookies) {
      await chrome.cookies.remove({
        url: `https://${cookie.domain}${cookie.path}`,
        name: cookie.name
      });
    }
    console.log('Cleared existing cookies');
  } catch (e) {
    console.warn('Could not clear cookies:', e);
  }
  
  // Set new cookies
  let successCount = 0;
  let errorCount = 0;
  
  for (const cookie of cookies) {
    try {
      // Prepare cookie for Chrome API
      const cookieDetails = {
        url: `https://${cookie.domain || '.facebook.com'}${cookie.path || '/'}`,
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain || '.facebook.com',
        path: cookie.path || '/',
        secure: cookie.secure !== false,
        httpOnly: cookie.httpOnly || false,
        sameSite: cookie.sameSite || 'no_restriction'
      };
      
      // Add expiration if provided
      if (cookie.expirationDate) {
        cookieDetails.expirationDate = cookie.expirationDate;
      } else if (cookie.expires) {
        cookieDetails.expirationDate = cookie.expires;
      }
      
      await chrome.cookies.set(cookieDetails);
      successCount++;
      console.log(`Cookie set: ${cookie.name}`);
    } catch (error) {
      errorCount++;
      console.error(`Failed to set cookie ${cookie.name}:`, error);
    }
  }
  
  console.log(`Cookies loaded: ${successCount} success, ${errorCount} errors`);
  
  if (successCount === 0) {
    throw new Error('Failed to load any cookies');
  }
  
  return { successCount, errorCount };
}

async function openFacebookWithCookies(cookiesData) {
  // Load cookies first
  await loadCookiesToFacebook(cookiesData);
  
  // Open Facebook in new tab
  const tab = await chrome.tabs.create({
    url: 'https://www.facebook.com',
    active: true
  });
  
  return tab.id;
}
