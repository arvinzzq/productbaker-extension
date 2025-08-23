// Background script for ProductBaker Chrome Extension

// Set up side panel when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('ProductBaker extension installed');
  
  // Enable side panel for all tabs
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
});

// Handle action button clicks to toggle floating panel (not sidepanel)
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    console.log('Extension icon clicked, tab ID:', tab.id);
    
    // 直接使用脚本注入作为主要方法
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          console.log('Script injected, checking for ProductBaker');
          
          // 检查是否存在ProductBaker的元素
          let drawerElement = document.getElementById('productbaker-drawer-panel');
          
          if (!drawerElement) {
            console.log('Creating ProductBaker drawer element');
            
            // 创建drawer容器
            drawerElement = document.createElement('div');
            drawerElement.id = 'productbaker-drawer-panel';
            drawerElement.style.cssText = `
              position: fixed;
              top: 0;
              right: -400px;
              width: 400px;
              height: 100vh;
              background: white;
              box-shadow: -2px 0 10px rgba(0,0,0,0.3);
              z-index: 2147483647;
              transition: right 0.3s ease;
              border-left: 1px solid #ccc;
              overflow-y: auto;
            `;
            
            // 添加内容
            drawerElement.innerHTML = '<div style="background: #059669; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">' +
              '<div style="display: flex; align-items: center; gap: 12px;">' +
                '<div style="width: 32px; height: 32px; background: white; border-radius: 6px; display: flex; align-items: center; justify-content: center;">' +
                  '<span style="color: #059669; font-weight: bold; font-size: 14px;">PB</span>' +
                '</div>' +
                '<div>' +
                  '<h3 style="margin: 0; font-size: 18px; font-weight: 600;">ProductBaker</h3>' +
                  '<p style="margin: 0; font-size: 14px; opacity: 0.8;">Chrome Extension</p>' +
                '</div>' +
              '</div>' +
              '<button id="productbaker-close" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">×</button>' +
            '</div>' +
            '<div style="padding: 24px;">' +
              '<h4 style="margin: 0 0 16px 0; font-size: 16px; color: #333;">浮动面板</h4>' +
              '<p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">内容待添加...</p>' +
              '<div style="margin-bottom: 20px;">' +
                '<button id="productbaker-open-sidepanel" style="width: 100%; background: #059669; color: white; border: none; padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; margin-bottom: 16px;">🚀 打开完整面板</button>' +
              '</div>' +
              '<div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">' +
                '<h5 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #333;">快速功能</h5>' +
                '<div style="display: flex; flex-direction: column; gap: 8px;">' +
                  '<button style="width: 100%; text-align: left; padding: 8px 12px; background: white; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; cursor: pointer;">📊 数据概览</button>' +
                  '<button style="width: 100%; text-align: left; padding: 8px 12px; background: white; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; cursor: pointer;">🔗 快速添加</button>' +
                  '<button style="width: 100%; text-align: left; padding: 8px 12px; background: white; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; cursor: pointer;">⚙️ 设置</button>' +
                '</div>' +
              '</div>' +
              '<div style="border: 1px solid #d1d5db; border-radius: 8px; padding: 16px;">' +
                '<h5 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #333;">信息展示</h5>' +
                '<div style="font-size: 14px; color: #666;">' +
                  '<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">' +
                    '<span>当前页面:</span>' +
                    '<span style="color: #059669; font-weight: 500;">' + window.location.hostname + '</span>' +
                  '</div>' +
                  '<div style="display: flex; justify-content: space-between;">' +
                    '<span>状态:</span>' +
                    '<span style="color: #059669; font-weight: 500;">活跃</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div style="border-top: 1px solid #e5e7eb; padding: 12px 16px; background: #f9fafb; margin-top: auto;">' +
              '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #6b7280;">' +
                '<span>ProductBaker v1.0</span>' +
                '<button style="background: none; border: none; color: #059669; font-size: 12px; cursor: pointer;">设置</button>' +
              '</div>' +
            '</div>';
            
            document.body.appendChild(drawerElement);
            
            // 绑定关闭事件
            const closeBtn = drawerElement.querySelector('#productbaker-close');
            closeBtn.addEventListener('click', () => {
              drawerElement.style.right = '-400px';
            });
            
            // 绑定打开sidepanel事件
            const sidePanelBtn = drawerElement.querySelector('#productbaker-open-sidepanel') as HTMLButtonElement;
            sidePanelBtn?.addEventListener('click', () => {
              // 添加点击反馈
              sidePanelBtn.style.background = '#047857';
              sidePanelBtn.textContent = '⏳ 正在打开...';
              
              // 发送消息给background script打开sidepanel
              chrome.runtime.sendMessage({ action: 'openSidePanel' }, (response) => {
                console.log('SidePanel open response:', response);
                
                if (response && response.success) {
                  sidePanelBtn.textContent = '✅ 已打开';
                  sidePanelBtn.style.background = '#16a34a';
                  
                  // 2秒后恢复按钮状态，不关闭drawer
                  setTimeout(() => {
                    sidePanelBtn.textContent = '🚀 打开完整面板';
                    sidePanelBtn.style.background = '#059669';
                  }, 2000);
                } else {
                  sidePanelBtn.textContent = '❌ 打开失败';
                  sidePanelBtn.style.background = '#dc2626';
                  
                  // 2秒后恢复按钮状态
                  setTimeout(() => {
                    sidePanelBtn.textContent = '🚀 打开完整面板';
                    sidePanelBtn.style.background = '#059669';
                  }, 2000);
                }
              });
            });
            
            // 首次创建时，需要确保浏览器完全渲染了初始状态后再触发动画
            // 强制重绘并延迟触发动画
            drawerElement.offsetHeight; // 强制重绘
            setTimeout(() => {
              drawerElement.style.right = '0px';
            }, 10);
            
            // 不需要遮罩，用户可以继续与页面交互
          } else {
            // 元素已存在，切换显示状态
            const currentRight = drawerElement.style.right;
            
            if (currentRight === '0px' || currentRight === '') {
              // 隐藏
              drawerElement.style.right = '-400px';
            } else {
              // 显示
              drawerElement.style.right = '0px';
            }
          }
          
          console.log('ProductBaker drawer toggled');
        }
      });
      console.log('Script injection executed successfully');
    } catch (error) {
      console.error('Script injection failed:', error);
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