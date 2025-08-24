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
import { SEOAnalysisProvider } from "../hooks/useSEOAnalysis"
import { BarChart3, FileText, Search, Globe, Image, Link, Hash } from "lucide-react"

import styleText from "data-text:../globals.css"

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
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'traffic', label: 'Traffic', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'issues', label: 'Issues', icon: <FileText className="w-5 h-5" /> },
    { id: 'serp', label: 'SERP', icon: <Search className="w-5 h-5" /> },
    { id: 'density', label: 'Density', icon: <Hash className="w-5 h-5" /> },
    { id: 'headings', label: 'Headings', icon: <FileText className="w-5 h-5" /> },
    { id: 'images', label: 'Images', icon: <Image className="w-5 h-5" /> },
    { id: 'links', label: 'Links', icon: <Link className="w-5 h-5" /> },
    { id: 'social', label: 'Social', icon: <Globe className="w-5 h-5" /> },
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
        return <CompactPageAnalysis autoAnalyze={isOpen} />
      case 'issues':
        return <SEOIssues autoAnalyze={isOpen && activeTab === 'issues'} />
      case 'density':
        return <KeywordDensity autoAnalyze={isOpen && activeTab === 'density'} />
      case 'traffic':
        return (
          <div className="bg-gradient-to-br from-slate-50/50 to-white">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-4">Traffic Analysis</h3>
              <p className="text-slate-600">Traffic analysis features coming soon...</p>
            </div>
          </div>
        )
      case 'serp':
        return (
          <div className="bg-gradient-to-br from-slate-50/50 to-white">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-4">SERP Analysis</h3>
              <p className="text-slate-600">SERP analysis coming soon...</p>
            </div>
          </div>
        )
      case 'headings':
        return (
          <div className="bg-gradient-to-br from-slate-50/50 to-white">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-4">Headings Structure</h3>
              <p className="text-slate-600">Detailed headings analysis coming soon...</p>
            </div>
          </div>
        )
      case 'images':
        return (
          <div className="bg-gradient-to-br from-slate-50/50 to-white">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-4">Images Analysis</h3>
              <p className="text-slate-600">Images SEO analysis coming soon...</p>
            </div>
          </div>
        )
      case 'links':
        return (
          <div className="bg-gradient-to-br from-slate-50/50 to-white">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-4">Links Analysis</h3>
              <p className="text-slate-600">Links analysis coming soon...</p>
            </div>
          </div>
        )
      case 'social':
        return (
          <div className="bg-gradient-to-br from-slate-50/50 to-white">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-4">Social Media</h3>
              <p className="text-slate-600">Social media analysis coming soon...</p>
            </div>
          </div>
        )
      default:
        return <CompactPageAnalysis autoAnalyze={isOpen} />
    }
  }

  return (
    <SEOAnalysisProvider>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent side="right">
          {/* Header with close button */}
          <DrawerHeader className="bg-white text-gray-800 px-4 py-3 flex-shrink-0 border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  P
                </div>
                <DrawerTitle className="text-primary text-sm font-medium">
                  ProductBaker
                </DrawerTitle>
              </div>
              <DrawerClose 
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors w-6 h-6 flex items-center justify-center text-lg cursor-pointer rounded"
              >
                ×
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* Main content with sidebar navigation */}
          <div className="flex flex-1 min-h-0">
            <TabNavigation 
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            
            {/* Tab content area */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {renderTabContent()}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </SEOAnalysisProvider>
  )
}

export default DrawerFloatingPanel