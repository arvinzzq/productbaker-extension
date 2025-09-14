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
  matches: ["https://*/*", "http://*/*"],
  all_frames: false,
  run_at: "document_idle"
}

export const getStyle = () => {
  const style = document.createElement("style")
  // Replace :root with :host for proper CSS isolation in shadow DOM
  style.textContent = styleText.replaceAll(':root', ':host(plasmo-csui)') + `
    .loading-dots {
      display: inline-block;
      position: relative;
      width: 40px;
      height: 40px;
    }
    .loading-dots div {
      position: absolute;
      top: 16px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      animation-timing-function: cubic-bezier(0, 1, 1, 0);
    }
    .loading-dots div:nth-child(1) {
      left: 6px;
      animation: loading-dots1 0.6s infinite;
    }
    .loading-dots div:nth-child(2) {
      left: 6px;
      animation: loading-dots2 0.6s infinite;
    }
    .loading-dots div:nth-child(3) {
      left: 17px;
      animation: loading-dots2 0.6s infinite;
    }
    .loading-dots div:nth-child(4) {
      left: 28px;
      animation: loading-dots3 0.6s infinite;
    }
    @keyframes loading-dots1 {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }
    @keyframes loading-dots2 {
      0% { transform: translate(0, 0); }
      100% { transform: translate(11px, 0); }
    }
    @keyframes loading-dots3 {
      0% { transform: scale(1); }
      100% { transform: scale(0); }
    }
  `
  return style
}


const DrawerFloatingPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [iframeError, setIframeError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const [iframeInitialized, setIframeInitialized] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const [showIframe, setShowIframe] = useState(false)
  const [userActivated, setUserActivated] = useState(false) // 用户点击过插件图标后置为 true
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)

  // Smoothly reveal iframe: first make it visible, then hide loader on next paints
  const revealIframe = () => {
    setShowIframe(true)
    // Keep loader visible slightly longer than the fade-in
    setTimeout(() => setIsLoading(false), 220)
  }

  // Function to collect current page data
  const getPageData = () => {
    const pageData = {
      type: 'SEO_ANALYSIS_PAGE_DATA',
      data: {
        htmlContent: document.documentElement.outerHTML
      }
    };
    return pageData;
  }

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== 'https://extension.productbaker.com') {
        return;
      }

      // When iframe is ready, send page data
      if (event.data.type === 'IFRAME_READY') {
        const pageData = getPageData();
        (event.source as Window)?.postMessage(pageData, event.origin);
        setContentReady(true);
        revealIframe();
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

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
    }
  }

  useEffect(() => {
    let loadingTimer: NodeJS.Timeout | null = null;
    let fallbackTimer: NodeJS.Timeout | null = null;
    
    // Immediate fallback for iframe load - show after basic load completes
    if (isOpen && isLoading && iframeLoaded && !contentReady) {
      fallbackTimer = setTimeout(() => {
        setContentReady(true);
        revealIframe();
      }, 500); // Much shorter fallback - just 0.5 seconds after iframe loads
    }
    
    // Ultimate timeout as safety net
    if (isOpen && isLoading && !contentReady && iframeInitialized) {
      loadingTimer = setTimeout(() => {
        setContentReady(true);
        revealIframe();
      }, 2000); // Reduced to 2 seconds total
    }
    
    return () => {
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };
  }, [isOpen, isLoading, contentReady, iframeLoaded, iframeInitialized]);

  // Ensure iframe mounts as soon as the drawer is opened the first time
  useEffect(() => {
    if (isOpen && userActivated && !iframeInitialized) {
      setIsLoading(true)
      setIframeError(false)
      setIframeLoaded(false)
      setContentReady(false)
      setShowIframe(false)
      setIframeKey((k) => k + 1)
      setIframeInitialized(true)
      const url = currentUrl || window.location.href
      setIframeSrc(`https://extension.productbaker.com/seo-analysis?url=${encodeURIComponent(url)}&extension=true&t=${Date.now()}`)
    }
  }, [isOpen, userActivated, iframeInitialized, currentUrl])
  
  useEffect(() => {
    // 确保初始状态为关闭
    setIsOpen(false);
    
    // Get current page URL only once
    if (!currentUrl) {
      setCurrentUrl(window.location.href);
    }
    
    // Listen for messages from background script
    const handleMessage = (message: any) => {
      if (message.type === 'TOGGLE_FLOATING_PANEL') {
        setUserActivated(true)
        // Toggle and, if opening, start preload before the drawer becomes visible
        setIsOpen(prev => {
          const newState = !prev
          if (newState && (!iframeInitialized || iframeError)) {
            setIsLoading(true);
            setIframeError(false);
            setIframeLoaded(false);
            setContentReady(false);
            setShowIframe(false);
            setIframeKey(prevKey => prevKey + 1);
            setIframeInitialized(true);
            const url = currentUrl || window.location.href
            setIframeSrc(`https://extension.productbaker.com/seo-analysis?url=${encodeURIComponent(url)}&extension=true&t=${Date.now()}`)
          }
          return newState
        })
      } else if (message.type === 'HIDE_FLOATING_PANEL') {
        setIsOpen(false)
      } else if (message.type === 'SIDE_PANEL_STATE_CHANGED') {
        setIsSidePanelOpen(message.isOpen)
      }
    }

    // Listen for custom events as backup
    const handleCustomEvent = (event: Event) => {
      if (event.type === 'TOGGLE_FLOATING_PANEL') {
        setUserActivated(true)
        setIsOpen(prev => {
          const newState = !prev
          if (newState && (!iframeInitialized || iframeError)) {
            setIsLoading(true);
            setIframeError(false);
            setIframeLoaded(false);
            setContentReady(false);
            setShowIframe(false);
            setIframeKey(prevKey => prevKey + 1);
            setIframeInitialized(true);
            const url = currentUrl || window.location.href
            setIframeSrc(`https://extension.productbaker.com/seo-analysis?url=${encodeURIComponent(url)}&extension=true&t=${Date.now()}`)
          }
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
    }
    
    // Get initial side panel state
    chrome.runtime.sendMessage({ action: 'getSidePanelState' })
      .then(response => {
        if (response?.success) {
          setIsSidePanelOpen(response.isOpen)
        }
      })
      .catch(() => {})
    
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

  // 仅在用户激活后（第一次打开抽屉）再进行连接预热（可选，不会提前创建 iframe）
  useEffect(() => {
    if (!userActivated) return
    try {
      const head = document.head || document.getElementsByTagName('head')[0]
      const hints: HTMLLinkElement[] = []
      const make = (rel: string, href: string, crossOrigin?: string) => {
        const l = document.createElement('link')
        l.rel = rel
        l.href = href
        if (crossOrigin !== undefined) l.crossOrigin = crossOrigin
        head.appendChild(l)
        hints.push(l)
      }
      make('preconnect', 'https://extension.productbaker.com', '')
      return () => {
        hints.forEach((l) => l.parentElement?.removeChild(l))
      }
    } catch {}
  }, [userActivated])

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
                onClick={() => {
                  setIsLoading(true);
                  setIframeError(false);
                  setIframeLoaded(false);
                  setContentReady(false);
                  setShowIframe(false);
                  setIframeKey(prevKey => prevKey + 1);
                  const url = currentUrl || window.location.href
                  setIframeSrc(`https://extension.productbaker.com/seo-analysis?url=${encodeURIComponent(url)}&extension=true&t=${Date.now()}`)
                }}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 w-8 h-8 flex items-center justify-center cursor-pointer rounded-md shadow-sm transform hover:scale-110 hover:shadow-md"
                title="Refresh Analysis"
                style={{
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                <svg className="w-4 h-4 transition-transform duration-200 hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
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
          {iframeInitialized && (
            <iframe 
              key={iframeKey}
              src={iframeSrc || ""}
              loading="eager"
              className={`w-full h-full border-0 transition-all duration-200 ease-out ${
                showIframe ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'
              }`}
              title="ProductBaker SEO Analysis"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => {
                setIframeLoaded(true);
                setIframeError(false);
                revealIframe();
              }}
              onError={() => {
                setIsLoading(false);
                setIframeLoaded(false);
                setContentReady(false);
                setShowIframe(false);
                setIframeError(true);
              }}
              style={{
                colorScheme: 'light',
                willChange: 'opacity, transform'
              }}
            />
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10 transition-opacity duration-300">
              <div className="flex flex-col items-center gap-3">
                <div className="loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <span className="text-sm text-gray-600">
                  {iframeLoaded ? 'Analyzing page...' : 'Loading analyzer...'}
                </span>
              </div>
            </div>
          )}
          
          {iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Error</h3>
                <p className="text-gray-600 mb-4">Unable to load content</p>
                <button 
                  onClick={() => {
                    setIframeError(false);
                    setIsLoading(true);
                    setIframeLoaded(false);
                    setContentReady(false);
                    setShowIframe(false);
                    setIframeKey(prevKey => prevKey + 1);
                    const url = currentUrl || window.location.href
                    setIframeSrc(`https://extension.productbaker.com/seo-analysis?url=${encodeURIComponent(url)}&extension=true&t=${Date.now()}`)
                    setIframeInitialized(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default DrawerFloatingPanel
