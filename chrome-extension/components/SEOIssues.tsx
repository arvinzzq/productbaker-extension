import React, { useState, useEffect } from "react"
import { Badge } from "./ui/badge"
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronRight, FileText, Image, Link, Hash } from "lucide-react"
import { useSEOAnalysis } from "../hooks/useSEOAnalysis"

interface SEOIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  category: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  count?: number
}

interface HeadingItem {
  level: number
  text: string
  tag: string
}

interface ImageItem {
  src: string
  alt: string
  title: string
  width?: number
  height?: number
}

interface LinkItem {
  url: string
  text: string
  title: string
  type: 'internal' | 'external'
  rel: string
  nofollow: boolean
  domain: string
}

interface SEOReportProps {
  autoAnalyze?: boolean
}

export const SEOIssues: React.FC<SEOReportProps> = ({ autoAnalyze = false }) => {
  const { analysis, isAnalyzing, analyzeCurrentPage } = useSEOAnalysis()
  const [issues, setIssues] = useState<SEOIssue[]>([])
  const [headingsList, setHeadingsList] = useState<HeadingItem[]>([])
  const [imagesList, setImagesList] = useState<ImageItem[]>([])
  const [linksList, setLinksList] = useState<LinkItem[]>([])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [localAnalyzing, setLocalAnalyzing] = useState(false)

  const analyzePageIssues = async (): Promise<SEOIssue[]> => {
    const doc = document
    const foundIssues: SEOIssue[] = []

    // Title检查
    const title = doc.title
    if (!title || title.trim() === '') {
      foundIssues.push({
        id: 'missing-title',
        type: 'error',
        category: 'Meta Tags',
        title: 'Missing Page Title',
        description: 'The page is missing a title tag',
        impact: 'high'
      })
    } else if (title.length > 60) {
      foundIssues.push({
        id: 'long-title',
        type: 'warning',
        category: 'Meta Tags',
        title: 'Title Too Long',
        description: `Title is ${title.length} characters (recommended: 50-60)`,
        impact: 'medium'
      })
    } else if (title.length < 30) {
      foundIssues.push({
        id: 'short-title',
        type: 'warning',
        category: 'Meta Tags',
        title: 'Title Too Short',
        description: `Title is ${title.length} characters (recommended: 50-60)`,
        impact: 'medium'
      })
    } else {
      foundIssues.push({
        id: 'title-ok',
        type: 'info',
        category: 'Meta Tags',
        title: 'Page Title Optimal',
        description: `Title length is ${title.length} characters (within recommended range)`,
        impact: 'low'
      })
    }

    // Meta Description检查
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')
    if (!description || description.trim() === '') {
      foundIssues.push({
        id: 'missing-description',
        type: 'error',
        category: 'Meta Tags',
        title: 'Missing Meta Description',
        description: 'The page is missing a meta description',
        impact: 'high'
      })
    } else if (description.length > 160) {
      foundIssues.push({
        id: 'long-description',
        type: 'warning',
        category: 'Meta Tags',
        title: 'Meta Description Too Long',
        description: `Description is ${description.length} characters (recommended: 150-160)`,
        impact: 'medium'
      })
    } else if (description.length < 120) {
      foundIssues.push({
        id: 'short-description',
        type: 'warning',
        category: 'Meta Tags',
        title: 'Meta Description Too Short',
        description: `Description is ${description.length} characters (recommended: 150-160)`,
        impact: 'medium'
      })
    } else {
      foundIssues.push({
        id: 'description-ok',
        type: 'info',
        category: 'Meta Tags',
        title: 'Meta Description Optimal',
        description: `Description length is ${description.length} characters (within recommended range)`,
        impact: 'low'
      })
    }

    // H1标签检查
    const h1Tags = doc.querySelectorAll('h1')
    if (h1Tags.length === 0) {
      foundIssues.push({
        id: 'missing-h1',
        type: 'error',
        category: 'Headings',
        title: 'Missing H1 Tag',
        description: 'The page is missing an H1 tag',
        impact: 'high'
      })
    } else if (h1Tags.length > 1) {
      foundIssues.push({
        id: 'multiple-h1',
        type: 'warning',
        category: 'Headings',
        title: 'Multiple H1 Tags',
        description: `Found ${h1Tags.length} H1 tags (recommended: 1)`,
        impact: 'medium',
        count: h1Tags.length
      })
    } else {
      foundIssues.push({
        id: 'h1-ok',
        type: 'info',
        category: 'Headings',
        title: 'H1 Tag Optimal',
        description: 'Page has exactly one H1 tag as recommended',
        impact: 'low'
      })
    }

    // 图片Alt检查
    const images = doc.querySelectorAll('img')
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '')
    if (images.length === 0) {
      foundIssues.push({
        id: 'no-images',
        type: 'info',
        category: 'Images',
        title: 'No Images Found',
        description: 'Page contains no images',
        impact: 'low'
      })
    } else if (imagesWithoutAlt.length > 0) {
      foundIssues.push({
        id: 'images-missing-alt',
        type: 'warning',
        category: 'Images',
        title: 'Images Missing Alt Text',
        description: `${imagesWithoutAlt.length} of ${images.length} images are missing alt text`,
        impact: 'medium',
        count: imagesWithoutAlt.length
      })
    } else {
      foundIssues.push({
        id: 'images-alt-ok',
        type: 'info',
        category: 'Images',
        title: 'All Images Have Alt Text',
        description: `All ${images.length} images have proper alt text`,
        impact: 'low',
        count: images.length
      })
    }

    // 内部链接检查
    const links = doc.querySelectorAll('a[href]')
    const brokenInternalLinks: Element[] = []
    
    Array.from(links).forEach(link => {
      const href = link.getAttribute('href')
      if (href && href.startsWith('#') && href.length > 1) {
        const targetElement = doc.querySelector(href)
        if (!targetElement) {
          brokenInternalLinks.push(link)
        }
      }
    })

    if (brokenInternalLinks.length > 0) {
      foundIssues.push({
        id: 'broken-internal-links',
        type: 'warning',
        category: 'Links',
        title: 'Broken Internal Links',
        description: `${brokenInternalLinks.length} internal anchor links point to non-existent elements`,
        impact: 'low',
        count: brokenInternalLinks.length
      })
    }

    // Robots meta检查
    const robotsMeta = doc.querySelector('meta[name="robots"]')
    if (robotsMeta) {
      const content = robotsMeta.getAttribute('content')
      if (content && (content.includes('noindex') || content.includes('nofollow'))) {
        foundIssues.push({
          id: 'robots-restrictions',
          type: 'info',
          category: 'Indexing',
          title: 'Robots Restrictions',
          description: `Robots meta tag contains: ${content}`,
          impact: 'high'
        })
      }
    }

    return foundIssues
  }

  const extractHeadings = () => {
    const headings: HeadingItem[] = []
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headingElements.forEach((heading) => {
      const level = parseInt(heading.tagName.substring(1))
      const text = heading.textContent?.trim() || ''
      if (text) {
        headings.push({
          level,
          text,
          tag: heading.tagName.toLowerCase()
        })
      }
    })
    setHeadingsList(headings)
  }

  const extractImages = () => {
    const images: ImageItem[] = []
    const imageElements = document.querySelectorAll('img')
    imageElements.forEach((img) => {
      if (img.width > 20 && img.height > 20) {
        images.push({
          src: img.src,
          alt: img.alt || '',
          title: img.title || '',
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height
        })
      }
    })
    setImagesList(images)
  }

  const extractLinks = () => {
    const links: LinkItem[] = []
    const linkElements = document.querySelectorAll('a[href]')
    const currentDomain = window.location.hostname
    
    linkElements.forEach((link) => {
      const href = link.getAttribute('href') || ''
      const text = link.textContent?.trim() || ''
      const title = link.getAttribute('title') || ''
      const rel = link.getAttribute('rel') || ''
      
      if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
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
          } else {
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
          nofollow: rel.toLowerCase().includes('nofollow'),
          domain
        })
      }
    })
    setLinksList(links)
  }

  const handleAnalyzeReport = async () => {
    setLocalAnalyzing(true)
    try {
      await analyzeCurrentPage()
      const detectedIssues = await analyzePageIssues()
      setIssues(detectedIssues)
      extractHeadings()
      extractImages()
      extractLinks()
    } catch (error) {
      console.error('Error analyzing SEO report:', error)
    } finally {
      setLocalAnalyzing(false)
    }
  }

  useEffect(() => {
    if (autoAnalyze && !analysis && !isAnalyzing) {
      handleAnalyzeReport()
    }
  }, [autoAnalyze, analysis, isAnalyzing])

  useEffect(() => {
    if (analysis) {
      const detectedIssues = analyzePageIssuesFromData()
      setIssues(detectedIssues)
      extractHeadings()
      extractImages()
      extractLinks()
    }
  }, [analysis])

  const analyzePageIssuesFromData = (): SEOIssue[] => {
    if (!analysis) return []
    
    const foundIssues: SEOIssue[] = []
    
    // Title analysis
    if (!analysis.title || analysis.title === 'N/A') {
      foundIssues.push({
        id: 'missing-title',
        type: 'error',
        category: 'Meta Tags',
        title: 'Missing Page Title',
        description: 'The page is missing a title tag',
        impact: 'high'
      })
    } else if (analysis.titleStatus === 'warning' || analysis.titleStatus === 'error') {
      foundIssues.push({
        id: 'title-length',
        type: analysis.titleStatus === 'error' ? 'error' : 'warning',
        category: 'Meta Tags',
        title: 'Title Length Issue',
        description: `Title is ${analysis.titleLength} characters (recommended: 30-60)`,
        impact: 'medium'
      })
    }
    
    // Description analysis
    if (!analysis.description || analysis.description === 'N/A') {
      foundIssues.push({
        id: 'missing-description',
        type: 'error',
        category: 'Meta Tags',
        title: 'Missing Meta Description',
        description: 'The page is missing a meta description',
        impact: 'high'
      })
    } else if (analysis.descriptionStatus === 'warning' || analysis.descriptionStatus === 'error') {
      foundIssues.push({
        id: 'description-length',
        type: analysis.descriptionStatus === 'error' ? 'error' : 'warning',
        category: 'Meta Tags',
        title: 'Description Length Issue',
        description: `Description is ${analysis.descriptionLength} characters (recommended: 140-160)`,
        impact: 'medium'
      })
    }
    
    // Headings analysis
    const h1Count = analysis.headings.h1 || 0
    if (h1Count === 0) {
      foundIssues.push({
        id: 'missing-h1',
        type: 'error',
        category: 'Structure',
        title: 'Missing H1 Tag',
        description: 'Every page should have exactly one H1 tag',
        impact: 'high'
      })
    } else if (h1Count > 1) {
      foundIssues.push({
        id: 'multiple-h1',
        type: 'warning',
        category: 'Structure',
        title: 'Multiple H1 Tags',
        description: `Found ${h1Count} H1 tags (recommended: 1)`,
        impact: 'medium',
        count: h1Count
      })
    }
    
    // Images analysis
    if (analysis.images.withoutAlt > 0) {
      foundIssues.push({
        id: 'images-missing-alt',
        type: 'warning',
        category: 'Accessibility',
        title: 'Images Missing Alt Text',
        description: `${analysis.images.withoutAlt} of ${analysis.images.total} images are missing alt text`,
        impact: 'medium',
        count: analysis.images.withoutAlt
      })
    }
    
    return foundIssues
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const getIssueIcon = (type: SEOIssue['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getIssueColor = (type: SEOIssue['type']) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-green-200 bg-green-50'
      default:
        return 'border-green-200 bg-green-50'
    }
  }

  const getImpactBadge = (impact: SEOIssue['impact']) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return (
      <Badge className={`text-xs ${colors[impact]}`}>
        {impact.toUpperCase()}
      </Badge>
    )
  }

  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = []
    }
    acc[issue.category].push(issue)
    return acc
  }, {} as Record<string, SEOIssue[]>)

  const errorCount = issues.filter(i => i.type === 'error').length
  const warningCount = issues.filter(i => i.type === 'warning').length
  const infoCount = issues.filter(i => i.type === 'info').length

  const isCurrentlyAnalyzing = isAnalyzing || localAnalyzing

  if (isCurrentlyAnalyzing) {
    return (
      <div className="bg-gradient-to-br from-slate-50/30 to-white">
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <p className="text-sm text-slate-600 mt-2">Analyzing SEO report...</p>
        </div>
      </div>
    )
  }

  if (!analysis && issues.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-50/30 to-white">
        <div className="p-4 text-center py-8">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-900 mb-2">SEO Report</h4>
          <p className="text-slate-600 mb-4">Comprehensive analysis of your page's SEO performance</p>
          <button 
            onClick={handleAnalyzeReport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Generate Report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-50/30 to-white">
      <div className="p-4 space-y-4">
        {/* Executive Summary */}
        <div className="card-elevated bg-white rounded-lg">
          <div className="p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              SEO Report Summary
            </h3>
            
            {analysis && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className={`text-lg font-bold ${errorCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {errorCount}
                  </div>
                  <div className="text-xs text-slate-600">Critical Issues</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className={`text-lg font-bold ${warningCount > 0 ? 'text-yellow-600' : 'text-slate-400'}`}>
                    {warningCount}
                  </div>
                  <div className="text-xs text-slate-600">Warnings</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className={`text-lg font-bold ${infoCount > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                    {infoCount}
                  </div>
                  <div className="text-xs text-slate-600">Optimizations</div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            {analysis && (
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{headingsList.length}</div>
                  <div className="text-slate-600">Headings</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{imagesList.length}</div>
                  <div className="text-slate-600">Images</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{linksList.length}</div>
                  <div className="text-slate-600">Links</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Issues Section */}
        {issues.length > 0 && (
          <div className="space-y-4">
            {Object.entries(groupedIssues).map(([category, categoryIssues]) => (
              <div key={category} className="card-elevated bg-white rounded-lg">
                <div className="px-4 py-3 bg-slate-50 border-b">
                  <h4 className="font-medium text-slate-900 text-sm">
                    {category} Issues ({categoryIssues.length})
                  </h4>
                </div>
                
                <div className="p-4 space-y-3">
                  {categoryIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`border rounded-lg p-3 ${getIssueColor(issue.type)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-slate-900 text-sm">
                                {issue.title}
                              </h5>
                              {issue.count && (
                                <Badge variant="outline" className="text-xs">
                                  {issue.count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-700">
                              {issue.description}
                            </p>
                          </div>
                        </div>
                        {getImpactBadge(issue.impact)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Analysis Sections */}
        <div className="space-y-4">
          {/* Headings Analysis */}
          <div className="card-elevated bg-white rounded-lg">
            <button
              onClick={() => toggleSection('headings')}
              className="w-full px-4 py-3 bg-slate-50 border-b flex items-center justify-between hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-600" />
                <h4 className="font-medium text-slate-900 text-sm">
                  Headings Structure ({headingsList.length})
                </h4>
              </div>
              {expandedSections.has('headings') ? 
                <ChevronDown className="w-4 h-4 text-slate-600" /> : 
                <ChevronRight className="w-4 h-4 text-slate-600" />
              }
            </button>
            
            {expandedSections.has('headings') && (
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {headingsList.length === 0 ? (
                  <p className="text-sm text-slate-500">No headings found</p>
                ) : (
                  headingsList.map((heading, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded">
                      <Badge variant="outline" className="text-xs font-mono flex-shrink-0">
                        {heading.tag.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-slate-700 flex-1" style={{paddingLeft: `${(heading.level - 1) * 12}px`}}>
                        {heading.text}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Images Analysis */}
          <div className="card-elevated bg-white rounded-lg">
            <button
              onClick={() => toggleSection('images')}
              className="w-full px-4 py-3 bg-slate-50 border-b flex items-center justify-between hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-slate-600" />
                <h4 className="font-medium text-slate-900 text-sm">
                  Images Analysis ({imagesList.length})
                </h4>
              </div>
              {expandedSections.has('images') ? 
                <ChevronDown className="w-4 h-4 text-slate-600" /> : 
                <ChevronRight className="w-4 h-4 text-slate-600" />
              }
            </button>
            
            {expandedSections.has('images') && (
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {imagesList.length === 0 ? (
                  <p className="text-sm text-slate-500">No images found</p>
                ) : (
                  imagesList.map((image, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded">
                      <img 
                        src={image.src} 
                        alt={image.alt} 
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-600 truncate">{image.src}</div>
                        <div className="text-sm text-slate-800 mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${image.alt ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {image.alt ? 'Has Alt' : 'No Alt'}
                          </span>
                          {image.width && image.height && (
                            <span className="text-xs text-slate-500 ml-2">
                              {image.width}x{image.height}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Links Analysis */}
          <div className="card-elevated bg-white rounded-lg">
            <button
              onClick={() => toggleSection('links')}
              className="w-full px-4 py-3 bg-slate-50 border-b flex items-center justify-between hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-slate-600" />
                <h4 className="font-medium text-slate-900 text-sm">
                  Links Analysis ({linksList.length})
                </h4>
              </div>
              {expandedSections.has('links') ? 
                <ChevronDown className="w-4 h-4 text-slate-600" /> : 
                <ChevronRight className="w-4 h-4 text-slate-600" />
              }
            </button>
            
            {expandedSections.has('links') && (
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {linksList.length === 0 ? (
                  <p className="text-sm text-slate-500">No links found</p>
                ) : (
                  linksList.map((link, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded">
                      <div className="flex gap-1 flex-shrink-0">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${link.type === 'external' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'}`}
                        >
                          {link.type}
                        </Badge>
                        {link.nofollow && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                            nofollow
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-800 truncate">{link.text}</div>
                        <div className="text-xs text-slate-500 truncate">{link.url}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SEOIssues