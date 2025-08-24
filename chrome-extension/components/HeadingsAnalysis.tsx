import React, { useState, useEffect } from "react"
import { useSEOAnalysis } from "../hooks/useSEOAnalysis"

interface HeadingItem {
  level: number
  text: string
  tag: string
}

interface HeadingsAnalysisProps {
  autoAnalyze?: boolean
}

export const HeadingsAnalysis: React.FC<HeadingsAnalysisProps> = ({ autoAnalyze = false }) => {
  const { analysis, isAnalyzing, analyzeCurrentPage } = useSEOAnalysis()
  const [headingsList, setHeadingsList] = useState<HeadingItem[]>([])

  useEffect(() => {
    if (autoAnalyze && !analysis && !isAnalyzing) {
      analyzeCurrentPage()
    }
  }, [autoAnalyze, analysis, isAnalyzing, analyzeCurrentPage])

  useEffect(() => {
    if (analysis) {
      extractHeadingsFromPage()
    }
  }, [analysis])

  const extractHeadingsFromPage = () => {
    try {
      const headings: HeadingItem[] = []
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      
      headingElements.forEach((heading) => {
        const level = parseInt(heading.tagName.substring(1))
        const text = heading.textContent?.trim() || ''
        if (text) {
          headings.push({
            level,
            text,
            tag: heading.tagName.toLowerCase()
          })
        }
      })
      
      setHeadingsList(headings)
    } catch (error) {
      console.error('Error extracting headings:', error)
    }
  }

  const getHeadingStats = () => {
    if (!analysis) {
      return {
        h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0, total: 0
      }
    }
    
    const stats = {
      h1: analysis.headings.h1 || 0,
      h2: analysis.headings.h2 || 0,
      h3: analysis.headings.h3 || 0,
      h4: analysis.headings.h4 || 0,
      h5: analysis.headings.h5 || 0,
      h6: analysis.headings.h6 || 0,
    }
    
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0)
    return { ...stats, total }
  }

  const getStructureIssues = () => {
    const stats = getHeadingStats()
    const issues: string[] = []
    
    if (stats.h1 === 0) {
      issues.push('Missing H1 tag - Every page should have exactly one H1')
    } else if (stats.h1 > 1) {
      issues.push('Multiple H1 tags found - Use only one H1 per page')
    }
    
    if (stats.h2 === 0 && stats.total > 1) {
      issues.push('Consider using H2 tags to break up content')
    }
    
    // Check heading structure
    let hasH1 = false, hasH2 = false, hasH3 = false
    headingsList.forEach(heading => {
      if (heading.level === 1) hasH1 = true
      if (heading.level === 2) hasH2 = true
      if (heading.level === 3) hasH3 = true
      
      // Check for skipped levels (e.g., H1 → H3 without H2)
      if (heading.level === 3 && !hasH2) {
        issues.push('Heading structure issue: H3 used without H2')
      }
      if (heading.level === 4 && !hasH3) {
        issues.push('Heading structure issue: H4 used without H3')
      }
    })
    
    return issues
  }

  if (isAnalyzing) {
    return (
      <div className="bg-gradient-to-br from-slate-50/30 to-white">
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <p className="text-sm text-slate-600 mt-2">Analyzing headings structure...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="bg-gradient-to-br from-slate-50/30 to-white">
        <div className="p-4 text-center text-slate-500">
          <p className="text-sm">Ready to analyze headings structure</p>
        </div>
      </div>
    )
  }

  const stats = getHeadingStats()
  const issues = getStructureIssues()

  return (
    <div className="bg-gradient-to-br from-slate-50/30 to-white">
      <div className="p-4 space-y-4">
        
        {/* Statistics Card */}
        <div className="card-elevated bg-white rounded-lg">
          <div className="p-4 space-y-4">
            <h3 className="font-medium text-slate-900 text-sm">Headings Statistics</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {Object.entries(stats).filter(([tag]) => tag !== 'total').map(([tag, count]) => (
                <div key={tag} className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className={`text-lg font-bold ${count === 0 ? 'text-slate-400' : 'text-slate-800'}`}>
                    {count}
                  </div>
                  <div className="text-xs text-slate-600 uppercase">{tag}</div>
                </div>
              ))}
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{stats.total}</div>
              <div className="text-sm text-green-700">Total Headings</div>
            </div>
          </div>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div className="card-elevated bg-white rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Structure Issues
            </h4>
            <div className="space-y-2">
              {issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                  <div className="w-4 h-4 text-red-500 mt-0.5">⚠</div>
                  <p className="text-sm text-red-700">{issue}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Headings List */}
        <div className="card-elevated bg-white rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b">
            <h4 className="font-semibold text-slate-900">Headings Hierarchy</h4>
          </div>
          
          {headingsList.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No headings found on this page</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {headingsList.map((heading, index) => (
                <div
                  key={index}
                  className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        heading.level === 1 ? 'bg-red-100 text-red-700' :
                        heading.level === 2 ? 'bg-orange-100 text-orange-700' :
                        heading.level === 3 ? 'bg-yellow-100 text-yellow-700' :
                        heading.level === 4 ? 'bg-green-100 text-green-700' :
                        heading.level === 5 ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {heading.tag.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-sm text-slate-800 break-words"
                        style={{ 
                          marginLeft: `${(heading.level - 1) * 12}px`,
                          fontSize: `${Math.max(14 - heading.level, 11)}px`
                        }}
                      >
                        {heading.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO Recommendations */}
        <div className="card-elevated bg-white rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-3">SEO Recommendations</h4>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-500 mt-0.5">💡</div>
              <p>Use headings to create a clear content hierarchy</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-500 mt-0.5">💡</div>
              <p>Include target keywords naturally in headings</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-500 mt-0.5">💡</div>
              <p>Keep headings descriptive and under 60 characters</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-500 mt-0.5">💡</div>
              <p>Don't skip heading levels (H1 → H2 → H3)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeadingsAnalysis