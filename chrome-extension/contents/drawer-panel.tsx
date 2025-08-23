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

export const config: PlasmoContentScript = {
  matches: ["https://*/*"],
  all_frames: false,
  run_at: "document_idle"
}

const DrawerFloatingPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    // Listen for messages from background script
    const handleMessage = (message: any) => {
      console.log('Content script received message:', message);
      if (message.type === 'TOGGLE_FLOATING_PANEL') {
        console.log('Toggling drawer...');
        setIsOpen(prev => !prev)
      } else if (message.type === 'HIDE_FLOATING_PANEL') {
        setIsOpen(false)
      }
    }

    // Listen for custom events as backup
    const handleCustomEvent = (event: Event) => {
      console.log('Content script received custom event:', event.type);
      if (event.type === 'TOGGLE_FLOATING_PANEL') {
        console.log('Toggling drawer via custom event...');
        setIsOpen(prev => !prev)
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    window.addEventListener('TOGGLE_FLOATING_PANEL', handleCustomEvent)
    
    // 添加一个全局标记，表明content script已加载
    (window as any).productBakerContentLoaded = true
    console.log('ProductBaker content script loaded');
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
      window.removeEventListener('TOGGLE_FLOATING_PANEL', handleCustomEvent)
    }
  }, [])

  return (
    <div 
      style={{
        zIndex: 2147483647,
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none"
      }}
    >
      <Drawer open={isOpen} onOpenChange={setIsOpen} shouldScaleBackground={false}>
        <DrawerContent 
          side="right" 
          className="w-96 max-w-none"
          style={{
            zIndex: 2147483647,
            pointerEvents: "auto"
          }}
        >
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
              <DrawerClose asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:text-gray-200 hover:bg-green-700"
                >
                  ×
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 p-6 space-y-6">
            {/* 空白内容区域 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                浮动面板
              </h3>
              <p className="text-gray-600 text-sm">
                内容待添加...
              </p>
            </div>

            {/* 示例区域 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">功能区域</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  功能 1
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  功能 2
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  功能 3
                </Button>
              </div>
            </div>

            {/* 信息展示区 */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">信息展示</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>当前页面:</span>
                  <span className="truncate ml-2">{window.location.hostname}</span>
                </div>
                <div className="flex justify-between">
                  <span>状态:</span>
                  <span className="text-green-600">活跃</span>
                </div>
              </div>
            </div>
          </div>

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
    </div>
  )
}

export default DrawerFloatingPanel