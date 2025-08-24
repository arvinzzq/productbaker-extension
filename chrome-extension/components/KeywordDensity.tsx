import React, { useState, useEffect } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Search, TrendingUp, Hash } from "lucide-react"

interface KeywordData {
  keyword: string
  count: number
  density: number
  prominence: number
}

interface KeywordDensityProps {
  autoAnalyze?: boolean
}

export const KeywordDensity: React.FC<KeywordDensityProps> = ({ autoAnalyze = false }) => {
  const [keywords, setKeywords] = useState<KeywordData[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [totalWords, setTotalWords] = useState(0)

  const analyzeKeywordDensity = async () => {
    const doc = document
    
    // 获取页面文本内容
    const textContent = doc.body.innerText || ''
    
    // 移除多余的空白和换行
    const cleanText = textContent
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, ' ')
      .toLowerCase()
      .trim()
    
    // 分词
    const words = cleanText.split(/\s+/).filter(word => 
      word.length > 2 && // 忽略长度小于3的词
      !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'way', 'who', 'oil', 'sit', 'set', 'run', 'eat', 'far', 'sea', 'eye', 'ago', 'be', 'we', 'he', 'me', 'it', 'is', 'at', 'on', 'an', 'as', 'of', 'if', 'in', 'by', 'my', 'up', 'do', 'to', 'so', 'or', 'no', 'go'].includes(word)
    )
    
    const totalWordCount = words.length
    setTotalWords(totalWordCount)
    
    // 统计词频
    const wordCount: Record<string, number> = {}
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })
    
    // 计算密度和重要性
    const keywordData: KeywordData[] = []
    
    // 单词分析
    Object.entries(wordCount)
      .filter(([word, count]) => count >= 2) // 至少出现2次
      .forEach(([word, count]) => {
        const density = (count / totalWordCount) * 100
        
        // 计算重要性（基于在标题、H标签等重要位置的出现）
        let prominence = 0
        
        // 检查标题
        if (doc.title.toLowerCase().includes(word)) {
          prominence += 3
        }
        
        // 检查meta description
        const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content')
        if (metaDesc && metaDesc.toLowerCase().includes(word)) {
          prominence += 2
        }
        
        // 检查H标签
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
        Array.from(headings).forEach(heading => {
          if (heading.textContent && heading.textContent.toLowerCase().includes(word)) {
            prominence += heading.tagName === 'H1' ? 2 : 1
          }
        })
        
        keywordData.push({
          keyword: word,
          count,
          density: Number(density.toFixed(2)),
          prominence
        })
      })
    
    // 二词组分析
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`
      if (!wordCount[phrase]) {
        wordCount[phrase] = 0
      }
      wordCount[phrase]++
    }
    
    // 添加高频二词组
    Object.entries(wordCount)
      .filter(([phrase, count]) => phrase.includes(' ') && count >= 2)
      .forEach(([phrase, count]) => {
        const density = (count / totalWordCount) * 100
        let prominence = 0
        
        // 检查重要位置
        if (doc.title.toLowerCase().includes(phrase)) {
          prominence += 3
        }
        
        const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content')
        if (metaDesc && metaDesc.toLowerCase().includes(phrase)) {
          prominence += 2
        }
        
        keywordData.push({
          keyword: phrase,
          count,
          density: Number(density.toFixed(2)),
          prominence
        })
      })
    
    // 排序：按密度和重要性
    keywordData.sort((a, b) => {
      if (a.prominence !== b.prominence) {
        return b.prominence - a.prominence
      }
      return b.density - a.density
    })
    
    return keywordData.slice(0, 20) // 返回前20个关键词
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const keywordData = await analyzeKeywordDensity()
      setKeywords(keywordData)
    } catch (error) {
      console.error('Error analyzing keyword density:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (autoAnalyze) {
      handleAnalyze()
    }
  }, [autoAnalyze])

  const getDensityColor = (density: number) => {
    if (density > 3) return 'text-red-600 bg-red-50'
    if (density > 1.5) return 'text-orange-600 bg-orange-50'
    if (density > 0.5) return 'text-green-600 bg-green-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getDensityLabel = (density: number) => {
    if (density > 3) return 'High'
    if (density > 1.5) return 'Good'
    if (density > 0.5) return 'Low'
    return 'Very Low'
  }

  if (isAnalyzing) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing keyword density...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-50/50 to-white">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200/60 pb-4">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Hash className="w-6 h-6 text-green-600" />
            Keyword Density
          </h3>
          <p className="text-sm text-slate-500 mt-1">Analyze keyword usage and density distribution</p>
          {totalWords > 0 && (
            <p className="text-sm text-slate-600 mt-2 font-medium">
              Total words analyzed: {totalWords.toLocaleString()}
            </p>
          )}
        </div>

      {keywords.length === 0 ? (
        <div className="text-center py-8">
          <Hash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Keyword density analysis will appear here</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Analysis Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Top Keywords:</span>
                <span className="font-medium ml-2">{keywords.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Total Words:</span>
                <span className="font-medium ml-2">{totalWords.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-blue-700">Highest Density:</span>
                <span className="font-medium ml-2">
                  {keywords.length > 0 ? `${keywords[0].density}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Keywords table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                <div>Keyword</div>
                <div className="text-center">Count</div>
                <div className="text-center">Density</div>
                <div className="text-center">Prominence</div>
              </div>
            </div>
            
            <div className="divide-y max-h-96 overflow-y-auto">
              {keywords.map((keyword, index) => (
                <div key={index} className="px-4 py-3 hover:bg-gray-50">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-gray-400" />
                      <span className="font-medium text-gray-900 break-words">
                        {keyword.keyword}
                      </span>
                    </div>
                    
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {keyword.count}
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <Badge 
                        className={`text-xs ${getDensityColor(keyword.density)}`}
                      >
                        {keyword.density}%
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        {Array.from({ length: Math.min(keyword.prominence, 5) }, (_, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-green-400 rounded-full mr-1"
                          />
                        ))}
                        {keyword.prominence === 0 && (
                          <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">SEO Tips</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Ideal keyword density: 0.5% - 2.5%</li>
              <li>• Avoid keyword stuffing (&gt;3% density)</li>
              <li>• Focus on natural, readable content</li>
              <li>• Use synonyms and related terms</li>
              <li>• Higher prominence indicates keywords in important HTML elements</li>
            </ul>
          </div>
        </>
      )}
      </div>
    </div>
  )
}

export default KeywordDensity