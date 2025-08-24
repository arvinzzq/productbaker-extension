import React, { useState, useEffect } from "react"
import { useSEOAnalysis } from "../hooks/useSEOAnalysis"

interface SearchEnginePreview {
  engine: string
  title: string
  description: string
  url: string
  displayUrl: string
  favicon?: string
}

interface SERPAnalysisProps {
  autoAnalyze?: boolean
}

export const SERPAnalysis: React.FC<SERPAnalysisProps> = ({ autoAnalyze = false }) => {
  const { analysis, isAnalyzing, analyzeCurrentPage } = useSEOAnalysis()
  const [previews, setPreviews] = useState<SearchEnginePreview[]>([])
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false)

  useEffect(() => {
    if (autoAnalyze && !analysis && !isAnalyzing) {
      analyzeCurrentPage()
    }
  }, [autoAnalyze, analysis, isAnalyzing, analyzeCurrentPage])

  useEffect(() => {
    if (analysis) {
      generateSERPPreviews()
    }
  }, [analysis])

  const generateSERPPreviews = () => {
    setIsLoadingPreviews(true)
    try {
      if (!analysis) return

      const baseUrl = window.location.href
      const domain = new URL(baseUrl).hostname
      const displayUrl = baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')

      // Get Open Graph data for fallbacks
      const ogTitle = getMetaContent('og:title')
      const ogDescription = getMetaContent('og:description')
      
      const searchEnginePreviews: SearchEnginePreview[] = [
        {
          engine: 'Google',
          title: analysis.title || ogTitle || 'Untitled Page',
          description: analysis.description || ogDescription || 'No description available',
          url: baseUrl,
          displayUrl: displayUrl.length > 60 ? displayUrl.substring(0, 60) + '...' : displayUrl,
          favicon: analysis.faviconUrl
        },
        {
          engine: 'Bing',
          title: analysis.title || ogTitle || 'Untitled Page',
          description: analysis.description || ogDescription || 'No description available',
          url: baseUrl,
          displayUrl: displayUrl.length > 55 ? displayUrl.substring(0, 55) + '...' : displayUrl,
          favicon: analysis.faviconUrl
        },
        {
          engine: 'DuckDuckGo',
          title: analysis.title || ogTitle || 'Untitled Page',
          description: analysis.description || ogDescription || 'No description available',
          url: baseUrl,
          displayUrl: domain,
          favicon: analysis.faviconUrl
        },
        {
          engine: 'Yahoo',
          title: analysis.title || ogTitle || 'Untitled Page',
          description: analysis.description || ogDescription || 'No description available',
          url: baseUrl,
          displayUrl: displayUrl.length > 50 ? displayUrl.substring(0, 50) + '...' : displayUrl,
          favicon: analysis.faviconUrl
        }
      ]

      setPreviews(searchEnginePreviews)
    } catch (error) {
      console.error('Error generating SERP previews:', error)
    } finally {
      setIsLoadingPreviews(false)
    }
  }

  const getMetaContent = (property: string): string => {
    const meta = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`)
    return meta?.getAttribute('content') || ''
  }

  const getSERPIssues = () => {
    const issues: string[] = []
    
    if (!analysis) return issues

    if (!analysis.title || analysis.title === 'N/A') {
      issues.push('Missing page title - essential for search results')
    } else if (analysis.titleLength > 60) {
      issues.push('Title too long - may be truncated in search results')
    } else if (analysis.titleLength < 30) {
      issues.push('Title too short - consider adding more descriptive keywords')
    }

    if (!analysis.description || analysis.description === 'N/A') {
      issues.push('Missing meta description - search engines will generate snippet automatically')
    } else if (analysis.descriptionLength > 160) {
      issues.push('Meta description too long - will be truncated in search results')
    } else if (analysis.descriptionLength < 120) {
      issues.push('Meta description could be longer to provide more information')
    }

    if (!analysis.faviconUrl) {
      issues.push('Missing favicon - may affect brand recognition in search results')
    }

    if (!analysis.canonical || analysis.canonical === 'Missing') {
      issues.push('Missing canonical URL - may cause duplicate content issues')
    }

    return issues
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  const getCharacterStatus = (length: number, optimal: [number, number]) => {
    if (length >= optimal[0] && length <= optimal[1]) {
      return { color: 'text-green-600', bg: 'bg-green-100' }
    } else if (length < optimal[0] || length > optimal[1]) {
      return { color: 'text-red-600', bg: 'bg-red-100' }
    }
    return { color: 'text-yellow-600', bg: 'bg-yellow-100' }
  }

  if (isAnalyzing || isLoadingPreviews) {
    return (
      <div className="bg-gradient-to-br from-slate-50/30 to-white">
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <p className="text-sm text-slate-600 mt-2">Analyzing SERP previews...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="bg-gradient-to-br from-slate-50/30 to-white">
        <div className="p-4 text-center text-slate-500">
          <p className="text-sm">Ready to analyze SERP appearance</p>
        </div>
      </div>
    )
  }

  const issues = getSERPIssues()
  const titleStatus = getCharacterStatus(analysis.titleLength, [30, 60])
  const descStatus = getCharacterStatus(analysis.descriptionLength, [120, 160])

  return (
    <div className="bg-gradient-to-br from-slate-50/30 to-white">
      <div className="p-4 space-y-4">
        
        {/* SEO Metrics Card */}
        <div className="card-elevated bg-white rounded-lg">
          <div className="p-4 space-y-4">
            <h3 className="font-medium text-slate-900 text-sm">SERP Optimization Metrics</h3>
            
            {/* Title Analysis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900 text-sm">Page Title</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${titleStatus.bg} ${titleStatus.color}`}>
                    {analysis.titleLength}/60
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {analysis.title === 'N/A' ? (
                  <span className="not-set">Not set</span>
                ) : analysis.title}
              </p>
            </div>

            {/* Description Analysis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900 text-sm">Meta Description</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${descStatus.bg} ${descStatus.color}`}>
                    {analysis.descriptionLength}/160
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {analysis.description === 'N/A' ? (
                  <span className="not-set">Not set</span>
                ) : analysis.description}
              </p>
            </div>
          </div>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div className="card-elevated bg-white rounded-lg">
            <div className="p-4 space-y-2">
              <h4 className="font-medium text-slate-900 text-sm flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                SERP Issues
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
          </div>
        )}

        {/* Search Engine Previews */}
        <div className="space-y-3">
          {previews.map((preview, index) => (
            <div key={index} className="card-elevated bg-white rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {preview.engine === 'Google' && (
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                  )}
                  {preview.engine === 'Bing' && (
                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">B</span>
                    </div>
                  )}
                  {preview.engine === 'DuckDuckGo' && (
                    <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">D</span>
                    </div>
                  )}
                  {preview.engine === 'Yahoo' && (
                    <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Y</span>
                    </div>
                  )}
                  <span className="font-medium text-slate-900 text-sm">{preview.engine} Preview</span>
                </div>
              </div>
              
              <div className="p-4">
                {/* SERP Preview */}
                <div className="space-y-2">
                  {/* URL */}
                  <div className="flex items-center gap-2">
                    {preview.favicon && (
                      <img
                        src={preview.favicon}
                        alt="Site favicon"
                        className="w-4 h-4 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}
                    <span className="text-sm text-green-600 font-mono">
                      {preview.displayUrl}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-blue-600 text-lg hover:underline cursor-pointer leading-snug">
                      {preview.engine === 'Google' ? truncateText(preview.title, 60) :
                       preview.engine === 'Bing' ? truncateText(preview.title, 65) :
                       preview.engine === 'DuckDuckGo' ? truncateText(preview.title, 55) :
                       truncateText(preview.title, 70)}
                    </h3>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {preview.engine === 'Google' ? truncateText(preview.description, 160) :
                       preview.engine === 'Bing' ? truncateText(preview.description, 165) :
                       preview.engine === 'DuckDuckGo' ? truncateText(preview.description, 150) :
                       truncateText(preview.description, 155)}
                    </p>
                  </div>

                  {/* Additional elements based on engine */}
                  {preview.engine === 'Google' && (
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                      <span>•</span>
                      <span>Breadcrumbs might appear here</span>
                      <span>•</span>
                      <span>Sitelinks possible</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SERP Optimization Tips */}
        <div className="card-elevated bg-white rounded-lg">
          <div className="p-4 space-y-2">
            <h4 className="font-medium text-slate-900 text-sm">SERP Optimization Tips</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 text-green-500 mt-0.5">💡</div>
                <p>Write compelling titles with primary keywords near the beginning</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 text-green-500 mt-0.5">💡</div>
                <p>Create unique meta descriptions that encourage clicks</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 text-green-500 mt-0.5">💡</div>
                <p>Use structured data to enhance search result appearance</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 text-green-500 mt-0.5">💡</div>
                <p>Monitor click-through rates and optimize based on performance</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 text-green-500 mt-0.5">💡</div>
                <p>Include your brand name in titles for recognition</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SERPAnalysis