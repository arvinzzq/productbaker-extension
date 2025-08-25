import React, { useEffect } from "react"
import { Badge } from "./ui/badge"
import { StatusBadge } from "./ui/status-badge"
import { useSEOAnalysis } from "../hooks/useSEOAnalysis"

interface CompactPageAnalysisProps {
  autoAnalyze?: boolean
  onTabChange?: (tabId: string) => void
}

export const CompactPageAnalysis: React.FC<CompactPageAnalysisProps> = ({ autoAnalyze = false, onTabChange }) => {
  const { analysis: pageAnalysis, isAnalyzing, analyzeCurrentPage } = useSEOAnalysis()

  useEffect(() => {
    if (autoAnalyze && !pageAnalysis && !isAnalyzing) {
      analyzeCurrentPage()
    }
  }, [autoAnalyze, pageAnalysis, isAnalyzing, analyzeCurrentPage])

  if (isAnalyzing) {
    return (
      <div className="bg-gradient-to-br from-slate-50/30 to-white">
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <p className="text-sm text-gray-600 mt-2">Analyzing...</p>
        </div>
      </div>
    )
  }

  if (!pageAnalysis) {
    return (
      <div className="bg-gradient-to-br from-slate-50/30 to-white">
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">Ready to analyze</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-50/30 to-white">
      <div className="p-4 space-y-4">
        
        {/* Domain Section */}
        <div className="card-elevated bg-white rounded-lg">
          <div className="p-4">
            <h3 className="font-medium text-slate-900 text-sm mb-2">Domain</h3>
            <p className="text-lg font-mono text-slate-800 break-all">
              {new URL(pageAnalysis.url).hostname}
            </p>
          </div>
        </div>

        {/* Primary Information Section */}
        <div className="card-elevated bg-white rounded-lg">
          <div className="p-4 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900 text-sm">Page Title</h3>
                <div className="flex items-center gap-2">
                  <span 
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      pageAnalysis.titleStatus === 'success' ? 'bg-green-100 text-green-700' :
                      pageAnalysis.titleStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}
                    title={
                      pageAnalysis.titleStatus === 'success' ? 'Title length is optimal (30-60 characters)' :
                      pageAnalysis.titleStatus === 'warning' ? 'Title length could be improved. Optimal range is 30-60 characters.' :
                      'Title length is too short or too long. Optimal range is 30-60 characters.'
                    }
                  >
                    {pageAnalysis.titleLength}/60
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {pageAnalysis.title === 'N/A' ? (
                  <span className="not-set">Not set</span>
                ) : pageAnalysis.title}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900 text-sm">Meta Description</h3>
                <div className="flex items-center gap-2">
                  <span 
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      pageAnalysis.descriptionStatus === 'success' ? 'bg-green-100 text-green-700' :
                      pageAnalysis.descriptionStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}
                    title={
                      pageAnalysis.descriptionStatus === 'success' ? 'Description length is optimal (140-160 characters)' :
                      pageAnalysis.descriptionStatus === 'warning' ? 'Description length could be improved. Optimal range is 140-160 characters.' :
                      'Description length is too short or too long. Optimal range is 140-160 characters.'
                    }
                  >
                    {pageAnalysis.descriptionLength}/160
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pageAnalysis.description === 'N/A' ? (
                  <span className="not-set">Not set</span>
                ) : pageAnalysis.description}
              </p>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900 text-sm">Meta Keywords</h3>
              </div>
              <p className="text-xs not-set leading-relaxed">
                {pageAnalysis.keywords === 'N/A' ? 'Not set' : pageAnalysis.keywords}
              </p>
            </div>
          </div>
        </div>

        {/* Page Information Table */}
        <div className="card-elevated bg-white rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50 w-32">URL</td>
                <td className="px-4 py-3 text-slate-800 font-mono break-all">{pageAnalysis.url}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">Canonical</td>
                <td className="px-4 py-3 text-slate-800 font-mono break-all">
                  {pageAnalysis.canonical === 'Missing' ? (
                    <span className="not-set">Not set</span>
                  ) : (
                    pageAnalysis.canonical
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">Favicon</td>
                <td className="px-4 py-3">
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
                    </div>
                  ) : (
                    <span className="not-set">Not set</span>
                  )}
                </td>
              </tr>
              {/* <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">SSR</td>
                <td className="px-4 py-3 text-slate-800">
                  {pageAnalysis.ssrCheck ? 'Yes' : 'No'}
                </td>
              </tr> */}
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">Robots Tag</td>
                <td className="px-4 py-3 text-slate-800">
                  {pageAnalysis.robotsTag && pageAnalysis.robotsTag !== 'index, follow' ? (
                    <span className="font-mono">{pageAnalysis.robotsTag}</span>
                  ) : (
                    <span className="not-set">Not set</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">X-Robots-Tag</td>
                <td className="px-4 py-3 text-slate-800">
                  {pageAnalysis.xRobotsTag && pageAnalysis.xRobotsTag !== 'Missing' ? (
                    <span className="font-mono">{pageAnalysis.xRobotsTag}</span>
                  ) : (
                    <span className="not-set">Not set</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">robots.txt</td>
                <td className="px-4 py-3">
                  {pageAnalysis.robotsTxt ? (
                    <a 
                      href={pageAnalysis.robotsTxtUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      View ↗
                    </a>
                  ) : (
                    <span className="not-set">Not set</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">sitemap.xml</td>
                <td className="px-4 py-3">
                  {pageAnalysis.sitemap ? (
                    <a 
                      href={pageAnalysis.sitemapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      View ↗
                    </a>
                  ) : (
                    <span className="not-set">Not set</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">Google Analytics</td>
                <td className="px-4 py-3 text-slate-800">{pageAnalysis.googleAnalytics ? 'Yes' : <span className="not-set">Not set</span>}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">Google AdSense</td>
                <td className="px-4 py-3 text-slate-800">{pageAnalysis.googleAdsense ? 'Yes' : <span className="not-set">Not set</span>}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Domain Information Table */}
        <div className="card-elevated bg-white rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50 w-32">Domain Created</td>
                <td className="px-4 py-3 text-slate-800">{pageAnalysis.domainCreationDate || <span className="not-set">Not set</span>}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">Domain Expiry</td>
                <td className="px-4 py-3 text-slate-800">
                  {pageAnalysis.domainExpiryDate ? (
                    <div>
                      <div>{pageAnalysis.domainExpiryDate}</div>
                      {pageAnalysis.domainDaysToExpiry && (
                        <div className="text-slate-500 mt-1">
                          {Math.floor(pageAnalysis.domainDaysToExpiry / 365)} years {Math.floor((pageAnalysis.domainDaysToExpiry % 365) / 30)} months remaining
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="not-set">Not set</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">Word Count</td>
                <td className="px-4 py-3 text-slate-800">{pageAnalysis.wordCount.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">Language</td>
                <td className="px-4 py-3 text-slate-800">{pageAnalysis.language || <span className="not-set">Not set</span>}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Headings Table */}
        <div className="card-elevated bg-white rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50 w-32">Headings</td>
                <td className="px-4 py-3 text-slate-800">
                  <button 
                    onClick={() => onTabChange?.('headings')}
                    className="text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                  >
                    {Object.entries(pageAnalysis.headings)
                      .filter(([, count]) => count > 0)
                      .map(([tag, count]) => `${tag.toUpperCase()}: ${count}`)
                      .join(' • ') || <span className="not-set">Not set</span>}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Images & Links Tables */}
        <div className="grid grid-cols-2 gap-4">
          {/* Images Table */}
          <div className="card-elevated bg-white rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <button 
                onClick={() => onTabChange?.('images')}
                className="font-medium text-slate-900 text-sm hover:text-blue-600 hover:underline transition-colors cursor-pointer"
              >
                Images
              </button>
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-600">Total</td>
                  <td className="px-4 py-2 text-slate-800 text-right">{pageAnalysis.images.total}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-600">Unique</td>
                  <td className="px-4 py-2 text-slate-800 text-right">{pageAnalysis.images.unique}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-600">Without Alt</td>
                  <td className={`px-4 py-2 text-right font-medium ${pageAnalysis.images.withoutAlt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {pageAnalysis.images.withoutAlt}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-600">Without Title</td>
                  <td className={`px-4 py-2 text-right font-medium ${pageAnalysis.images.withoutTitle > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {pageAnalysis.images.withoutTitle}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Links Table */}
          <div className="card-elevated bg-white rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <button 
                onClick={() => onTabChange?.('links')}
                className="font-medium text-slate-900 text-sm hover:text-blue-600 hover:underline transition-colors cursor-pointer"
              >
                Links
              </button>
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-600">Total</td>
                  <td className="px-4 py-2 text-slate-800 text-right">{pageAnalysis.links.total}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-600">Unique</td>
                  <td className="px-4 py-2 text-slate-800 text-right">{pageAnalysis.links.unique}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-600">Internal</td>
                  <td className="px-4 py-2 text-slate-800 text-right">{pageAnalysis.links.internal}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-600">External</td>
                  <td className="px-4 py-2 text-slate-800 text-right">{pageAnalysis.links.external}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-600">Dofollow</td>
                  <td className="px-4 py-2 text-slate-800 text-right">{pageAnalysis.links.dofollow}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-slate-600">Nofollow</td>
                  <td className="px-4 py-2 text-slate-800 text-right">{pageAnalysis.links.nofollow}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


      </div>
    </div>
  )
}

export default CompactPageAnalysis