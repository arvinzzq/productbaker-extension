import React, { useState, useEffect } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../components/ui/drawer"

import styleText from "data-text:../globals.css"
import iconUrl from "data-base64:../assets/icon.png"

export const config = {
  matches: ["https://*/*"],
  all_frames: false,
  run_at: "document_idle"
}

export const getStyle = () => {
  const style = document.createElement("style")
  // Replace :root with :host for proper CSS isolation in shadow DOM
  style.textContent = styleText.replaceAll(':root', ':host(plasmo-csui)')
  return style
}


const DrawerFloatingPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [iframeError, setIframeError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const toggleSidePanel = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'toggleSidePanel' })
      if (response?.success) {
        if (response.action === 'opened') {
          setIsSidePanelOpen(true)
        } else if (response.action === 'closed' && response.shouldClose) {
          setIsSidePanelOpen(false)
          // Notify the side panel to close itself
          chrome.runtime.sendMessage({ action: 'closeSidePanelFromDrawer' })
        }
      }
    } catch (error) {
      console.error('Failed to toggle side panel:', error)
    }
  }

  
  useEffect(() => {
    // 确保初始状态为关闭
    setIsOpen(false);
    console.log('Content script initialized, drawer state reset to closed');
    
    // Get current page URL
    setCurrentUrl(window.location.href);
    
    // Listen for messages from background script
    const handleMessage = (message: any) => {
      console.log('Content script received message:', message);
      if (message.type === 'TOGGLE_FLOATING_PANEL') {
        console.log('Toggling drawer...');
        setIsOpen(prev => {
          const newState = !prev
          console.log('Drawer state changing from', prev, 'to', newState);
          return newState
        })
      } else if (message.type === 'HIDE_FLOATING_PANEL') {
        setIsOpen(false)
      } else if (message.type === 'SIDE_PANEL_STATE_CHANGED') {
        console.log('Side panel state changed:', message.isOpen, 'previous state:', isSidePanelOpen);
        setIsSidePanelOpen(message.isOpen)
      }
    }

    // Listen for custom events as backup
    const handleCustomEvent = (event: Event) => {
      console.log('Content script received custom event:', event.type);
      if (event.type === 'TOGGLE_FLOATING_PANEL') {
        console.log('Toggling drawer via custom event...');
        setIsOpen(prev => {
          const newState = !prev
          console.log('Custom event - Drawer state changing from', prev, 'to', newState);
          return newState
        })
      }
    }

    // 添加事件监听器（确保它们都定义了）
    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(handleMessage)
    }
    
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('TOGGLE_FLOATING_PANEL', handleCustomEvent)
    }
    
    // 添加一个全局标记，表明content script已加载
    if (typeof window !== 'undefined') {
      (window as any).productBakerContentLoaded = true
      console.log('ProductBaker content script loaded');
    }
    
    // Get initial side panel state
    chrome.runtime.sendMessage({ action: 'getSidePanelState' })
      .then(response => {
        if (response?.success) {
          setIsSidePanelOpen(response.isOpen)
        }
      })
      .catch(error => console.error('Failed to get initial side panel state:', error))
    
    return () => {
      // 清理事件监听器
      if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(handleMessage)
      }
      
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('TOGGLE_FLOATING_PANEL', handleCustomEvent)
      }
    }
  }, [])
  
  console.log('DrawerFloatingPanel rendering, isOpen:', isOpen);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent side="right">
        {/* Header with logo and toggle button */}
        <DrawerHeader className="drawer-header text-gray-800 px-4 py-3 flex-shrink-0 bg-gradient-to-r from-white via-gray-50/80 to-white shadow-lg border-b-2 border-gray-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={iconUrl} 
                alt="ProductBaker Logo"
                className="w-6 h-6 rounded logo-3d-effect transition-all duration-300 hover:scale-110 hover:-rotate-2"
              />
              <DrawerTitle className="text-sm font-medium bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent drop-shadow-sm">
                ProductBaker
              </DrawerTitle>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleSidePanel}
                className={`transition-all duration-300 px-3 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer rounded-lg font-medium text-sm transform hover:scale-105 ${
                  isSidePanelOpen 
                    ? 'text-white bg-green-600 hover:bg-green-700 shadow-lg ring-2 ring-green-200' 
                    : 'text-gray-700 bg-white hover:bg-green-50 hover:text-green-700 shadow-md border border-gray-200 hover:border-green-300'
                }`}
                title={isSidePanelOpen ? "Close Side Panel" : "Open Side Panel"}
                style={{
                  boxShadow: isSidePanelOpen 
                    ? '0 4px 12px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                    : '0 2px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                }}
              >
                <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="text-xs">
                  {isSidePanelOpen ? 'Close' : 'Panel'}
                </span>
              </button>
              <DrawerClose 
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-300 w-6 h-6 flex items-center justify-center text-lg cursor-pointer rounded-md shadow-sm transform hover:scale-110 hover:shadow-md"
                style={{
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                ×
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        {/* Main content with iframe */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            </div>
          )}
          
          {iframeError ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Error</h3>
                <p className="text-gray-600 mb-4">Unable to load content from productbaker.com</p>
                <button 
                  onClick={() => {
                    setIframeError(false)
                    setIsLoading(true)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <iframe 
              src={`https://productbaker.com/extension/seo-analysis?url=${encodeURIComponent(currentUrl)}&t=${Date.now()}`}
              className="w-full h-full border-0"
              title="ProductBaker SEO Analysis"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => {
                setIsLoading(false)
                setIframeError(false)
              }}
              onError={() => {
                setIsLoading(false)
                setIframeError(true)
              }}
              style={{
                colorScheme: 'light'
              }}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default DrawerFloatingPanel