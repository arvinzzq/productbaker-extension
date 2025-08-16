// Background script for ProductBaker Chrome Extension

// Set up side panel when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('ProductBaker extension installed');
  
  // Enable side panel for all tabs
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Handle action button clicks to open side panel
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (error) {
      console.error('Failed to open side panel:', error);
    }
  }
});

// Optional: Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('ProductBaker extension started');
});

// Optional: Handle messages from content scripts or side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  switch (request.action) {
    case 'openSidePanel':
      if (sender.tab?.id) {
        chrome.sidePanel.open({ tabId: sender.tab.id });
      }
      break;
    
    default:
      console.log('Unknown action:', request.action);
  }
  
  sendResponse({ success: true });
});