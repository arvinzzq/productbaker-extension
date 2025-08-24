// Background script for ProductBaker Chrome Extension

// Set up side panel when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('ProductBaker extension installed');
  
  // Enable side panel for all tabs
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
});

// Handle action button clicks to toggle floating panel
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    console.log('Extension icon clicked, tab ID:', tab.id);
    
    try {
      // Send message to content script to toggle the drawer panel
      await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_FLOATING_PANEL' });
      console.log('Toggle message sent to content script');
    } catch (error) {
      console.error('Failed to send message to content script:', error);
      
      // Fallback: try to inject the content script if it's not loaded
      try {
        console.log('Attempting to inject content script as fallback...');
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Dispatch custom event as fallback
            const event = new Event('TOGGLE_FLOATING_PANEL');
            window.dispatchEvent(event);
            console.log('Custom event dispatched as fallback');
          }
        });
      } catch (fallbackError) {
        console.error('Fallback script injection also failed:', fallbackError);
      }
    }
  }
});

// Optional: Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('ProductBaker extension started');
});

// Handle messages from content scripts or side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  switch (request.action) {
    case 'openSidePanel':
      // 优先使用sender的tab，如果没有则获取当前活跃tab
      const tabId = sender.tab?.id;
      if (tabId) {
        chrome.sidePanel.open({ tabId: tabId })
          .then(() => sendResponse({ success: true }))
          .catch((error) => {
            console.error('Failed to open side panel:', error);
            sendResponse({ success: false, error: error.message });
          });
        return true;
      } else {
        // 如果没有sender tab信息，获取当前活跃tab
        chrome.tabs.query({ active: true, currentWindow: true })
          .then(tabs => {
            if (tabs[0]?.id) {
              return chrome.sidePanel.open({ tabId: tabs[0].id });
            }
            throw new Error('No active tab found');
          })
          .then(() => sendResponse({ success: true }))
          .catch((error) => {
            console.error('Failed to open side panel:', error);
            sendResponse({ success: false, error: error.message });
          });
        return true;
      }
      break;
    
    default:
      console.log('Unknown action:', request.action);
  }
  
  sendResponse({ success: true });
});