import React, { useState, useEffect } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../components/ui/drawer"
import { CompactPageAnalysis } from "../components/CompactPageAnalysis"
import { TabNavigation } from "../components/TabNavigation"
import { SEOIssues } from "../components/SEOIssues"
import { KeywordDensity } from "../components/KeywordDensity"
import { HeadingsAnalysis } from "../components/HeadingsAnalysis"
import { ImagesAnalysis } from "../components/ImagesAnalysis"
import { LinksAnalysis } from "../components/LinksAnalysis"
import { SocialAnalysis } from "../components/SocialAnalysis"
import { SERPAnalysis } from "../components/SERPAnalysis"
import { SEOTools } from "../components/SEOTools"
import { SEOAnalysisProvider } from "../hooks/useSEOAnalysis"
import { BarChart3, FileText, Search, Globe, Image, Link, Hash, Wrench, TrendingUp } from "lucide-react"

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
  const [activeTab, setActiveTab] = useState('overview')
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

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

  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-3 h-3" /> },
    { id: 'traffic', label: 'Traffic', icon: <TrendingUp className="w-3 h-3" /> },
    { id: 'issues', label: 'Issues', icon: <FileText className="w-3 h-3" /> },
    { id: 'keyword', label: 'Keyword', icon: <Hash className="w-3 h-3" /> },
    { id: 'serp', label: 'SERP', icon: <Search className="w-3 h-3" /> },
    { id: 'headings', label: 'Headings', icon: <FileText className="w-3 h-3" /> },
    { id: 'images', label: 'Images', icon: <Image className="w-3 h-3" /> },
    { id: 'links', label: 'Links', icon: <Link className="w-3 h-3" /> },
    { id: 'social', label: 'Social', icon: <Globe className="w-3 h-3" /> },
    { id: 'tools', label: 'Tools', icon: <Wrench className="w-3 h-3" /> },
  ]
  
  useEffect(() => {
    // 确保初始状态为关闭
    setIsOpen(false);
    console.log('Content script initialized, drawer state reset to closed');
    
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
        console.log('Side panel state changed:', message.isOpen);
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
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CompactPageAnalysis autoAnalyze={isOpen} onTabChange={setActiveTab} />
      case 'issues':
        return <SEOIssues autoAnalyze={isOpen && activeTab === 'issues'} />
      case 'keyword':
        return <KeywordDensity autoAnalyze={isOpen && activeTab === 'keyword'} />
      case 'traffic':
        return (
          <div className="bg-gradient-to-br from-slate-50/30 to-white h-full">
            <div className="p-4 h-full">
              <div className="card-elevated bg-white rounded-lg h-full overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b">
                  <h3 className="font-medium text-slate-900 text-sm">Traffic Analysis</h3>
                </div>
                <div className="h-full">
                  <iframe 
                    src="https://productbaker.com/"
                    className="w-full h-full border-0"
                    title="ProductBaker Traffic Analysis"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case 'serp':
        return <SERPAnalysis autoAnalyze={isOpen && activeTab === 'serp'} />
      case 'headings':
        return <HeadingsAnalysis autoAnalyze={isOpen && activeTab === 'headings'} />
      case 'images':
        return <ImagesAnalysis autoAnalyze={isOpen && activeTab === 'images'} />
      case 'links':
        return <LinksAnalysis autoAnalyze={isOpen && activeTab === 'links'} />
      case 'social':
        return <SocialAnalysis autoAnalyze={isOpen && activeTab === 'social'} />
      case 'tools':
        return <SEOTools autoAnalyze={isOpen && activeTab === 'tools'} />
      default:
        return <CompactPageAnalysis autoAnalyze={isOpen} onTabChange={setActiveTab} />
    }
  }

  return (
    <SEOAnalysisProvider>
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
                  className={`transition-all duration-300 w-6 h-6 flex items-center justify-center text-lg cursor-pointer rounded-md shadow-sm transform hover:scale-110 ${
                    isSidePanelOpen 
                      ? 'text-green-600 bg-green-50 hover:bg-green-100 shadow-md ring-1 ring-green-200' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:shadow-md'
                  }`}
                  title={isSidePanelOpen ? "Side Panel Open" : "Toggle Side Panel"}
                  style={{
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
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

          {/* Main content with sidebar navigation */}
          <div className="flex flex-1 overflow-hidden">
            <TabNavigation 
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            
            {/* Tab content area */}
            <div className="flex-1 overflow-y-auto">
              {renderTabContent()}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </SEOAnalysisProvider>
  )
}

export default DrawerFloatingPanel