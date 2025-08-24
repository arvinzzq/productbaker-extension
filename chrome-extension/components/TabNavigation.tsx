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
    <div className="w-28 bg-slate-50 border-r border-slate-200 flex flex-col h-full">
      <div className="flex-1 py-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-2 text-left text-xs font-medium transition-all duration-200",
              "hover:bg-slate-100",
              activeTab === tab.id
                ? "bg-white border-r-2 border-green-600 text-green-700 shadow-sm"
                : "text-slate-600 hover:text-slate-700"
            )}
          >
            <div className={cn(
              "w-4 h-4 flex-shrink-0 transition-colors",
              activeTab === tab.id ? "text-green-600" : "text-slate-400"
            )}>
              {tab.icon}
            </div>
            <span className="truncate text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TabNavigation