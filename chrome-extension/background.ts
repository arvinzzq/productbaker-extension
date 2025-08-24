// Background script for ProductBaker Chrome Extension

// Set up side panel when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('ProductBaker extension installed');
  
  // Enable side panel for all tabs - set to false so popup shows first
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

// Track side panel state per tab
const sidePanelState = new Map<number, boolean>();

// Handle messages from content scripts or side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  switch (request.action) {
    case 'openSidePanel':
      // 优先使用sender的tab，如果没有则获取当前活跃tab
      const tabId = sender.tab?.id;
      if (tabId) {
        chrome.sidePanel.open({ tabId: tabId })
          .then(() => {
            sidePanelState.set(tabId, true);
            sendResponse({ success: true });
          })
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
              return chrome.sidePanel.open({ tabId: tabs[0].id }).then(() => {
                sidePanelState.set(tabs[0].id!, true);
              });
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

    case 'toggleSidePanel':
      const toggleTabId = sender.tab?.id;
      const handleToggle = (targetTabId: number) => {
        const isOpen = sidePanelState.get(targetTabId) || false;
        
        if (isOpen) {
          // Since there's no direct close API, we'll mark as closed and let the UI handle it
          sidePanelState.set(targetTabId, false);
          sendResponse({ success: true, action: 'closed', shouldClose: true });
        } else {
          // Open the side panel
          chrome.sidePanel.open({ tabId: targetTabId })
            .then(() => {
              sidePanelState.set(targetTabId, true);
              sendResponse({ success: true, action: 'opened' });
            })
            .catch((error) => {
              console.error('Failed to toggle side panel:', error);
              sendResponse({ success: false, error: error.message });
            });
        }
      };

      if (toggleTabId) {
        handleToggle(toggleTabId);
        return true;
      } else {
        chrome.tabs.query({ active: true, currentWindow: true })
          .then(tabs => {
            if (tabs[0]?.id) {
              handleToggle(tabs[0].id);
            } else {
              throw new Error('No active tab found');
            }
          })
          .catch((error) => {
            console.error('Failed to toggle side panel:', error);
            sendResponse({ success: false, error: error.message });
          });
        return true;
      }
      break;

    case 'getSidePanelState':
      const stateTabId = sender.tab?.id;
      if (stateTabId) {
        const isOpen = sidePanelState.get(stateTabId) || false;
        sendResponse({ success: true, isOpen });
      } else {
        chrome.tabs.query({ active: true, currentWindow: true })
          .then(tabs => {
            if (tabs[0]?.id) {
              const isOpen = sidePanelState.get(tabs[0].id) || false;
              sendResponse({ success: true, isOpen });
            } else {
              sendResponse({ success: false, error: 'No active tab found' });
            }
          });
        return true;
      }
      break;

    case 'sidePanelClosed':
      const closedTabId = sender.tab?.id;
      if (closedTabId) {
        sidePanelState.set(closedTabId, false);
        console.log('Side panel closed for tab:', closedTabId);
      }
      sendResponse({ success: true });
      break;
    
    default:
      console.log('Unknown action:', request.action);
  }
  
  sendResponse({ success: true });
});

// Clean up state when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  sidePanelState.delete(tabId);
});