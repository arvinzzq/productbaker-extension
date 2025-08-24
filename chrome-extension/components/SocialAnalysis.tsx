import React, { useState, useEffect } from "react"
import { useSEOAnalysis } from "../hooks/useSEOAnalysis"

interface OpenGraphData {
  title: string
  description: string
  image: string
  url: string
  type: string
  siteName: string
  locale: string
}

interface TwitterCardData {
  card: string
  title: string
  description: string
  image: string
  site: string
  creator: string
  url: string
}

interface SocialAnalysisProps {
  autoAnalyze?: boolean
}

export const SocialAnalysis: React.FC<SocialAnalysisProps> = ({ autoAnalyze = false }) => {
  const { analysis, isAnalyzing, analyzeCurrentPage } = useSEOAnalysis()
  const [openGraph, setOpenGraph] = useState<OpenGraphData | null>(null)
  const [twitterCard, setTwitterCard] = useState<TwitterCardData | null>(null)
  const [isLoadingSocial, setIsLoadingSocial] = useState(false)

  useEffect(() => {
    if (autoAnalyze && !analysis && !isAnalyzing) {
      analyzeCurrentPage()
    }
  }, [autoAnalyze, analysis, isAnalyzing, analyzeCurrentPage])

  useEffect(() => {
    if (analysis) {
      extractSocialMetaTags()
    }
  }, [analysis])

  const extractSocialMetaTags = () => {
    setIsLoadingSocial(true)
    try {
      // Extract Open Graph data
      const ogData: OpenGraphData = {
        title: getMetaContent('og:title') || document.title,
        description: getMetaContent('og:description') || getMetaContent('description') || '',
        image: getMetaContent('og:image') || '',
        url: getMetaContent('og:url') || window.location.href,
        type: getMetaContent('og:type') || 'website',
        siteName: getMetaContent('og:site_name') || '',
        locale: getMetaContent('og:locale') || 'en_US'
      }

      // Extract Twitter Card data
      const twitterData: TwitterCardData = {
        card: getMetaContent('twitter:card') || 'summary',
        title: getMetaContent('twitter:title') || ogData.title,
        description: getMetaContent('twitter:description') || ogData.description,
        image: getMetaContent('twitter:image') || ogData.image,
        site: getMetaContent('twitter:site') || '',
        creator: getMetaContent('twitter:creator') || '',
        url: getMetaContent('twitter:url') || ogData.url
      }

      setOpenGraph(ogData)
      setTwitterCard(twitterData)
    } catch (error) {
      console.error('Error extracting social meta tags:', error)
    } finally {
      setIsLoadingSocial(false)
    }
  }

  const getMetaContent = (property: string): string => {
    const meta = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`)
    return meta?.getAttribute('content') || ''
  }

  const getSocialIssues = () => {
    const issues: string[] = []
    
    if (!openGraph) return issues

    // Open Graph issues
    if (!openGraph.title) {
      issues.push('Missing Open Graph title (og:title)')
    } else if (openGraph.title.length > 60) {
      issues.push('Open Graph title is too long (should be under 60 characters)')
    }

    if (!openGraph.description) {
      issues.push('Missing Open Graph description (og:description)')
    } else if (openGraph.description.length > 160) {
      issues.push('Open Graph description is too long (should be under 160 characters)')
    }

    if (!openGraph.image) {
      issues.push('Missing Open Graph image (og:image)')
    }

    if (!openGraph.url) {
      issues.push('Missing Open Graph URL (og:url)')
    }

    // Twitter Card issues
    if (!twitterCard) return issues

    if (!twitterCard.card) {
      issues.push('Missing Twitter Card type (twitter:card)')
    }

    if (!twitterCard.title) {
      issues.push('Missing Twitter Card title (twitter:title)')
    }

    if (!twitterCard.description) {
      issues.push('Missing Twitter Card description (twitter:description)')
    }

    if (!twitterCard.image && twitterCard.card !== 'summary') {
      issues.push('Missing Twitter Card image (twitter:image)')
    }

    if (!twitterCard.site) {
      issues.push('Missing Twitter site handle (twitter:site)')
    }

    return issues
  }

  const getImageDimensions = async (imageUrl: string): Promise<{ width: number; height: number } | null> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = () => resolve(null)
      img.src = imageUrl
    })
  }

  const validateImageSize = (imageUrl: string, type: 'og' | 'twitter') => {
    if (!imageUrl) return null
    
    const recommendations = {
      og: { width: 1200, height: 630, ratio: '1.91:1' },
      twitter: { 
        summary: { width: 120, height: 120, ratio: '1:1' },
        summary_large_image: { width: 1200, height: 628, ratio: '1.91:1' }
      }
    }

    return type === 'og' ? recommendations.og : recommendations.twitter.summary_large_image
  }

  if (isAnalyzing || isLoadingSocial) {
    return (
      <div className="bg-gradient-to-br from-slate-50/50 to-white">
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 mt-2">Analyzing social media configuration...</p>
        </div>
      </div>
    )
  }

  if (!analysis || !openGraph || !twitterCard) {
    return (
      <div className="bg-gradient-to-br from-slate-50/50 to-white">
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">Ready to analyze social media meta tags</p>
        </div>
      </div>
    )
  }

  const issues = getSocialIssues()

  return (
    <div className="bg-gradient-to-br from-slate-50/50 to-white">
      <div className="p-4 space-y-4">
        
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Social Media Analysis</h3>
          <p className="text-sm text-slate-600">Open Graph and Twitter Card configuration analysis</p>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div className="card-elevated bg-white rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Configuration Issues
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

        {/* Open Graph Card */}
        <div className="card-elevated bg-white rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-blue-50 border-b flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">
              f
            </div>
            <h4 className="font-semibold text-slate-900">Open Graph (Facebook)</h4>
          </div>
          
          <div className="p-4 space-y-3">
            {/* Preview */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h5 className="text-xs font-semibold text-slate-600 mb-2">PREVIEW</h5>
              <div className="bg-white border border-slate-300 rounded-lg overflow-hidden">
                {openGraph.image && (
                  <div className="aspect-[1.91] bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={openGraph.image} 
                      alt="OG Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 mb-1">
                    {openGraph.title || 'No title'}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-1">
                    {openGraph.description || 'No description'}
                  </p>
                  <p className="text-xs text-slate-500 uppercase">
                    {openGraph.siteName || new URL(openGraph.url).hostname}
                  </p>
                </div>
              </div>
            </div>

            {/* OG Properties */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="font-medium text-slate-600">Property</div>
                <div className="font-medium text-slate-600">Value</div>
                <div className="font-medium text-slate-600">Status</div>
              </div>
              
              {[
                { prop: 'og:title', value: openGraph.title, optimal: openGraph.title.length > 0 && openGraph.title.length <= 60 },
                { prop: 'og:description', value: openGraph.description, optimal: openGraph.description.length > 0 && openGraph.description.length <= 160 },
                { prop: 'og:image', value: openGraph.image, optimal: !!openGraph.image },
                { prop: 'og:url', value: openGraph.url, optimal: !!openGraph.url },
                { prop: 'og:type', value: openGraph.type, optimal: !!openGraph.type },
                { prop: 'og:site_name', value: openGraph.siteName, optimal: !!openGraph.siteName },
                { prop: 'og:locale', value: openGraph.locale, optimal: !!openGraph.locale }
              ].map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 text-xs py-2 border-b border-slate-100">
                  <div className="font-mono text-slate-700">{item.prop}</div>
                  <div className="text-slate-600 break-words">
                    {item.value ? (
                      item.value.length > 40 ? item.value.substring(0, 40) + '...' : item.value
                    ) : (
                      <span className="text-red-500 italic">Not set</span>
                    )}
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.optimal ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.optimal ? 'Good' : 'Issue'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Twitter Card */}
        <div className="card-elevated bg-white rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-blue-50 border-b flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-400 rounded text-white flex items-center justify-center text-xs font-bold">
              𝕏
            </div>
            <h4 className="font-semibold text-slate-900">Twitter Card</h4>
          </div>
          
          <div className="p-4 space-y-3">
            {/* Preview */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h5 className="text-xs font-semibold text-slate-600 mb-2">PREVIEW</h5>
              <div className="bg-white border border-slate-300 rounded-lg overflow-hidden">
                {twitterCard.image && twitterCard.card === 'summary_large_image' && (
                  <div className="aspect-[1.91] bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={twitterCard.image} 
                      alt="Twitter Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="p-3 flex gap-3">
                  {twitterCard.image && twitterCard.card === 'summary' && (
                    <div className="w-16 h-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={twitterCard.image} 
                        alt="Twitter Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 line-clamp-2 mb-1">
                      {twitterCard.title || 'No title'}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-1">
                      {twitterCard.description || 'No description'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {twitterCard.site || new URL(twitterCard.url).hostname}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Twitter Properties */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="font-medium text-slate-600">Property</div>
                <div className="font-medium text-slate-600">Value</div>
                <div className="font-medium text-slate-600">Status</div>
              </div>
              
              {[
                { prop: 'twitter:card', value: twitterCard.card, optimal: !!twitterCard.card },
                { prop: 'twitter:title', value: twitterCard.title, optimal: twitterCard.title.length > 0 && twitterCard.title.length <= 70 },
                { prop: 'twitter:description', value: twitterCard.description, optimal: twitterCard.description.length > 0 && twitterCard.description.length <= 200 },
                { prop: 'twitter:image', value: twitterCard.image, optimal: !!twitterCard.image },
                { prop: 'twitter:site', value: twitterCard.site, optimal: !!twitterCard.site },
                { prop: 'twitter:creator', value: twitterCard.creator, optimal: true }, // Optional
                { prop: 'twitter:url', value: twitterCard.url, optimal: !!twitterCard.url }
              ].map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 text-xs py-2 border-b border-slate-100">
                  <div className="font-mono text-slate-700">{item.prop}</div>
                  <div className="text-slate-600 break-words">
                    {item.value ? (
                      item.value.length > 40 ? item.value.substring(0, 40) + '...' : item.value
                    ) : (
                      <span className="text-red-500 italic">Not set</span>
                    )}
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.optimal ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.optimal ? 'Good' : 'Issue'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SEO Recommendations */}
        <div className="card-elevated bg-white rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-3">Social Media Recommendations</h4>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-500 mt-0.5">💡</div>
              <p>Use high-quality images with 1200x630 pixels for optimal display</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-500 mt-0.5">💡</div>
              <p>Keep titles under 60 characters for Open Graph and 70 for Twitter</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-500 mt-0.5">💡</div>
              <p>Write compelling descriptions that encourage social sharing</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-500 mt-0.5">💡</div>
              <p>Test your social media previews using Facebook and Twitter validators</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-500 mt-0.5">💡</div>
              <p>Include your brand handle in twitter:site for better attribution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SocialAnalysis