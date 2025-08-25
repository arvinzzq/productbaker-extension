import React, { useState, useEffect } from "react"
import { Archive, TrendingUp, BarChart3, Link, Zap, Shield, CheckCircle, Smartphone, Gauge, Lock } from "lucide-react"

interface SEOToolsProps {
  autoAnalyze?: boolean
}

export const SEOTools: React.FC<SEOToolsProps> = ({ autoAnalyze = false }) => {
  const [currentUrl, setCurrentUrl] = useState('')
  const [domain, setDomain] = useState('')

  useEffect(() => {
    const url = window.location.href
    const hostname = window.location.hostname
    setCurrentUrl(url)
    setDomain(hostname)
  }, [])

  const seoTools = [
    {
      name: 'Archive',
      icon: <Archive className="w-5 h-5" />,
      description: 'View historical snapshots of this website',
      url: `https://web.archive.org/web/*/${currentUrl}`,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      textColor: 'text-blue-700'
    },
    {
      name: 'Similarweb',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Analyze website traffic and competitor insights',
      url: `https://www.similarweb.com/website/${domain}/`,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      textColor: 'text-green-700'
    },
    {
      name: 'Semrush',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'SEO analysis and keyword research',
      url: `https://www.semrush.com/analytics/overview/?q=${domain}`,
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      textColor: 'text-orange-700'
    },
    {
      name: 'Ahrefs',
      icon: <Link className="w-5 h-5" />,
      description: 'Backlink analysis and SEO metrics',
      url: `https://ahrefs.com/site-explorer/overview/v2/exact?target=${domain}`,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      textColor: 'text-purple-700'
    },
    {
      name: 'PageSpeed',
      icon: <Zap className="w-5 h-5" />,
      description: 'Google PageSpeed Insights performance analysis',
      url: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(currentUrl)}`,
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      textColor: 'text-red-700'
    },
    {
      name: 'Cloudflare Radar',
      icon: <Shield className="w-5 h-5" />,
      description: 'Domain security and performance analysis',
      url: `https://radar.cloudflare.com/scan/${domain}`,
      color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
      textColor: 'text-cyan-700'
    }
  ]

  const handleToolClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!currentUrl) {
    return (
      <div className="bg-gradient-to-br from-slate-50/30 to-white">
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <p className="text-sm text-slate-600 mt-2">Loading SEO tools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-50/30 to-white">
      <div className="p-4 space-y-4">
        
        {/* Current URL Info */}
        <div className="card-elevated bg-white rounded-lg">
          <div className="p-4 space-y-2">
            <h3 className="font-medium text-slate-900 text-sm">Current Analysis Target</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-12">URL:</span>
                <span className="text-xs text-slate-700 font-mono break-all">
                  {currentUrl.length > 60 ? currentUrl.substring(0, 60) + '...' : currentUrl}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-12">Domain:</span>
                <span className="text-xs text-slate-700 font-medium">{domain}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Tools Grid */}
        <div className="space-y-3">
          {seoTools.map((tool, index) => (
            <div key={index} className="card-elevated bg-white rounded-lg overflow-hidden">
              <button
                onClick={() => handleToolClick(tool.url)}
                className={`w-full p-4 text-left transition-all duration-200 border ${tool.color} ${tool.textColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={tool.textColor}>{tool.icon}</div>
                    <div>
                      <h4 className="font-medium text-sm">{tool.name}</h4>
                      <p className="text-xs text-slate-600 mt-1">{tool.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Click to analyze</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Additional Tools */}
        <div className="card-elevated bg-white rounded-lg">
          <div className="p-4 space-y-4">
            <h3 className="font-medium text-slate-900 text-sm">Quick SEO Checks</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleToolClick(`https://validator.w3.org/nu/?doc=${encodeURIComponent(currentUrl)}`)}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-slate-900">HTML Validator</span>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
              
              <button
                onClick={() => handleToolClick(`https://search.google.com/test/mobile-friendly?url=${encodeURIComponent(currentUrl)}`)}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-900">Mobile-Friendly Test</span>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>

              <button
                onClick={() => handleToolClick(`https://developers.google.com/speed/pagespeed/insights/?url=${encodeURIComponent(currentUrl)}`)}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-slate-900">PageSpeed Insights</span>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>

              <button
                onClick={() => handleToolClick(`https://www.ssllabs.com/ssltest/analyze.html?d=${domain}`)}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-slate-900">SSL Test</span>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="card-elevated bg-white rounded-lg">
          <div className="p-4 space-y-2">
            <h4 className="font-medium text-slate-900 text-sm">SEO Tools Guide</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <p><strong>Archive:</strong> Check website history and broken link recovery</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <p><strong>Similarweb:</strong> Analyze traffic trends and competitor insights</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <p><strong>Semrush:</strong> Keyword research and SEO opportunity analysis</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <p><strong>Ahrefs:</strong> Comprehensive backlink profile analysis</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <p><strong>PageSpeed:</strong> Performance optimization recommendations</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <p><strong>Cloudflare Radar:</strong> Domain security threats and performance insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SEOTools