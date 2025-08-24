import React, { useState, useEffect } from "react"
import type { PlasmoContentScript } from "plasmo"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../components/ui/drawer"
import { Button } from "../components/ui/button"
import { PageAnalysisComponent } from "../components/PageAnalysis"

import styleText from "data-text:../globals.css"

export const config: PlasmoContentScript = {
  matches: ["https://*/*"],
  all_frames: false,
  run_at: "document_idle"
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  // 确保样式被添加到document.head
  if (!document.head.querySelector('#productbaker-styles')) {
    style.id = 'productbaker-styles'
    document.head.appendChild(style)
    console.log('ProductBaker styles injected')
  }
  return style
}


const DrawerFloatingPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    // 确保样式被注入
    getStyle();
    
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
  
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent side="right">
        <DrawerHeader className="bg-green-600 text-white -m-6 mb-0 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">PB</span>
              </div>
              <div>
                <DrawerTitle className="text-white text-left">ProductBaker</DrawerTitle>
                <DrawerDescription className="text-green-100 text-left">
                  Chrome Extension
                </DrawerDescription>
              </div>
            </div>
            <DrawerClose 
              className="text-white hover:text-gray-200 hover:bg-green-700 bg-transparent border-none px-3 py-1 text-xl cursor-pointer rounded"
            >
              ×
            </DrawerClose>
          </div>
        </DrawerHeader>

        <PageAnalysisComponent autoAnalyze={isOpen} />

        {/* 底部区域 */}
        <div className="border-t p-4 bg-gray-50 -m-6 mt-0">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>ProductBaker v1.0</span>
            <Button variant="ghost" size="sm" className="text-green-600">
              设置
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default DrawerFloatingPanel