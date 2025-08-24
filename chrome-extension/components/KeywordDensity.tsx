import React, { useState, useEffect } from "react"
import { Badge } from "./ui/badge"
import { KeywordDensityEngine, type KeywordDensityAnalysis } from "../lib/keywordDensityEngine"

interface KeywordDensityProps {
  autoAnalyze?: boolean
}

export const KeywordDensity: React.FC<KeywordDensityProps> = ({ autoAnalyze = false }) => {
  const [analysis, setAnalysis] = useState<KeywordDensityAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'1word' | '2words' | '3words' | '4words' | '5words'>('1word')
  const densityEngine = KeywordDensityEngine.getInstance()

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const keywordAnalysis = densityEngine.analyzeKeywordDensity()
      setAnalysis(keywordAnalysis)
    } catch (error) {
      console.error('Error analyzing keyword density:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (autoAnalyze && !analysis) {
      handleAnalyze()
    }
  }, [autoAnalyze, analysis])

  const getCurrentKeywords = () => {
    if (!analysis) return []

    switch (activeTab) {
      case '1word': return analysis.oneWord
      case '2words': return analysis.twoWords
      case '3words': return analysis.threeWords
      case '4words': return analysis.fourWords
      case '5words': return analysis.fiveWords
      default: return analysis.oneWord
    }
  }

  const getDensityColor = (density: number) => {
    if (density > 3) return 'text-red-600'
    if (density > 1.5) return 'text-orange-600'
    if (density > 0.5) return 'text-green-600'
    return 'text-gray-600'
  }

  const currentKeywords = getCurrentKeywords()

  if (isAnalyzing) {
    return (
      <div className="bg-white">
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 mt-2">Analyzing keywords...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="bg-white">
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">Ready to analyze keyword density</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { key: '1word', label: '1 word' },
            { key: '2words', label: '2 words' },
            { key: '3words', label: '3 words' },
            { key: '4words', label: '4 words' },
            { key: '5words', label: '5 words' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Keywords Table */}
      {/* Table Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
          <div>Keyword</div>
          <div className="text-center">Count</div>
          <div className="text-center">Total</div>
          <div className="text-center">Density</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="max-h-96 overflow-y-auto">
        {currentKeywords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">No {activeTab.replace('words', ' word').replace('word', ' word')} keywords found</p>
          </div>
        ) : (
          currentKeywords.map((keyword, index) => (
            <div
              key={index}
              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}
            >
              <div className="grid grid-cols-4 gap-4 items-center text-sm">
                <div className="font-medium text-gray-900 break-words">
                  {keyword.keyword}
                </div>
                <div className="text-center font-medium text-gray-800">
                  {keyword.count}
                </div>
                <div className="text-center text-gray-600">
                  {analysis.totalWords}
                </div>
                <div className="text-center">
                  <span className={`font-medium ${getDensityColor(keyword.density)}`}>
                    {keyword.density.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default KeywordDensity