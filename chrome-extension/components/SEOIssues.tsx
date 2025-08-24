import React, { useState, useEffect } from "react"
import { Badge } from "./ui/badge"
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface SEOIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  category: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  count?: number
}

interface SEOIssuesProps {
  autoAnalyze?: boolean
}

export const SEOIssues: React.FC<SEOIssuesProps> = ({ autoAnalyze = false }) => {
  const [issues, setIssues] = useState<SEOIssue[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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
    }

    // 图片Alt检查
    const images = doc.querySelectorAll('img')
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '')
    if (imagesWithoutAlt.length > 0) {
      foundIssues.push({
        id: 'images-missing-alt',
        type: 'warning',
        category: 'Images',
        title: 'Images Missing Alt Text',
        description: `${imagesWithoutAlt.length} images are missing alt text`,
        impact: 'medium',
        count: imagesWithoutAlt.length
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

  const handleAnalyzeIssues = async () => {
    setIsAnalyzing(true)
    try {
      const detectedIssues = await analyzePageIssues()
      setIssues(detectedIssues)
    } catch (error) {
      console.error('Error analyzing SEO issues:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (autoAnalyze) {
      handleAnalyzeIssues()
    }
  }, [autoAnalyze])

  const getIssueIcon = (type: SEOIssue['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <AlertCircle className="w-4 h-4 text-blue-500" />
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
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
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

  if (isAnalyzing) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing SEO issues...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-50/50 to-white">
      <div className="p-6 space-y-6">
        {/* Header with summary */}
        <div className="border-b border-slate-200/60 pb-4">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">SEO Issues</h3>
          <p className="text-sm text-slate-500 mt-1">Identify and fix SEO problems on your page</p>
          {issues.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {errorCount > 0 && (
                <Badge className="bg-red-100 text-red-800 border border-red-200">
                  {errorCount} Errors
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
                  {warningCount} Warnings
                </Badge>
              )}
              {infoCount > 0 && (
                <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                  {infoCount} Info
                </Badge>
              )}
            </div>
          )}
        </div>

        {issues.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h4>
          <p className="text-gray-600">Great! Your page doesn't have any obvious SEO issues.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedIssues).map(([category, categoryIssues]) => (
            <div key={category} className="space-y-3">
              <h4 className="font-medium text-gray-800 pb-2 border-b">
                {category} ({categoryIssues.length})
              </h4>
              
              <div className="space-y-3">
                {categoryIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`border rounded-lg p-4 ${getIssueColor(issue.type)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-gray-900">
                              {issue.title}
                            </h5>
                            {issue.count && (
                              <Badge variant="outline" className="text-xs">
                                {issue.count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">
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
      </div>
    </div>
  )
}

export default SEOIssues