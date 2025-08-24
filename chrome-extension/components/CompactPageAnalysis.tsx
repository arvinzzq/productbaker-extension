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
    <div className="bg-gradient-to-br from-slate-50/30 to-white min-h-full">
      <div className="p-4 space-y-4">
        
        {/* Primary Information Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-4 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900 text-sm">Page Title</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    pageAnalysis.titleStatus === 'success' ? 'bg-green-100 text-green-700' :
                    pageAnalysis.titleStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {pageAnalysis.titleStatus === 'success' ? 'Good' :
                     pageAnalysis.titleStatus === 'warning' ? 'Warning' : 'Error'}
                  </span>
                  <span className="text-xs text-slate-500">{pageAnalysis.titleLength}/60</span>
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {pageAnalysis.title === 'N/A' ? (
                  <span className="italic text-slate-400">No title found</span>
                ) : pageAnalysis.title}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900 text-sm">Meta Description</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    pageAnalysis.descriptionStatus === 'success' ? 'bg-green-100 text-green-700' :
                    pageAnalysis.descriptionStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {pageAnalysis.descriptionStatus === 'success' ? 'Good' :
                     pageAnalysis.descriptionStatus === 'warning' ? 'Warning' : 'Error'}
                  </span>
                  <span className="text-xs text-slate-500">{pageAnalysis.descriptionLength}/160</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pageAnalysis.description === 'N/A' ? (
                  <span className="italic text-slate-400">No description found</span>
                ) : pageAnalysis.description}
              </p>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900 text-sm">Meta Keywords</h3>
                <span className="text-xs text-slate-500 italic">Not found</span>
              </div>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                {pageAnalysis.keywords === 'N/A' ? 'No keywords found' : pageAnalysis.keywords}
              </p>
            </div>
          </div>
        </div>

        {/* Page Information Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
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
                    <span className="text-slate-400 italic font-sans">Not set</span>
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
                      <span className="text-slate-800">Yes</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">SSR</td>
                <td className="px-4 py-3 text-slate-800">
                  {pageAnalysis.ssrCheck ? 'Yes' : 'No'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">Robots Tag</td>
                <td className="px-4 py-3 text-slate-800 font-mono">{pageAnalysis.robotsTag}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">X-Robots-Tag</td>
                <td className="px-4 py-3 text-slate-800">
                  {pageAnalysis.xRobotsTag === 'Missing' ? (
                    <span className="text-slate-400 italic">Not set</span>
                  ) : (
                    <span className="font-mono">{pageAnalysis.xRobotsTag}</span>
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
                      Yes ↗
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No</span>
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
                      Yes ↗
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">Google Analytics</td>
                <td className="px-4 py-3 text-slate-800">{pageAnalysis.googleAnalytics ? 'Yes' : 'No'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">Google AdSense</td>
                <td className="px-4 py-3 text-slate-800">{pageAnalysis.googleAdsense ? 'Yes' : 'No'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Domain Information Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50 w-32">Domain Created</td>
                <td className="px-4 py-3 text-slate-800">{pageAnalysis.domainCreationDate || 'Unknown'}</td>
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
                    'Unknown'
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">Word Count</td>
                <td className="px-4 py-3 text-slate-800">{pageAnalysis.wordCount.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50">Language</td>
                <td className="px-4 py-3 text-slate-800">{pageAnalysis.language || 'Unknown'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Headings Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-600 bg-slate-50 w-32">Headings</td>
                <td className="px-4 py-3 text-slate-800">
                  {Object.entries(pageAnalysis.headings)
                    .filter(([, count]) => count > 0)
                    .map(([tag, count]) => `${tag.toUpperCase()}: ${count}`)
                    .join(' • ') || 'None found'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Images & Links Tables */}
        <div className="grid grid-cols-2 gap-4">
          {/* Images Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <h3 className="font-medium text-slate-900 text-sm">Images</h3>
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
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <h3 className="font-medium text-slate-900 text-sm">Links</h3>
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

        {/* SEO Issues */}
        {pageAnalysis.seoIssues && pageAnalysis.seoIssues.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-4">
              <h3 className="font-medium text-slate-900 text-sm mb-4">SEO Issues</h3>
              <div className="space-y-3">
                {pageAnalysis.seoIssues.map((issue, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      issue.type === 'success' ? 'bg-emerald-50 border-l-emerald-500' :
                      issue.type === 'warning' ? 'bg-blue-50 border-l-blue-500' :
                      'bg-red-50 border-l-red-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5 ${
                        issue.type === 'success' ? 'bg-emerald-500' :
                        issue.type === 'warning' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`}>
                        {issue.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-xs ${
                          issue.type === 'success' ? 'text-emerald-800' :
                          issue.type === 'warning' ? 'text-blue-800' :
                          'text-red-800'
                        }`}>
                          {issue.title}
                        </div>
                        <div className={`text-xs mt-1 leading-relaxed ${
                          issue.type === 'success' ? 'text-emerald-700' :
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
        )}

      </div>
    </div>
  )
}

export default CompactPageAnalysis