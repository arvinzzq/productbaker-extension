import React, { useEffect } from "react"
import { Badge } from "./ui/badge"
import { useSEOAnalysis } from "../hooks/useSEOAnalysis"

interface CompactPageAnalysisProps {
  autoAnalyze?: boolean
}

export const CompactPageAnalysis: React.FC<CompactPageAnalysisProps> = ({ autoAnalyze = false }) => {
  const { analysis: pageAnalysis, isAnalyzing, analyzeCurrentPage } = useSEOAnalysis()

  useEffect(() => {
    if (autoAnalyze && !pageAnalysis && !isAnalyzing) {
      analyzeCurrentPage()
    }
  }, [autoAnalyze, pageAnalysis, isAnalyzing, analyzeCurrentPage])

  if (isAnalyzing) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        <p className="text-sm text-gray-600 mt-2">Analyzing...</p>
      </div>
    )
  }

  if (!pageAnalysis) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">Ready to analyze</p>
      </div>
    )
  }

  return (
    <div className="bg-white text-sm overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Title Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-4 bg-blue-500 rounded-sm"></div>
            <span className="font-medium text-gray-800">Title</span>
            <Badge 
              variant="outline" 
              className={`ml-auto text-xs ${
                pageAnalysis.titleLength >= 30 && pageAnalysis.titleLength <= 60 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}
            >
              {pageAnalysis.titleLength}/60
            </Badge>
          </div>
          <div className="text-gray-700 text-sm leading-relaxed pl-4">
            {pageAnalysis.title}
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-4 bg-blue-500 rounded-sm"></div>
            <span className="font-medium text-gray-800">Description</span>
            <Badge 
              variant="outline" 
              className={`ml-auto text-xs ${
                pageAnalysis.descriptionLength > 0 && pageAnalysis.descriptionLength <= 160
                  ? 'bg-orange-50 text-orange-700 border-orange-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {pageAnalysis.descriptionLength}/160
            </Badge>
          </div>
          <div className="text-gray-700 text-sm leading-relaxed pl-4">
            {pageAnalysis.description === 'N/A' ? (
              <span className="text-gray-500 italic">No description found</span>
            ) : pageAnalysis.description}
          </div>
        </div>

        {/* Keywords Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-4 bg-blue-500 rounded-sm"></div>
            <span className="font-medium text-gray-800">Keywords</span>
          </div>
          <div className="text-gray-700 text-sm leading-relaxed pl-4">
            {pageAnalysis.keywords === 'N/A' ? 'N/A' : pageAnalysis.keywords}
          </div>
        </div>

        {/* URL Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-4 bg-blue-500 rounded-sm"></div>
            <span className="font-medium text-gray-800">Url</span>
          </div>
          <div className="text-gray-700 text-sm leading-relaxed pl-4 break-all font-mono">
            {pageAnalysis.url}
          </div>
        </div>

        {/* Canonical Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-4 bg-blue-500 rounded-sm"></div>
            <span className="font-medium text-gray-800">Canonical</span>
          </div>
          <div className="text-gray-700 text-sm leading-relaxed pl-4 break-all font-mono">
            {pageAnalysis.canonical}
          </div>
        </div>


        {/* Technical Status Grid */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            {/* Favicon */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Favicon</span>
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
                <div className={`w-8 h-6 rounded flex items-center justify-center ${pageAnalysis.favicon ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <div className={`w-2 h-2 rounded-full ${pageAnalysis.favicon ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
              </div>
            </div>

            {/* SSR Check */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SSR Check</span>
              <div className={`w-8 h-6 rounded flex items-center justify-center ${pageAnalysis.ssrCheck ? 'bg-green-100' : 'bg-gray-200'}`}>
                <div className={`w-2 h-2 rounded-full ${pageAnalysis.ssrCheck ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>
            </div>
          </div>

          {/* Robots Tag */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Robots Tag</span>
              <span className="text-sm font-medium text-gray-800">
                {pageAnalysis.robotsTag}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">X-Robots-Tag</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${pageAnalysis.xRobotsTag === 'Missing' ? 'text-orange-600' : 'text-gray-800'}`}>
                  {pageAnalysis.xRobotsTag}
                </span>
                {pageAnalysis.xRobotsTag === 'Missing' && (
                  <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
                    <div className="text-orange-600 text-xs">!</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Files Status */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">robots.txt</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${pageAnalysis.robotsTxt ? 'text-green-600' : 'text-gray-600'}`}>
                  {pageAnalysis.robotsTxt ? 'Available' : 'N/A'}
                </span>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${pageAnalysis.robotsTxt ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <div className={`text-xs ${pageAnalysis.robotsTxt ? 'text-green-600' : 'text-gray-400'}`}>
                    {pageAnalysis.robotsTxt ? '✓' : '✗'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">sitemap.xml</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${pageAnalysis.sitemap ? 'text-green-600' : 'text-gray-600'}`}>
                  {pageAnalysis.sitemap ? 'Available' : 'N/A'}
                </span>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${pageAnalysis.sitemap ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <div className={`text-xs ${pageAnalysis.sitemap ? 'text-green-600' : 'text-gray-400'}`}>
                    {pageAnalysis.sitemap ? '✓' : '✗'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Tools Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Google Analytics</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${pageAnalysis.googleAnalytics ? 'text-green-600' : 'text-orange-600'}`}>
                  {pageAnalysis.googleAnalytics ? 'Detected' : 'Missing'}
                </span>
                {!pageAnalysis.googleAnalytics && (
                  <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
                    <div className="text-orange-600 text-xs">!</div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Google AdSense</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${pageAnalysis.googleAdsense ? 'text-green-600' : 'text-orange-600'}`}>
                  {pageAnalysis.googleAdsense ? 'Detected' : 'Missing'}
                </span>
                {!pageAnalysis.googleAdsense && (
                  <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
                    <div className="text-orange-600 text-xs">!</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Statistics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Word Count</span>
            <span className="text-sm font-medium text-gray-800">
              {pageAnalysis.wordCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Lang</span>
            <span className="text-sm font-medium text-gray-800">
              {pageAnalysis.language || 'N/A'}
            </span>
          </div>
        </div>

        {/* Headings Statistics */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">Heading Structure</div>
          <div className="text-sm text-gray-600">
            {Object.entries(pageAnalysis.headings)
              .filter(([, count]) => count > 0)
              .map(([tag, count]) => `${tag.toUpperCase()}=${count}`)
              .join(', ') || 'No headings found'}
          </div>
        </div>

        {/* SEO Issues Section */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">SEO Issues</div>
          <div className="space-y-2">
            {pageAnalysis.seoIssues.map((issue, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
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
                    <div className={`font-medium text-sm ${
                      issue.type === 'success' ? 'text-green-800' :
                      issue.type === 'warning' ? 'text-blue-800' :
                      'text-red-800'
                    }`}>
                      {issue.title}
                    </div>
                    <div className={`text-xs mt-1 leading-relaxed ${
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

        {/* Images & Links Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Images</div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total Images</span>
                <span className="font-medium text-gray-800">{pageAnalysis.images.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Unique Images</span>
                <span className="font-medium text-gray-800">{pageAnalysis.images.unique}</span>
              </div>
              <div className="flex justify-between">
                <span>Without Alt</span>
                <span className={`font-medium ${pageAnalysis.images.withoutAlt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {pageAnalysis.images.withoutAlt}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Without Title</span>
                <span className={`font-medium ${pageAnalysis.images.withoutTitle > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {pageAnalysis.images.withoutTitle}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Links</div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total Links</span>
                <span className="font-medium text-gray-800">{pageAnalysis.links.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Unique</span>
                <span className="font-medium text-gray-800">{pageAnalysis.links.unique}</span>
              </div>
              <div className="flex justify-between">
                <span>Internal</span>
                <span className="font-medium text-gray-800">{pageAnalysis.links.internal}</span>
              </div>
              <div className="flex justify-between">
                <span>External</span>
                <span className="font-medium text-gray-800">{pageAnalysis.links.external}</span>
              </div>
              <div className="flex justify-between">
                <span>Dofollow</span>
                <span className="font-medium text-gray-800">{pageAnalysis.links.dofollow}</span>
              </div>
              <div className="flex justify-between">
                <span>Nofollow</span>
                <span className="font-medium text-gray-800">{pageAnalysis.links.nofollow}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompactPageAnalysis