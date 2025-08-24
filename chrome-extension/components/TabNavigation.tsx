import React from "react"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"

interface Tab {
  id: string
  label: string
  icon: React.ReactNode
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="w-[100px] bg-gradient-to-b from-white via-slate-50/50 to-slate-100/30 border-r border-slate-200/60 flex flex-col h-full shadow-lg backdrop-blur-sm">
      <div className="flex-1 py-3 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-full flex items-center gap-1 px-1 py-2.5 mb-0.5 text-left text-xs font-medium rounded-md transition-all duration-300 transform relative overflow-hidden group border-l-3 border-l-transparent",
              "hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-slate-50/60 hover:shadow-md hover:scale-[1.01] hover:-translate-x-0.5",
              activeTab === tab.id
                ? "bg-gradient-to-r from-green-50 to-emerald-50/50 border-l-green-500 text-green-700 shadow-md transform scale-[1.01] -translate-x-0.5"
                : "text-slate-600 hover:text-slate-800"
            )}
            style={{
              boxShadow: activeTab === tab.id 
                ? '0 3px 8px rgba(34, 197, 94, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.25)' 
                : '0 1px 2px rgba(0, 0, 0, 0.03)'
            }}
          >
            {/* Active indicator */}
            {activeTab === tab.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/4 to-emerald-500/4 rounded-md"></div>
            )}
            
            {/* Icon */}
            <div className={cn(
              "w-3 h-3 flex-shrink-0 transition-all duration-300 relative z-10",
              activeTab === tab.id ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"
            )}>
              {tab.icon}
            </div>
            
            {/* Label */}
            <span className="truncate text-xs font-medium relative z-10">{tab.label}</span>
            
            {/* Hover effect background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
          </button>
        ))}
      </div>
      
      {/* Footer decoration */}
      <div className="px-3 py-2">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300/40 to-transparent rounded-full"></div>
      </div>
    </div>
  )
}

export default TabNavigation