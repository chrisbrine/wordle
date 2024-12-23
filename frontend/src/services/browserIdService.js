// Generate a random ID
function generateBrowserId() {
  return 'bid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create browser ID
export function getBrowserId() {
  try {
    let browserId = localStorage.getItem('browserId');
    if (!browserId) {
      browserId = generateBrowserId();
      localStorage.setItem('browserId', browserId);
    }
    return browserId;
  } catch (error) {
    console.error('Failed to access localStorage for browser ID:', error);
    return generateBrowserId(); // Fallback to temporary ID
  }
}