import React, { useState, useEffect } from "react"
import { Badge } from "./ui/badge"

interface PageAnalysis {
  title: string
  titleLength: number
  description: string
  descriptionLength: number
  keywords: string
  url: string
  canonical: string
  domain: string
  domainCreationDate: string | null
  domainExpiryDate: string | null
  favicon: boolean
  ssrCheck: boolean
  robotsTag: string
  xRobotsTag: string
  robotsTxt: boolean
  sitemap: boolean
  googleAnalytics: boolean
  googleAdsense: boolean
  wordCount: number
  language: string
  headings: {
    h1: number
    h2: number
    h3: number
    h4: number
    h5: number
    h6: number
  }
  images: {
    total: number
    unique: number
    withoutAlt: number
    withoutTitle: number
  }
  links: {
    total: number
    unique: number
    internal: number
    external: number
    dofollow: number
    nofollow: number
  }
}

interface CompactPageAnalysisProps {
  autoAnalyze?: boolean
}

export const CompactPageAnalysis: React.FC<CompactPageAnalysisProps> = ({ autoAnalyze = false }) => {
  const [pageAnalysis, setPageAnalysis] = useState<PageAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeCurrentPage = async (): Promise<PageAnalysis> => {
    const doc = document
    const url = window.location.href
    const urlObj = new URL(url)
    
    // 基础SEO信息
    const title = doc.title || 'N/A'
    const titleLength = title !== 'N/A' ? title.length : 0
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'N/A'
    const descriptionLength = description !== 'N/A' ? description.length : 0
    const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || 'N/A'
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || url
    
    const domain = urlObj.hostname
    const domainCreationDate = null
    const domainExpiryDate = null
    
    const favicon = !!doc.querySelector('link[rel*="icon"]')
    const ssrCheck = detectSSR()
    const robotsTag = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || 'Missing'
    const xRobotsTag = 'Missing'
    
    const googleAnalytics = detectGoogleAnalytics()
    const googleAdsense = detectGoogleAdsense()
    const language = doc.documentElement.lang || 'N/A'
    
    const headings = {
      h1: doc.querySelectorAll('h1').length,
      h2: doc.querySelectorAll('h2').length,
      h3: doc.querySelectorAll('h3').length,
      h4: doc.querySelectorAll('h4').length,
      h5: doc.querySelectorAll('h5').length,
      h6: doc.querySelectorAll('h6').length,
    }
    
    const allImages = doc.querySelectorAll('img')
    const uniqueSrcs = new Set(Array.from(allImages).map(img => img.src))
    const imagesWithoutAlt = Array.from(allImages).filter(img => !img.alt || img.alt.trim() === '')
    const imagesWithoutTitle = Array.from(allImages).filter(img => !img.title || img.title.trim() === '')
    
    const images = {
      total: allImages.length,
      unique: uniqueSrcs.size,
      withoutAlt: imagesWithoutAlt.length,
      withoutTitle: imagesWithoutTitle.length,
    }
    
    const allLinks = doc.querySelectorAll('a[href]')
    const currentDomain = new URL(url).hostname
    const uniqueHrefs = new Set()
    let internal = 0, external = 0, dofollow = 0, nofollow = 0
    
    Array.from(allLinks).forEach(link => {
      const href = link.getAttribute('href')
      if (href) {
        uniqueHrefs.add(href)
        try {
          const linkUrl = new URL(href, url)
          if (linkUrl.hostname === currentDomain) {
            internal++
          } else {
            external++
          }
        } catch {
          internal++
        }
        const rel = link.getAttribute('rel')
        if (rel && rel.includes('nofollow')) {
          nofollow++
        } else {
          dofollow++
        }
      }
    })
    
    const links = {
      total: allLinks.length,
      unique: uniqueHrefs.size,
      internal,
      external,
      dofollow,
      nofollow,
    }
    
    const textContent = doc.body.innerText || ''
    const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length
    
    let robotsTxt = false
    let sitemap = false
    
    try {
      const robotsResponse = await fetch(`${new URL(url).origin}/robots.txt`, { method: 'HEAD' })
      robotsTxt = robotsResponse.ok
    } catch {}
    
    try {
      const sitemapResponse = await fetch(`${new URL(url).origin}/sitemap.xml`, { method: 'HEAD' })
      sitemap = sitemapResponse.ok
    } catch {}
    
    return {
      title,
      titleLength,
      description,
      descriptionLength,
      keywords,
      url,
      canonical,
      domain,
      domainCreationDate,
      domainExpiryDate,
      favicon,
      ssrCheck,
      robotsTag,
      xRobotsTag,
      robotsTxt,
      sitemap,
      googleAnalytics,
      googleAdsense,
      wordCount,
      language,
      headings,
      images,
      links,
    }
  }

  const detectSSR = (): boolean => {
    return !!document.querySelector('script[type="application/ld+json"]') || 
           !!document.querySelector('meta[name="generator"]') ||
           document.documentElement.innerHTML.includes('__NEXT_DATA__') ||
           document.documentElement.innerHTML.includes('__NUXT__')
  }

  const detectGoogleAnalytics = (): boolean => {
    return !!(window as any).gtag || 
           !!(window as any).ga || 
           !!(window as any).dataLayer ||
           !!document.querySelector('script[src*="google-analytics"]') ||
           !!document.querySelector('script[src*="gtag/js"]') ||
           !!document.querySelector('script[src*="googletagmanager"]')
  }

  const detectGoogleAdsense = (): boolean => {
    return !!document.querySelector('script[src*="googlesyndication"]') ||
           !!document.querySelector('ins[class*="adsbygoogle"]') ||
           !!document.querySelector('script[async][src*="pagead2.googlesyndication.com"]')
  }

  const handleAnalyzePage = async () => {
    setIsAnalyzing(true)
    try {
      const analysis = await analyzeCurrentPage()
      setPageAnalysis(analysis)
    } catch (error) {
      console.error('Error analyzing page:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (autoAnalyze) {
      handleAnalyzePage()
    }
  }, [autoAnalyze])

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
    <div className="bg-gray-50 text-sm overflow-y-auto p-4">
      {/* Title */}
      <div className="bg-white border border-gray-200 rounded-lg mb-3 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700 text-sm">Title</span>
          <div className={`px-2 py-1 rounded text-xs font-medium ${pageAnalysis.titleLength > 60 ? 'bg-red-50 text-red-600' : pageAnalysis.titleLength < 30 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
            {pageAnalysis.titleLength}/60
          </div>
        </div>
        <div className="text-gray-800 text-sm leading-relaxed">
          {pageAnalysis.title}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-200 rounded-lg mb-3 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700 text-sm">Description</span>
          <div className={`px-2 py-1 rounded text-xs font-medium ${pageAnalysis.descriptionLength > 160 ? 'bg-red-50 text-red-600' : pageAnalysis.descriptionLength === 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {pageAnalysis.descriptionLength}/160
          </div>
        </div>
        <div className="text-gray-800 text-sm leading-relaxed">
          {pageAnalysis.description === 'N/A' ? (
            <span className="text-amber-600 font-medium">Missing</span>
          ) : pageAnalysis.description}
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-white border border-gray-200 rounded-lg mb-3 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700 text-sm">Keywords</span>
          <div className={`px-2 py-1 rounded text-xs font-medium ${pageAnalysis.keywords === 'N/A' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
            {pageAnalysis.keywords === 'N/A' ? 'Missing' : 'Found'}
          </div>
        </div>
        <div className="text-gray-800 text-sm leading-relaxed">
          {pageAnalysis.keywords}
        </div>
      </div>

      {/* Technical Overview */}
      <div className="bg-white border border-gray-200 rounded-lg mb-3 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-700 text-sm">Technical</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Favicon</span>
            <div className={`w-2 h-2 rounded-full ${pageAnalysis.favicon ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">SSR</span>
            <div className={`w-2 h-2 rounded-full ${pageAnalysis.ssrCheck ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">robots.txt</span>
            <div className={`w-2 h-2 rounded-full ${pageAnalysis.robotsTxt ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">sitemap.xml</span>
            <div className={`w-2 h-2 rounded-full ${pageAnalysis.sitemap ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </div>
      </div>

      {/* Domain & Analytics */}
      <div className="bg-white border border-gray-200 rounded-lg mb-3 p-4">
        <div className="mb-3">
          <span className="font-medium text-gray-700 text-sm">Domain</span>
          <div className="text-sm text-gray-800 mt-1">{pageAnalysis.domain}</div>
        </div>
        <div className="border-t pt-3">
          <span className="font-medium text-gray-700 text-sm mb-2 block">Analytics</span>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Google Analytics</span>
              <div className={`w-2 h-2 rounded-full ${pageAnalysis.googleAnalytics ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Google AdSense</span>
              <div className={`w-2 h-2 rounded-full ${pageAnalysis.googleAdsense ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-700 text-sm">Content</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-lg font-semibold text-gray-800">{pageAnalysis.wordCount.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Words</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-800">{pageAnalysis.language || 'N/A'}</div>
            <div className="text-xs text-gray-600">Language</div>
          </div>
        </div>
        
        {/* Headings */}
        <div className="border-t pt-4 mb-4">
          <div className="text-xs text-gray-600 mb-2">Headings</div>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(pageAnalysis.headings).map(([tag, count]) => (
              <div key={tag} className="text-center">
                <div className={`text-sm font-semibold ${count > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                  {count}
                </div>
                <div className="text-xs text-gray-500 uppercase">{tag}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Images & Links */}
        <div className="border-t pt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-600 mb-2">Images</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">{pageAnalysis.images.total}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">No Alt</span>
                <span className={`font-medium ${pageAnalysis.images.withoutAlt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {pageAnalysis.images.withoutAlt}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-2">Links</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">{pageAnalysis.links.total}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">External</span>
                <span className="font-medium">{pageAnalysis.links.external}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompactPageAnalysis