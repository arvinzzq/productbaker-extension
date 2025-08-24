import React, { useEffect } from "react"
import { Badge } from "./ui/badge"
import { StatusBadge } from "./ui/status-badge"
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
      <div className="p-3 space-y-3.5">
        {/* Main Overview Card */}
        <div className="relative bg-gradient-to-b from-white to-green-50 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
          {/* Top accent bar */}
          <div className="absolute left-4 right-4 top-2 h-1.5 rounded-full bg-gradient-to-r from-green-600 to-green-500"></div>
          
          {/* Card content starts directly */}
          <div className="mt-2.5"></div>

          {/* Title Section */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm text-gray-800">Title</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={pageAnalysis.titleStatus} />
                <Badge variant="outline" className="text-xs">
                  {pageAnalysis.titleLength}/60
                </Badge>
              </div>
            </div>
            <div className="text-xs text-gray-700 leading-relaxed">
              {pageAnalysis.title === 'N/A' ? (
                <span className="italic text-gray-400">No title found</span>
              ) : pageAnalysis.title}
            </div>
          </div>

          <div className="h-px bg-gray-100 my-3"></div>

          {/* Description Section */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm text-gray-800">Description</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={pageAnalysis.descriptionStatus} />
                <Badge variant="outline" className="text-xs">
                  {pageAnalysis.descriptionLength}/160
                </Badge>
              </div>
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">
              {pageAnalysis.description === 'N/A' ? (
                <span className="italic text-gray-400">No description found</span>
              ) : pageAnalysis.description}
            </div>
          </div>

          <div className="h-px bg-gray-100 my-3"></div>

          {/* Keywords Section */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm text-gray-800">Keywords</span>
              <StatusBadge status={pageAnalysis.keywordsStatus} />
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">
              {pageAnalysis.keywords === 'N/A' ? (
                <span className="italic text-gray-400">No keywords found</span>
              ) : pageAnalysis.keywords}
            </div>
          </div>

          <div className="h-px bg-gray-100 my-3"></div>

          {/* URL Info Grid */}
          <div className="space-y-0">
            <div className="grid grid-cols-[100px_1fr] border-t border-gray-100">
              <div className="bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-600">URL</div>
              <div className="px-3 py-2.5 text-xs font-mono text-gray-800 break-all">{pageAnalysis.url}</div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-t border-gray-100">
              <div className="bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-600">Canonical</div>
              <div className="px-3 py-2.5 text-xs break-all flex items-center gap-2">
                {pageAnalysis.canonical === 'Missing' ? (
                  <StatusBadge status="missing" text="Missing" showIcon={false} />
                ) : (
                  <>
                    <StatusBadge status="available" showIcon={false} />
                    <span className="font-mono text-gray-800">{pageAnalysis.canonical}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-3"></div>


          {/* Technical Checks */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Favicon</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={pageAnalysis.favicon ? 'available' : 'missing'} />
                {pageAnalysis.faviconUrl ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={pageAnalysis.faviconUrl}
                      alt="Favicon"
                      className="w-4 h-4 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <div
                      className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500"
                      style={{ display: pageAnalysis.favicon ? 'none' : 'flex' }}
                    >
                      ?
                    </div>
                  </div>
                ) : (
                  <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                    ?
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">SSR Check</span>
              <StatusBadge status={pageAnalysis.ssrCheck ? 'available' : 'missing'} />
            </div>
          </div>

          {/* Robots Tags Grid */}
          <div className="space-y-0">
            <div className="grid grid-cols-[100px_1fr] border-t border-gray-100">
              <div className="bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-600">Robots Tag</div>
              <div className="px-3 py-2.5 text-xs flex items-center gap-2">
                <StatusBadge status={pageAnalysis.robotsTagStatus} showIcon={false} />
                <span className="font-semibold text-gray-800">{pageAnalysis.robotsTag}</span>
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-t border-gray-100">
              <div className="bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-600">X-Robots-Tag</div>
              <div className="px-3 py-2.5 text-xs flex items-center gap-2">
                <StatusBadge status={pageAnalysis.xRobotsTagStatus} />
                <span>{pageAnalysis.xRobotsTag}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-0 border-t border-gray-100">
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-600">robots.txt</span>
                  <StatusBadge status={pageAnalysis.robotsTxt ? 'available' : 'missing'} showIcon={false} />
                </div>
                <div className="text-xs">
                  {pageAnalysis.robotsTxt ? (
                    <a 
                      href={pageAnalysis.robotsTxtUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      robots.txt ↗
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not found</span>
                  )}
                </div>
              </div>
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-600">sitemap.xml</span>
                  <StatusBadge status={pageAnalysis.sitemap ? 'available' : 'missing'} showIcon={false} />
                </div>
                <div className="text-xs">
                  {pageAnalysis.sitemap ? (
                    <a 
                      href={pageAnalysis.sitemapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      sitemap.xml ↗
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not found</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-3"></div>

          {/* Analytics Status Grid */}
          <div className="space-y-0">
            <div className="grid grid-cols-[100px_1fr] border-t border-gray-100">
              <div className="bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-600">Google Analytics</div>
              <div className="px-3 py-2.5 text-xs">
                <StatusBadge status={pageAnalysis.googleAnalytics ? 'available' : 'missing'} />
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-t border-gray-100">
              <div className="bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-600">Google AdSense</div>
              <div className="px-3 py-2.5 text-xs">
                <StatusBadge status={pageAnalysis.googleAdsense ? 'available' : 'missing'} />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-3"></div>

          {/* Domain Info Grid */}
          <div className="space-y-0">
            <div className="grid grid-cols-[100px_1fr] border-t border-gray-100">
              <div className="bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-600">Domain Created</div>
              <div className="px-3 py-2.5 text-xs text-gray-800">
                {pageAnalysis.domainCreationDate || 'N/A'}
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-t border-gray-100">
              <div className="bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-600">Domain Expiry</div>
              <div className="px-3 py-2.5 text-xs text-gray-800">
                {pageAnalysis.domainExpiryDate ? (
                  <div className="flex flex-col gap-1">
                    <span>{pageAnalysis.domainExpiryDate}</span>
                    {pageAnalysis.domainDaysToExpiry && (
                      <span className="text-gray-500">
                        ({Math.floor(pageAnalysis.domainDaysToExpiry / 365)} years {Math.floor((pageAnalysis.domainDaysToExpiry % 365) / 30)} months remaining)
                      </span>
                    )}
                  </div>
                ) : 'N/A'}
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-3"></div>

          {/* Page Stats Grid */}
          <div className="space-y-0">
            <div className="grid grid-cols-[100px_1fr] border-t border-gray-100">
              <div className="bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-600">Word Count</div>
              <div className="px-3 py-2.5 text-xs text-gray-800">{pageAnalysis.wordCount.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-[100px_1fr] border-t border-gray-100">
              <div className="bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-600">Lang</div>
              <div className="px-3 py-2.5 text-xs text-gray-800">{pageAnalysis.language || 'N/A'}</div>
            </div>
          </div>
        </div>


        {/* Headings Statistics Card */}
        <div className="relative bg-gradient-to-b from-white to-green-50 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
          {/* Top accent bar */}
          <div className="absolute left-4 right-4 top-2 h-1.5 rounded-full bg-gradient-to-r from-green-600 to-green-500"></div>
          
          <div className="mt-2.5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xs">📋</span>
              </div>
              <span className="font-bold text-sm text-gray-800">Heading Structure</span>
            </div>
            <div className="text-xs text-gray-600">
              {Object.entries(pageAnalysis.headings)
                .filter(([, count]) => count > 0)
                .map(([tag, count]) => `${tag.toUpperCase()}=${count}`)
                .join(', ') || 'No headings found'}
            </div>
          </div>
        </div>

        {/* SEO Issues Card */}
        <div className="relative bg-gradient-to-b from-white to-green-50 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
          {/* Top accent bar */}
          <div className="absolute left-4 right-4 top-2 h-1.5 rounded-full bg-gradient-to-r from-green-600 to-green-500"></div>
          
          <div className="mt-2.5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xs">⚠️</span>
              </div>
              <span className="font-bold text-sm text-gray-800">SEO Issues</span>
            </div>
            <div className="space-y-2">
              {pageAnalysis.seoIssues.map((issue, index) => (
                <div 
                  key={index}
                  className={`p-2.5 rounded-lg border ${
                    issue.type === 'success' ? 'bg-green-50 border-green-200' :
                    issue.type === 'warning' ? 'bg-blue-50 border-blue-200' :
                    'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      issue.type === 'success' ? 'bg-green-500' :
                      issue.type === 'warning' ? 'bg-blue-500' :
                      'bg-red-500'
                    }`}>
                      {issue.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-xs ${
                        issue.type === 'success' ? 'text-green-800' :
                        issue.type === 'warning' ? 'text-blue-800' :
                        'text-red-800'
                      }`}>
                        {issue.title}
                      </div>
                      <div className={`text-xs mt-0.5 leading-relaxed ${
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
        </div>

        {/* Images & Links Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Images Card */}
          <div className="relative bg-gradient-to-b from-white to-green-50 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
            {/* Top accent bar */}
            <div className="absolute left-4 right-4 top-2 h-1.5 rounded-full bg-gradient-to-r from-green-600 to-green-500"></div>
            
            <div className="mt-2.5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xs">🖼️</span>
                </div>
                <span className="font-bold text-sm text-gray-800">Images</span>
              </div>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-medium text-gray-800">{pageAnalysis.images.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unique</span>
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
          </div>

          {/* Links Card */}
          <div className="relative bg-gradient-to-b from-white to-green-50 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
            {/* Top accent bar */}
            <div className="absolute left-4 right-4 top-2 h-1.5 rounded-full bg-gradient-to-r from-green-600 to-green-500"></div>
            
            <div className="mt-2.5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xs">🔗</span>
                </div>
                <span className="font-bold text-sm text-gray-800">Links</span>
              </div>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Total</span>
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
    </div>
  )
}

export default CompactPageAnalysis