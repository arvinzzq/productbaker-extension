import React, { useState, useEffect } from "react"
import { useSEOAnalysis } from "../hooks/useSEOAnalysis"

interface LinkItem {
  url: string
  text: string
  title: string
  type: 'internal' | 'external'
  rel: string
  target: string
  nofollow: boolean
  domain: string
}

interface LinksAnalysisProps {
  autoAnalyze?: boolean
}

export const LinksAnalysis: React.FC<LinksAnalysisProps> = ({ autoAnalyze = false }) => {
  const { analysis, isAnalyzing, analyzeCurrentPage } = useSEOAnalysis()
  const [linksList, setLinksList] = useState<LinkItem[]>([])
  const [isLoadingLinks, setIsLoadingLinks] = useState(false)

  useEffect(() => {
    if (autoAnalyze && !analysis && !isAnalyzing) {
      analyzeCurrentPage()
    }
  }, [autoAnalyze, analysis, isAnalyzing, analyzeCurrentPage])

  useEffect(() => {
    if (analysis) {
      extractLinksFromPage()
    }
  }, [analysis])

  const extractLinksFromPage = () => {
    setIsLoadingLinks(true)
    try {
      const links: LinkItem[] = []
      const linkElements = document.querySelectorAll('a[href]')
      const currentDomain = window.location.hostname
      
      linkElements.forEach((link) => {
        const href = link.getAttribute('href') || ''
        const text = link.textContent?.trim() || ''
        const title = link.getAttribute('title') || ''
        const rel = link.getAttribute('rel') || ''
        const target = link.getAttribute('target') || ''
        
        if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          let url = href
          let domain = ''
          let type: 'internal' | 'external' = 'internal'
          
          try {
            if (href.startsWith('http')) {
              const linkUrl = new URL(href)
              domain = linkUrl.hostname
              type = domain === currentDomain ? 'internal' : 'external'
            } else if (href.startsWith('//')) {
              domain = href.split('/')[2]
              type = domain === currentDomain ? 'internal' : 'external'
            } else if (href.startsWith('/') || href.startsWith('#') || !href.includes('/')) {
              domain = currentDomain
              type = 'internal'
            } else {
              // Relative link
              domain = currentDomain
              type = 'internal'
            }
          } catch (e) {
            domain = 'Invalid URL'
          }
          
          links.push({
            url: href,
            text: text || href,
            title,
            type,
            rel,
            target,
            nofollow: rel.toLowerCase().includes('nofollow'),
            domain
          })
        }
      })
      
      setLinksList(links)
    } catch (error) {
      console.error('Error extracting links:', error)
    } finally {
      setIsLoadingLinks(false)
    }
  }

  const getLinkStats = () => {
    const stats = {
      total: linksList.length,
      internal: linksList.filter(link => link.type === 'internal').length,
      external: linksList.filter(link => link.type === 'external').length,
      nofollow: linksList.filter(link => link.nofollow).length,
      dofollow: linksList.filter(link => !link.nofollow).length,
      withoutText: linksList.filter(link => !link.text || link.text.trim() === '' || link.text === link.url).length,
      withoutTitle: linksList.filter(link => !link.title || link.title.trim() === '').length,
      newWindow: linksList.filter(link => link.target === '_blank').length,
      uniqueDomains: new Set(linksList.filter(link => link.type === 'external').map(link => link.domain)).size
    }
    return stats
  }

  const getLinkIssues = () => {
    const issues: string[] = []
    const stats = getLinkStats()
    
    if (stats.withoutText > 0) {
      issues.push(`${stats.withoutText} links have poor or missing anchor text`)
    }
    
    if (stats.external > 0 && stats.nofollow === 0) {
      issues.push('Consider adding rel="nofollow" to some external links to preserve link equity')
    }
    
    if (stats.newWindow > 0) {
      const missingRel = linksList.filter(link => link.target === '_blank' && !link.rel.includes('noopener')).length
      if (missingRel > 0) {
        issues.push(`${missingRel} links opening in new window should include rel="noopener" for security`)
      }
    }
    
    // Check for too many external links
    if (stats.external > stats.internal * 2) {
      issues.push('High ratio of external to internal links may dilute page authority')
    }
    
    // Check for broken link patterns
    const suspiciousLinks = linksList.filter(link => 
      link.url.includes('example.com') || 
      link.url.includes('localhost') || 
      link.url.includes('127.0.0.1')
    ).length
    
    if (suspiciousLinks > 0) {
      issues.push(`${suspiciousLinks} potentially broken or placeholder links found`)
    }
    
    return issues
  }

  const getDomainGroups = () => {
    const groups = linksList.reduce((acc, link) => {
      const key = link.type === 'internal' ? 'Internal Links' : link.domain
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(link)
      return acc
    }, {} as Record<string, LinkItem[]>)
    
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === 'Internal Links') return -1
      if (b === 'Internal Links') return 1
      return b.localeCompare(a)
    })
  }

  const formatUrl = (url: string) => {
    if (url.length > 50) {
      return url.substring(0, 50) + '...'
    }
    return url
  }

  if (isAnalyzing || isLoadingLinks) {
    return (
      <div className="bg-gradient-to-br from-slate-50/30 to-white">
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <p className="text-sm text-slate-600 mt-2">Analyzing links...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="bg-gradient-to-br from-slate-50/30 to-white">
        <div className="p-4 text-center text-slate-500">
          <p className="text-sm">Ready to analyze links</p>
        </div>
      </div>
    )
  }

  const stats = getLinkStats()
  const issues = getLinkIssues()
  const domainGroups = getDomainGroups()

  return (
    <div className="bg-gradient-to-br from-slate-50/30 to-white">
      <div className="p-4 space-y-4">

        {/* Statistics Cards */}
        <div className="card-elevated bg-white rounded-lg">
          <div className="p-4 space-y-4">
            <h3 className="font-medium text-slate-900 text-sm">Links Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                <div className="text-xs text-slate-600">Total Links</div>
              </div>
          <div className="card-elevated bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.internal}</div>
            <div className="text-xs text-slate-600">Internal Links</div>
          </div>
          <div className="card-elevated bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.external}</div>
            <div className="text-xs text-slate-600">External Links</div>
          </div>
          <div className="card-elevated bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.uniqueDomains}</div>
            <div className="text-xs text-slate-600">Unique Domains</div>
          </div>
        </div>

        {/* Link Quality Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-elevated bg-white rounded-lg p-3 text-center">
            <div className={`text-xl font-bold ${stats.dofollow > stats.nofollow ? 'text-green-600' : 'text-orange-600'}`}>
              {stats.dofollow}
            </div>
            <div className="text-xs text-slate-600">Dofollow</div>
          </div>
          <div className="card-elevated bg-white rounded-lg p-3 text-center">
            <div className={`text-xl font-bold ${stats.nofollow > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
              {stats.nofollow}
            </div>
            <div className="text-xs text-slate-600">Nofollow</div>
          </div>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div className="card-elevated bg-white rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              SEO Issues
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

        {/* Links by Domain */}
        <div className="card-elevated bg-white rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b">
            <h4 className="font-semibold text-slate-900">Links by Domain</h4>
          </div>
          
          {linksList.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No links found on this page</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {domainGroups.map(([domain, domainLinks]) => (
                <div key={domain} className="border-b border-slate-100 last:border-b-0">
                  {/* Domain Header */}
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">
                        {domain === 'Internal Links' ? '🏠 Internal Links' : `🌐 ${domain}`}
                      </span>
                      <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">
                        {domainLinks.length}
                      </span>
                    </div>
                  </div>
                  
                  {/* Links */}
                  {domainLinks.slice(0, 10).map((link, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-slate-50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-800 font-medium break-words">
                              {link.text}
                            </p>
                            <p className="text-xs text-slate-500 font-mono break-all">
                              {formatUrl(link.url)}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            {link.type === 'external' && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                External
                              </span>
                            )}
                            {link.nofollow && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Nofollow
                              </span>
                            )}
                            {link.target === '_blank' && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                New Window
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {link.title && (
                          <p className="text-xs text-slate-600">
                            <span className="text-slate-400">Title:</span> {link.title}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {domainLinks.length > 10 && (
                    <div className="px-4 py-2 text-center text-xs text-slate-500 bg-slate-50">
                      +{domainLinks.length - 10} more links
                    </div>
                  )}
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
              <p>Use descriptive anchor text that includes relevant keywords</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-500 mt-0.5">💡</div>
              <p>Balance internal and external links appropriately</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-500 mt-0.5">💡</div>
              <p>Add rel="nofollow" to sponsored or untrusted external links</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-500 mt-0.5">💡</div>
              <p>Include rel="noopener" for links opening in new windows</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-500 mt-0.5">💡</div>
              <p>Regularly check for broken links and update them</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LinksAnalysis