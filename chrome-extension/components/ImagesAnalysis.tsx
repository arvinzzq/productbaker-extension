import React, { useState, useEffect } from "react"
import { useSEOAnalysis } from "../hooks/useSEOAnalysis"

interface ImageItem {
  src: string
  alt: string
  title: string
  width?: number
  height?: number
  fileSize?: number
  loading?: string
  lazy?: boolean
}

interface ImagesAnalysisProps {
  autoAnalyze?: boolean
}

export const ImagesAnalysis: React.FC<ImagesAnalysisProps> = ({ autoAnalyze = false }) => {
  const { analysis, isAnalyzing, analyzeCurrentPage } = useSEOAnalysis()
  const [imagesList, setImagesList] = useState<ImageItem[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)

  useEffect(() => {
    if (autoAnalyze && !analysis && !isAnalyzing) {
      analyzeCurrentPage()
    }
  }, [autoAnalyze, analysis, isAnalyzing, analyzeCurrentPage])

  useEffect(() => {
    if (analysis) {
      extractImagesFromPage()
    }
  }, [analysis])

  const extractImagesFromPage = async () => {
    setIsLoadingImages(true)
    try {
      const images: ImageItem[] = []
      const imageElements = document.querySelectorAll('img')
      
      for (const img of imageElements) {
        // Skip very small images (likely tracking pixels, icons, etc.)
        if (img.width > 20 && img.height > 20) {
          const imageData: ImageItem = {
            src: img.src || img.getAttribute('data-src') || '',
            alt: img.alt || '',
            title: img.title || '',
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            loading: img.getAttribute('loading') || 'eager',
            lazy: img.getAttribute('loading') === 'lazy'
          }
          
          // Try to estimate file size (rough approximation)
          if (imageData.width && imageData.height) {
            const pixelCount = imageData.width * imageData.height
            imageData.fileSize = Math.round(pixelCount * 0.5 / 1024) // Very rough KB estimate
          }
          
          images.push(imageData)
        }
      }
      
      setImagesList(images)
    } catch (error) {
      console.error('Error extracting images:', error)
    } finally {
      setIsLoadingImages(false)
    }
  }

  const getImageStats = () => {
    const stats = {
      total: imagesList.length,
      withoutAlt: imagesList.filter(img => !img.alt || img.alt.trim() === '').length,
      withoutTitle: imagesList.filter(img => !img.title || img.title.trim() === '').length,
      withLazyLoading: imagesList.filter(img => img.lazy).length,
      largeImages: imagesList.filter(img => img.fileSize && img.fileSize > 100).length,
      uniqueAlts: new Set(imagesList.map(img => img.alt).filter(alt => alt)).size
    }
    return stats
  }

  const getImageIssues = () => {
    const issues: string[] = []
    const stats = getImageStats()
    
    if (stats.withoutAlt > 0) {
      issues.push(`${stats.withoutAlt} images missing alt attributes`)
    }
    
    if (stats.withoutTitle > stats.total * 0.5) {
      issues.push(`${stats.withoutTitle} images missing title attributes`)
    }
    
    if (stats.withLazyLoading === 0 && stats.total > 3) {
      issues.push('Consider implementing lazy loading for better performance')
    }
    
    if (stats.largeImages > 0) {
      issues.push(`${stats.largeImages} potentially large images detected`)
    }
    
    // Check for duplicate alt texts
    const altCounts = imagesList.reduce((acc, img) => {
      if (img.alt) {
        acc[img.alt] = (acc[img.alt] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    const duplicateAlts = Object.entries(altCounts).filter(([, count]) => count > 1).length
    if (duplicateAlts > 0) {
      issues.push(`${duplicateAlts} duplicate alt texts found`)
    }
    
    return issues
  }

  const formatFileSize = (sizeKB?: number) => {
    if (!sizeKB) return 'Unknown'
    if (sizeKB < 1024) return `${sizeKB}KB`
    return `${(sizeKB / 1024).toFixed(1)}MB`
  }

  const getImageType = (src: string) => {
    const extension = src.split('.').pop()?.toLowerCase()
    if (!extension) return 'Unknown'
    
    const types: Record<string, string> = {
      'jpg': 'JPEG',
      'jpeg': 'JPEG', 
      'png': 'PNG',
      'gif': 'GIF',
      'webp': 'WebP',
      'svg': 'SVG',
      'bmp': 'BMP',
      'ico': 'ICO'
    }
    
    return types[extension] || extension.toUpperCase()
  }

  if (isAnalyzing || isLoadingImages) {
    return (
      <div className="bg-gradient-to-br from-slate-50/30 to-white">
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <p className="text-sm text-slate-600 mt-2">Analyzing images...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="bg-gradient-to-br from-slate-50/30 to-white">
        <div className="p-4 text-center text-slate-500">
          <p className="text-sm">Ready to analyze images</p>
        </div>
      </div>
    )
  }

  const stats = getImageStats()
  const issues = getImageIssues()

  return (
    <div className="bg-gradient-to-br from-slate-50/30 to-white">
      <div className="p-4 space-y-4">

        {/* Statistics Cards */}
        <div className="card-elevated bg-white rounded-lg">
          <div className="p-4 space-y-4">
            <h3 className="font-medium text-slate-900 text-sm">Images Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                <div className="text-xs text-slate-600">Total Images</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-800">{stats.uniqueAlts}</div>
                <div className="text-xs text-slate-600">Unique Alt Tags</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className={`text-2xl font-bold ${stats.withoutAlt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.withoutAlt}
                </div>
                <div className="text-xs text-slate-600">Missing Alt</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className={`text-2xl font-bold ${stats.withLazyLoading === 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {stats.withLazyLoading}
                </div>
                <div className="text-xs text-slate-600">Lazy Loading</div>
              </div>
            </div>
          </div>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div className="card-elevated bg-white rounded-lg">
            <div className="p-4 space-y-2">
              <h4 className="font-medium text-slate-900 text-sm flex items-center">
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
          </div>
        )}

        {/* Images List */}
        <div className="card-elevated bg-white rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b">
            <h4 className="font-medium text-slate-900 text-sm">Images Details</h4>
          </div>
          
          {imagesList.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No images found on this page</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {imagesList.map((image, index) => (
                <div
                  key={index}
                  className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    {/* Image Thumbnail */}
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">
                      <img
                        src={image.src}
                        alt={image.alt || 'Image preview'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                    
                    {/* Image Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {getImageType(image.src)}
                        </span>
                        {image.width && image.height && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {image.width} × {image.height}
                          </span>
                        )}
                        {image.fileSize && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            image.fileSize > 100 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            ~{formatFileSize(image.fileSize)}
                          </span>
                        )}
                        {image.lazy && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Lazy
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-800 font-mono break-all">
                        {image.src.length > 60 ? image.src.substring(0, 60) + '...' : image.src}
                      </p>
                      
                      <div className="space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-slate-500 w-8 flex-shrink-0">Alt:</span>
                          <span className={`text-xs ${
                            image.alt ? 'text-slate-700' : 'text-red-500 italic'
                          }`}>
                            {image.alt || 'Missing alt attribute'}
                          </span>
                        </div>
                        
                        {image.title && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-slate-500 w-8 flex-shrink-0">Title:</span>
                            <span className="text-xs text-slate-700">{image.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO Recommendations */}
        <div className="card-elevated bg-white rounded-lg">
          <div className="p-4 space-y-2">
            <h4 className="font-medium text-slate-900 text-sm">SEO Recommendations</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 text-green-500 mt-0.5">💡</div>
                <p>Add descriptive alt text to all images for accessibility and SEO</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 text-green-500 mt-0.5">💡</div>
                <p>Use modern image formats like WebP for better compression</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 text-green-500 mt-0.5">💡</div>
                <p>Implement lazy loading for images below the fold</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 text-green-500 mt-0.5">💡</div>
                <p>Optimize image file sizes to improve page load speed</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 text-green-500 mt-0.5">💡</div>
                <p>Include relevant keywords in image file names and alt text</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImagesAnalysis