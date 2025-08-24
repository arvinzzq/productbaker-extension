import React, { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { BarChart3 } from "lucide-react"

interface PageAnalysis {
  // 基础SEO信息
  title: string
  titleLength: number
  description: string
  descriptionLength: number
  keywords: string
  url: string
  canonical: string
  
  // 域名信息
  domain: string
  domainCreationDate: string | null
  domainExpiryDate: string | null
  
  // 技术配置
  favicon: boolean
  ssrCheck: boolean
  robotsTag: string
  xRobotsTag: string
  robotsTxt: boolean
  sitemap: boolean
  
  // 工具检测
  googleAnalytics: boolean
  googleAdsense: boolean
  
  // 页面基础信息
  wordCount: number
  language: string
  
  // 结构化标签
  headings: {
    h1: number
    h2: number
    h3: number
    h4: number
    h5: number
    h6: number
  }
  
  // 图片和链接
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

interface PageAnalysisComponentProps {
  autoAnalyze?: boolean
}

export const PageAnalysisComponent: React.FC<PageAnalysisComponentProps> = ({ 
  autoAnalyze = false 
}) => {
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
    
    // 域名信息 - 简化版本，实际域名注册信息需要外部API
    const domain = urlObj.hostname
    const domainCreationDate = null // 需要WHOIS API
    const domainExpiryDate = null // 需要WHOIS API
    
    // 技术配置检测
    const favicon = !!doc.querySelector('link[rel*="icon"]')
    const ssrCheck = detectSSR()
    const robotsTag = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || 'Missing'
    const xRobotsTag = 'Missing' // HTTP header需要服务器端检测
    
    // 工具检测
    const googleAnalytics = detectGoogleAnalytics()
    const googleAdsense = detectGoogleAdsense()
    
    // 页面语言
    const language = doc.documentElement.lang || doc.querySelector('meta[http-equiv="content-language"]')?.getAttribute('content') || 'N/A'
    
    // Headings analysis
    const headings = {
      h1: doc.querySelectorAll('h1').length,
      h2: doc.querySelectorAll('h2').length,
      h3: doc.querySelectorAll('h3').length,
      h4: doc.querySelectorAll('h4').length,
      h5: doc.querySelectorAll('h5').length,
      h6: doc.querySelectorAll('h6').length,
    }
    
    // Images analysis
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
    
    // Links analysis
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
          internal++ // relative links are internal
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
    
    // Word count (approximate)
    const textContent = doc.body.innerText || ''
    const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length
    
    // Check for robots.txt and sitemap
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
      // 基础SEO信息
      title,
      titleLength,
      description,
      descriptionLength,
      keywords,
      url,
      canonical,
      
      // 域名信息
      domain,
      domainCreationDate,
      domainExpiryDate,
      
      // 技术配置
      favicon,
      ssrCheck,
      robotsTag,
      xRobotsTag,
      robotsTxt,
      sitemap,
      
      // 工具检测
      googleAnalytics,
      googleAdsense,
      
      // 页面基础信息
      wordCount,
      language,
      
      // 结构化标签
      headings,
      
      // 图片和链接
      images,
      links,
    }
  }

  // 检测函数
  const detectSSR = (): boolean => {
    // 检测是否为服务端渲染
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
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Creation Date</span>
                <span className="text-sm font-medium text-slate-600">
                  {pageAnalysis.domainCreationDate || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Expiry Date</span>
                <span className="text-sm font-medium text-slate-600">
                  {pageAnalysis.domainExpiryDate || 'Unknown'}
                </span>
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
                <Badge className={`text-xs font-medium ${pageAnalysis.favicon ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {pageAnalysis.favicon ? 'Found' : 'Missing'}
                </Badge>
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