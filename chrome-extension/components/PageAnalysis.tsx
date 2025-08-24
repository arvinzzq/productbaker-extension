import React, { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { BarChart3 } from "lucide-react"
import { SEOAnalysisEngine, type SEOAnalysis } from "../lib/seoAnalysisEngine"

interface PageAnalysisComponentProps {
  autoAnalyze?: boolean
}

export const PageAnalysisComponent: React.FC<PageAnalysisComponentProps> = ({ 
  autoAnalyze = false 
}) => {
  const [pageAnalysis, setPageAnalysis] = useState<SEOAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const analysisEngine = SEOAnalysisEngine.getInstance()

  const handleAnalyzePage = async () => {
    setIsAnalyzing(true)
    try {
      const analysis = await analysisEngine.analyzeCurrentPage()
      setPageAnalysis(analysis)
    } catch (error) {
      console.error('Error analyzing page:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (autoAnalyze) {
      console.log('PageAnalysis component mounted, starting auto-analysis...')
      // 延迟一点让组件完全挂载
      setTimeout(() => handleAnalyzePage(), 100)
    }
  }, [autoAnalyze])

  return (
    <div className="bg-white">
      <div className="p-3 space-y-3">
        {/* 移除冗余的Header，直接显示内容 */}

      {/* Basic Page Information */}
      {pageAnalysis && (
        <>
          <div className="bg-white border border-slate-200/50 rounded-xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h4 className="font-semibold text-slate-800 text-base mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Basic Information
            </h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Title</span>
                  <Badge variant="outline" className={`text-xs font-medium ${pageAnalysis.titleLength > 60 ? 'bg-red-50 text-red-700 border-red-200' : pageAnalysis.titleLength < 30 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {pageAnalysis.titleLength}/60
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed break-words bg-slate-50 p-3 rounded-lg">{pageAnalysis.title}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Description</span>
                  <Badge variant="outline" className={`text-xs font-medium ${pageAnalysis.descriptionLength > 160 ? 'bg-red-50 text-red-700 border-red-200' : pageAnalysis.descriptionLength === 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {pageAnalysis.descriptionLength}/160
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed break-words bg-slate-50 p-3 rounded-lg">{pageAnalysis.description}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Keywords</span>
                  <Badge variant="outline" className={`text-xs font-medium ${pageAnalysis.keywords === 'N/A' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {pageAnalysis.keywords === 'N/A' ? 'Missing' : 'Found'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed break-words bg-slate-50 p-3 rounded-lg">{pageAnalysis.keywords}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="text-sm font-semibold text-slate-700 block mb-2">URL</span>
                  <p className="text-sm text-slate-600 break-all bg-slate-50 p-3 rounded-lg font-mono">{pageAnalysis.url}</p>
                </div>

                <div>
                  <span className="text-sm font-semibold text-slate-700 block mb-2">Canonical</span>
                  <p className="text-sm text-slate-600 break-all bg-slate-50 p-3 rounded-lg font-mono">{pageAnalysis.canonical}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Headings Structure */}
          <div className="bg-white border border-slate-200/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h4 className="font-semibold text-slate-800 text-base mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Headings Structure
            </h4>
            <div className="grid grid-cols-6 gap-4">
              {Object.entries(pageAnalysis.headings).map(([tag, count]) => (
                <div key={tag} className="text-center bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{tag}</div>
                  <div className={`text-2xl font-bold ${count > 0 ? 'text-green-600' : 'text-slate-400'}`}>{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Images & Links Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Images Analysis */}
            <div className="bg-white border border-slate-200/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h4 className="font-semibold text-slate-800 text-base mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Images
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Total Images</span>
                  <span className="text-sm font-bold text-slate-900">{pageAnalysis.images.total}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Unique Sources</span>
                  <span className="text-sm font-bold text-slate-900">{pageAnalysis.images.unique}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Without Alt Text</span>
                  <span className={`text-sm font-bold ${pageAnalysis.images.withoutAlt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {pageAnalysis.images.withoutAlt}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Without Title</span>
                  <span className={`text-sm font-bold ${pageAnalysis.images.withoutTitle > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {pageAnalysis.images.withoutTitle}
                  </span>
                </div>
              </div>
            </div>

            {/* Links Analysis */}
            <div className="bg-white border border-slate-200/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h4 className="font-semibold text-slate-800 text-base mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Links
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Total Links</span>
                  <span className="text-sm font-bold text-slate-900">{pageAnalysis.links.total}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Unique Links</span>
                  <span className="text-sm font-bold text-slate-900">{pageAnalysis.links.unique}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Internal / External</span>
                  <span className="text-sm font-bold text-slate-900">{pageAnalysis.links.internal} / {pageAnalysis.links.external}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Dofollow / Nofollow</span>
                  <span className="text-sm font-bold text-slate-900">{pageAnalysis.links.dofollow} / {pageAnalysis.links.nofollow}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Information */}
          <div className="bg-white border border-slate-200/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h4 className="font-semibold text-slate-800 text-base mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Domain Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Domain</span>
                <span className="text-sm font-bold text-slate-900 font-mono">{pageAnalysis.domain}</span>
              </div>
            </div>
          </div>

          {/* Technical Configuration */}
          <div className="bg-white border border-slate-200/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h4 className="font-semibold text-slate-800 text-base mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Technical Configuration
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Favicon</span>
                <div className="flex items-center gap-2">
                  {pageAnalysis.favicon && pageAnalysis.faviconUrl && (
                    <img 
                      src={pageAnalysis.faviconUrl} 
                      alt="Favicon"
                      className="w-4 h-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  )}
                  <Badge className={`text-xs font-medium ${pageAnalysis.favicon ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {pageAnalysis.favicon ? 'Found' : 'Missing'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">SSR Check</span>
                <Badge className={`text-xs font-medium ${pageAnalysis.ssrCheck ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                  {pageAnalysis.ssrCheck ? 'Detected' : 'Not Detected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">robots.txt</span>
                <Badge className={`text-xs font-medium ${pageAnalysis.robotsTxt ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {pageAnalysis.robotsTxt ? 'Available' : 'Missing'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">sitemap.xml</span>
                <Badge className={`text-xs font-medium ${pageAnalysis.sitemap ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {pageAnalysis.sitemap ? 'Available' : 'Missing'}
                </Badge>
              </div>
            </div>
            
            {/* Robots Tags */}
            <div className="mt-4 space-y-3">
              <div>
                <span className="text-sm font-medium text-slate-700 block mb-2">Robots Tag</span>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-sm text-slate-700 font-mono">{pageAnalysis.robotsTag}</p>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700 block mb-2">X-Robots-Tag</span>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-sm text-slate-700 font-mono">{pageAnalysis.xRobotsTag}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Tools */}
          <div className="bg-white border border-slate-200/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h4 className="font-semibold text-slate-800 text-base mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              Analytics & Tools
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Google Analytics</span>
                <Badge className={`text-xs font-medium ${pageAnalysis.googleAnalytics ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {pageAnalysis.googleAnalytics ? 'Detected' : 'Not Found'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Google AdSense</span>
                <Badge className={`text-xs font-medium ${pageAnalysis.googleAdsense ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {pageAnalysis.googleAdsense ? 'Detected' : 'Not Found'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Page Metrics */}
          <div className="bg-white border border-slate-200/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h4 className="font-semibold text-slate-800 text-base mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Page Metrics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Word Count</span>
                <span className="text-sm font-bold text-slate-900">{pageAnalysis.wordCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Language</span>
                <span className="text-sm font-bold text-slate-900">{pageAnalysis.language}</span>
              </div>
            </div>
          </div>

          {/* SEO Issues Section */}
          <div className="bg-white border border-slate-200/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h4 className="font-semibold text-slate-800 text-base mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              SEO Issues Analysis
            </h4>
            <div className="space-y-3">
              {pageAnalysis.seoIssues.map((issue, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    issue.type === 'success' ? 'bg-green-50 border-green-200' :
                    issue.type === 'warning' ? 'bg-blue-50 border-blue-200' :
                    'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      issue.type === 'success' ? 'bg-green-500' :
                      issue.type === 'warning' ? 'bg-blue-500' :
                      'bg-red-500'
                    }`}>
                      {issue.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm mb-1 ${
                        issue.type === 'success' ? 'text-green-800' :
                        issue.type === 'warning' ? 'text-blue-800' :
                        'text-red-800'
                      }`}>
                        {issue.title}
                      </div>
                      <div className={`text-sm leading-relaxed ${
                        issue.type === 'success' ? 'text-green-700' :
                        issue.type === 'warning' ? 'text-blue-700' :
                        'text-red-700'
                      }`}>
                        {issue.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </>
      )}

        {/* Initial State */}
        {!pageAnalysis && !isAnalyzing && (
          <div className="text-center py-12">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-semibold text-slate-700 mb-2">Ready to Analyze</h4>
              <p className="text-slate-500">Switch to this tab to start analyzing the current page</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="text-center py-12">
            <div className="max-w-sm mx-auto">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h4 className="text-lg font-semibold text-slate-700 mb-2">Analyzing Page</h4>
              <p className="text-slate-500">Please wait while we gather SEO insights...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PageAnalysisComponent