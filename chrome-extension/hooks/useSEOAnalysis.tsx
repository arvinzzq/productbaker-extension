import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { SEOAnalysisEngine, type SEOAnalysis } from "../lib/seoAnalysisEngine"

interface SEOAnalysisContextType {
  analysis: SEOAnalysis | null
  isAnalyzing: boolean
  analyzeCurrentPage: () => Promise<void>
  clearAnalysis: () => void
}

const SEOAnalysisContext = createContext<SEOAnalysisContextType | undefined>(undefined)

interface SEOAnalysisProviderProps {
  children: ReactNode
}

export const SEOAnalysisProvider: React.FC<SEOAnalysisProviderProps> = ({ children }) => {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const analysisEngine = SEOAnalysisEngine.getInstance()

  const analyzeCurrentPage = async () => {
    const url = window.location.href
    
    // 如果URL没变且已有分析结果，直接返回
    if (url === currentUrl && analysis) {
      return
    }
    
    // 检查缓存
    const cachedResult = analysisEngine.getCachedAnalysis(url)
    if (cachedResult && url === currentUrl) {
      setAnalysis(cachedResult)
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await analysisEngine.analyzeCurrentPage()
      setAnalysis(result)
      setCurrentUrl(url)
    } catch (error) {
      console.error('Error analyzing page:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearAnalysis = () => {
    setAnalysis(null)
    setCurrentUrl('')
    analysisEngine.clearCache()
  }

  // 监听URL变化
  useEffect(() => {
    const url = window.location.href
    if (url !== currentUrl) {
      setCurrentUrl(url)
      setAnalysis(null) // 清除旧分析结果
    }
  }, [currentUrl])

  return (
    <SEOAnalysisContext.Provider value={{
      analysis,
      isAnalyzing,
      analyzeCurrentPage,
      clearAnalysis
    }}>
      {children}
    </SEOAnalysisContext.Provider>
  )
}

export const useSEOAnalysis = (): SEOAnalysisContextType => {
  const context = useContext(SEOAnalysisContext)
  if (context === undefined) {
    throw new Error('useSEOAnalysis must be used within a SEOAnalysisProvider')
  }
  return context
}