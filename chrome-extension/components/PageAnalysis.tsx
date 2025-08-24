import React, { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

interface PageAnalysis {
  title: string
  description: string
  url: string
  canonical: string
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
  wordCount: number
  language: string
  robotsTag: string
  robotsTxt: boolean
  sitemap: boolean
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
    
    // Basic page info
    const title = doc.title || 'N/A'
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'N/A'
    const url = window.location.href
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || url
    
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
    
    // Language
    const language = doc.documentElement.lang || doc.querySelector('meta[http-equiv="content-language"]')?.getAttribute('content') || 'N/A'
    
    // Robots tag
    const robotsTag = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || 'N/A'
    
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
      title,
      description,
      url,
      canonical,
      headings,
      images,
      links,
      wordCount,
      language,
      robotsTag,
      robotsTxt,
      sitemap,
    }
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
    <div className="flex-1 p-6 space-y-6">
      {/* Analysis Control */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Page Overview
        </h3>
        <Button 
          onClick={handleAnalyzePage}
          disabled={isAnalyzing}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      {/* Basic Page Information */}
      {pageAnalysis && (
        <>
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-800 mb-3">Basic Information</h4>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-blue-600">Title</span>
                <Badge variant="outline" className="text-xs">
                  {pageAnalysis.title.length}/60
                </Badge>
              </div>
              <p className="text-sm text-gray-700 break-words">{pageAnalysis.title}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-blue-600">Description</span>
                <Badge variant="outline" className="text-xs">
                  {pageAnalysis.description !== 'N/A' ? pageAnalysis.description.length : 0}/160
                </Badge>
              </div>
              <p className="text-sm text-gray-700 break-words">{pageAnalysis.description}</p>
            </div>

            <div>
              <span className="text-sm font-medium text-blue-600">URL</span>
              <p className="text-sm text-gray-700 break-all">{pageAnalysis.url}</p>
            </div>

            <div>
              <span className="text-sm font-medium text-blue-600">Canonical</span>
              <p className="text-sm text-gray-700 break-all">{pageAnalysis.canonical}</p>
            </div>
          </div>

          {/* Headings Structure */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Headings Structure</h4>
            <div className="grid grid-cols-6 gap-2">
              {Object.entries(pageAnalysis.headings).map(([tag, count]) => (
                <div key={tag} className="text-center">
                  <div className="text-sm font-medium text-gray-600 uppercase">{tag}</div>
                  <div className="text-lg font-bold text-gray-900">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Images Analysis */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Images</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Images</span>
                  <span className="text-sm font-medium">{pageAnalysis.images.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unique</span>
                  <span className="text-sm font-medium">{pageAnalysis.images.unique}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Without Alt</span>
                  <span className={`text-sm font-medium ${pageAnalysis.images.withoutAlt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {pageAnalysis.images.withoutAlt}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Without Title</span>
                  <span className={`text-sm font-medium ${pageAnalysis.images.withoutTitle > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {pageAnalysis.images.withoutTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Links Analysis */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Links</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Links</span>
                  <span className="text-sm font-medium">{pageAnalysis.links.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unique</span>
                  <span className="text-sm font-medium">{pageAnalysis.links.unique}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Internal</span>
                  <span className="text-sm font-medium">{pageAnalysis.links.internal}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">External</span>
                  <span className="text-sm font-medium">{pageAnalysis.links.external}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dofollow</span>
                  <span className="text-sm font-medium">{pageAnalysis.links.dofollow}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nofollow</span>
                  <span className="text-sm font-medium">{pageAnalysis.links.nofollow}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Additional Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Word Count</span>
                  <span className="text-sm font-medium">{pageAnalysis.wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Language</span>
                  <span className="text-sm font-medium">{pageAnalysis.language}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">robots.txt</span>
                  <Badge variant={pageAnalysis.robotsTxt ? "default" : "secondary"} className="text-xs">
                    {pageAnalysis.robotsTxt ? 'Available' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">sitemap.xml</span>
                  <Badge variant={pageAnalysis.sitemap ? "default" : "secondary"} className="text-xs">
                    {pageAnalysis.sitemap ? 'Available' : 'Missing'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Robots Tag */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Robots Tag</h4>
            <p className="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded">
              {pageAnalysis.robotsTag}
            </p>
          </div>
        </>
      )}

      {/* Initial State */}
      {!pageAnalysis && !isAnalyzing && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Click "Analyze" to get detailed page insights</p>
          <Button 
            onClick={handleAnalyzePage}
            className="bg-green-600 hover:bg-green-700"
          >
            Start Analysis
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing page...</p>
        </div>
      )}
    </div>
  )
}

export default PageAnalysisComponent