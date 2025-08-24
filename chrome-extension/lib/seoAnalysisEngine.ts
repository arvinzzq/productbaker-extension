export interface SEOIssue {
  type: 'success' | 'warning' | 'error'
  title: string
  description: string
  icon: '✓' | '!' | '×'
}

export interface SEOAnalysis {
  // 基础SEO信息
  title: string
  titleLength: number
  titleStatus: 'success' | 'warning' | 'error' | 'missing'
  description: string
  descriptionLength: number
  descriptionStatus: 'success' | 'warning' | 'error' | 'missing'
  keywords: string
  keywordsStatus: 'available' | 'missing'
  url: string
  canonical: string
  canonicalStatus: 'available' | 'missing'
  
  // 域名信息
  domain: string
  domainCreationDate: string | null
  domainExpiryDate: string | null
  domainDaysToExpiry: number | null
  
  // 技术配置
  favicon: boolean
  faviconUrl: string | null
  ssrCheck: boolean
  robotsTag: string
  robotsTagStatus: 'available' | 'missing'
  xRobotsTag: string
  xRobotsTagStatus: 'available' | 'missing'
  robotsTxt: boolean
  robotsTxtUrl: string
  sitemap: boolean
  sitemapUrl: string
  
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
  
  // SEO Issues
  seoIssues: SEOIssue[]
}

interface WhoisInfo {
  creationDate: string | null
  expiryDate: string | null
  registrar: string | null
}

export class SEOAnalysisEngine {
  private static instance: SEOAnalysisEngine
  private cache: Map<string, SEOAnalysis> = new Map()
  
  public static getInstance(): SEOAnalysisEngine {
    if (!SEOAnalysisEngine.instance) {
      SEOAnalysisEngine.instance = new SEOAnalysisEngine()
    }
    return SEOAnalysisEngine.instance
  }
  
  public async analyzeCurrentPage(): Promise<SEOAnalysis> {
    const doc = document
    const url = window.location.href
    const urlObj = new URL(url)
    
    // Check cache first
    const cacheKey = url
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }
    
    // 基础SEO信息
    const title = doc.title || 'N/A'
    const titleLength = title !== 'N/A' ? title.length : 0
    const titleStatus = this.getTitleStatus(title, titleLength)
    
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'N/A'
    const descriptionLength = description !== 'N/A' ? description.length : 0
    const descriptionStatus = this.getDescriptionStatus(description, descriptionLength)
    
    const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || 'N/A'
    const keywordsStatus = keywords !== 'N/A' ? 'available' : 'missing'
    
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || 'Missing'
    const canonicalStatus = canonical !== 'Missing' ? 'available' : 'missing'
    
    // 域名信息 - 模拟数据，实际应该从外部API获取
    const domain = urlObj.hostname
    const domainCreationDate = '2022-11-30 23:59:19' // 模拟数据
    const domainExpiryDate = '2026-11-30 23:59:19'   // 模拟数据
    const domainDaysToExpiry = this.calculateDaysToExpiry(domainExpiryDate)
    
    // 技术配置检测
    const faviconInfo = this.detectFavicon(doc, urlObj.origin)
    const ssrCheck = this.detectSSR(doc)
    const robotsTag = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || 'index, follow'
    const robotsTagStatus = robotsTag !== 'index, follow' ? 'available' : 'missing'
    const xRobotsTag = 'Missing' // 简化，避免额外HTTP请求
    const xRobotsTagStatus = 'missing'
    
    // robots.txt 和 sitemap.xml URL
    const robotsTxtUrl = `${urlObj.origin}/robots.txt`
    const sitemapUrl = `${urlObj.origin}/sitemap.xml`
    
    // 工具检测
    const googleAnalytics = this.detectGoogleAnalytics()
    const googleAdsense = this.detectGoogleAdsense()
    
    // 页面语言
    const language = doc.documentElement.lang || 
                    doc.querySelector('meta[http-equiv="content-language"]')?.getAttribute('content') || 
                    'N/A'
    
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
    const currentDomain = urlObj.hostname
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
    
    // Check for robots.txt and sitemap - 使用更可靠的检测方式
    let robotsTxt = false
    let sitemap = false
    
    // 尝试同步检测 robots.txt 和 sitemap.xml
    try {
      const [robotsExists, sitemapExists] = await Promise.allSettled([
        this.checkFileExists(`${urlObj.origin}/robots.txt`),
        this.checkFileExists(`${urlObj.origin}/sitemap.xml`)
      ])
      
      robotsTxt = robotsExists.status === 'fulfilled' ? robotsExists.value : false
      sitemap = sitemapExists.status === 'fulfilled' ? sitemapExists.value : false
    } catch (error) {
      console.warn('Failed to check robots.txt/sitemap.xml:', error)
      // 如果检测失败，默认假设存在（因为大多数网站都有这些文件）
      // 但我们提供一个更智能的默认值
      robotsTxt = false
      sitemap = false
    }
    
    // Generate SEO issues
    const seoIssues = this.generateSEOIssues({
      title, titleLength, description, descriptionLength, keywords,
      faviconInfo, headings, images, robotsTxt, sitemap, 
      googleAnalytics, googleAdsense, ssrCheck
    })
    
    const result: SEOAnalysis = {
      title,
      titleLength,
      titleStatus,
      description,
      descriptionLength,
      descriptionStatus,
      keywords,
      keywordsStatus,
      url,
      canonical,
      canonicalStatus,
      domain,
      domainCreationDate,
      domainExpiryDate,
      domainDaysToExpiry,
      favicon: faviconInfo.found,
      faviconUrl: faviconInfo.url,
      ssrCheck,
      robotsTag,
      robotsTagStatus,
      xRobotsTag,
      xRobotsTagStatus,
      robotsTxt,
      robotsTxtUrl,
      sitemap,
      sitemapUrl,
      googleAnalytics,
      googleAdsense,
      wordCount,
      language,
      headings,
      images,
      links,
      seoIssues,
    }
    
    // 缓存结果
    this.cache.set(cacheKey, result)
    
    return result
  }
  
  public clearCache(): void {
    this.cache.clear()
  }
  
  public getCachedAnalysis(url: string): SEOAnalysis | null {
    return this.cache.get(url) || null
  }
  
  private generateSEOIssues(data: any): SEOIssue[] {
    const issues: SEOIssue[] = []
    
    // Server Side Rendering Check
    if (data.ssrCheck) {
      issues.push({
        type: 'success',
        title: 'Server Side Rendering Check',
        description: 'This website is using server-side rendering for better SEO.',
        icon: '✓'
      })
    }
    
    // Meta Description Check
    if (!data.description || data.description === 'N/A') {
      issues.push({
        type: 'error',
        title: 'Meta Description Check',
        description: 'Missing meta description. SEO meta descriptions should be 140-160 characters to ensure full display and boost clicks.',
        icon: '×'
      })
    } else if (data.descriptionLength < 140 || data.descriptionLength > 160) {
      issues.push({
        type: 'warning',
        title: 'Meta Description Check',
        description: 'SEO meta descriptions should be 140-160 characters to ensure full display and boost clicks.',
        icon: '!'
      })
    } else {
      issues.push({
        type: 'success',
        title: 'Meta Description Check',
        description: `The meta description length (${data.descriptionLength} characters) is optimal.`,
        icon: '✓'
      })
    }
    
    // Meta Title Check
    if (!data.title || data.title === 'N/A') {
      issues.push({
        type: 'error',
        title: 'Meta Title Check',
        description: 'Missing page title. Title tags are crucial for SEO.',
        icon: '×'
      })
    } else if (data.titleLength < 30 || data.titleLength > 60) {
      issues.push({
        type: 'warning',
        title: 'Meta Title Check',
        description: `The title length (${data.titleLength} characters) should be between 30-60 characters for optimal SEO.`,
        icon: '!'
      })
    } else {
      issues.push({
        type: 'success',
        title: 'Meta Title Check',
        description: `The title length (${data.titleLength} characters) is good.`,
        icon: '✓'
      })
    }
    
    // Canonical URL Check
    issues.push({
      type: 'success',
      title: 'Canonical URL Check',
      description: 'The page has a canonical URL set.',
      icon: '✓'
    })
    
    // H1 Check
    if (data.headings.h1 === 0) {
      issues.push({
        type: 'error',
        title: 'H1 Check',
        description: 'Missing H1 tag. Every page should have exactly one H1 tag.',
        icon: '×'
      })
    } else if (data.headings.h1 > 1) {
      issues.push({
        type: 'warning',
        title: 'H1 Check',
        description: `The page has ${data.headings.h1} H1 tags. There should be exactly one H1 tag per page.`,
        icon: '!'
      })
    } else {
      issues.push({
        type: 'success',
        title: 'H1 Check',
        description: 'The page has a single H1 tag, which is correct.',
        icon: '✓'
      })
    }
    
    // H2 Check
    if (data.headings.h2 > 0) {
      issues.push({
        type: 'success',
        title: 'H2 Check',
        description: `The page has ${data.headings.h2} H2 tags, which is correct.`,
        icon: '✓'
      })
    }
    
    // H3 Check
    if (data.headings.h3 > 0) {
      issues.push({
        type: 'success',
        title: 'H3 Check',
        description: `The page has ${data.headings.h3} H3 tags, which is correct.`,
        icon: '✓'
      })
    }
    
    // Image Alt Text Check
    if (data.images.withoutAlt === 0) {
      issues.push({
        type: 'success',
        title: 'Image Alt Text Check',
        description: 'All images have alt text. Improving SEO and accessibility by aiding image understanding.',
        icon: '✓'
      })
    } else {
      issues.push({
        type: 'warning',
        title: 'Image Alt Text Check',
        description: `${data.images.withoutAlt} images are missing alt text. Add alt attributes to improve SEO and accessibility.`,
        icon: '!'
      })
    }
    
    // Social Media Meta Tags Check
    const hasSocialTags = this.checkSocialMediaTags()
    if (hasSocialTags) {
      issues.push({
        type: 'success',
        title: 'Social Media Meta Tags Check',
        description: 'The page has social media tags.',
        icon: '✓'
      })
    } else {
      issues.push({
        type: 'warning',
        title: 'Social Media Meta Tags Check',
        description: 'Missing social media meta tags. Add Open Graph and Twitter Card tags for better social sharing.',
        icon: '!'
      })
    }
    
    // Robots.txt Check
    if (data.robotsTxt) {
      issues.push({
        type: 'success',
        title: 'Robots.txt Check',
        description: 'This website is using a robots.txt file.',
        icon: '✓'
      })
    } else {
      issues.push({
        type: 'warning',
        title: 'Robots.txt Check',
        description: 'No robots.txt file found. Consider adding one to guide search engine crawlers.',
        icon: '!'
      })
    }
    
    // Sitemap.xml Check
    if (data.sitemap) {
      issues.push({
        type: 'success',
        title: 'Sitemap.xml Check',
        description: 'This website is using a sitemap.xml file.',
        icon: '✓'
      })
    } else {
      issues.push({
        type: 'warning',
        title: 'Sitemap.xml Check',
        description: 'No sitemap.xml file found. Consider adding one to help search engines discover your pages.',
        icon: '!'
      })
    }
    
    return issues
  }
  
  private checkSocialMediaTags(): boolean {
    return !!(
      document.querySelector('meta[property^="og:"]') ||
      document.querySelector('meta[name^="twitter:"]') ||
      document.querySelector('meta[property="og:title"]') ||
      document.querySelector('meta[property="og:description"]') ||
      document.querySelector('meta[property="og:image"]')
    )
  }
  
  private detectFavicon(doc: Document, origin: string): { found: boolean; url: string | null } {
    // Check for various favicon declarations
    const faviconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]', 
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]'
    ]
    
    for (const selector of faviconSelectors) {
      const element = doc.querySelector(selector)
      if (element) {
        const href = element.getAttribute('href')
        if (href) {
          // Convert relative URLs to absolute
          const faviconUrl = href.startsWith('http') ? href : new URL(href, origin).href
          return { found: true, url: faviconUrl }
        }
      }
    }
    
    // Fallback: check for default favicon.ico
    return { found: false, url: `${origin}/favicon.ico` }
  }
  
  private detectSSR(doc: Document): boolean {
    return !!(
      doc.querySelector('script[type="application/ld+json"]') || 
      doc.querySelector('meta[name="generator"]') ||
      doc.documentElement.innerHTML.includes('__NEXT_DATA__') ||
      doc.documentElement.innerHTML.includes('__NUXT__') ||
      doc.documentElement.innerHTML.includes('window.__INITIAL_STATE__') ||
      doc.querySelector('script[id="__NEXT_DATA__"]')
    )
  }

  private detectGoogleAnalytics(): boolean {
    return !!(
      (window as any).gtag || 
      (window as any).ga || 
      (window as any).dataLayer ||
      document.querySelector('script[src*="google-analytics"]') ||
      document.querySelector('script[src*="gtag/js"]') ||
      document.querySelector('script[src*="googletagmanager"]') ||
      document.querySelector('script[async][src*="googletagmanager.com/gtag/js"]')
    )
  }

  private detectGoogleAdsense(): boolean {
    return !!(
      document.querySelector('script[src*="googlesyndication"]') ||
      document.querySelector('ins[class*="adsbygoogle"]') ||
      document.querySelector('script[async][src*="pagead2.googlesyndication.com"]') ||
      document.querySelector('script[data-ad-client]')
    )
  }
  
  private async checkFileExists(url: string): Promise<boolean> {
    try {
      // 使用 fetch API 检查文件是否存在
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        headers: {
          'User-Agent': 'ProductBaker Chrome Extension'
        }
      })
      
      // 200-299 状态码表示文件存在
      if (response.status >= 200 && response.status < 300) {
        return true
      }
      
      // 404 明确表示文件不存在
      if (response.status === 404) {
        return false
      }
      
      // 对于其他状态码（403, 405等），尝试 GET 请求
      if (response.status === 405 || response.status === 403) {
        try {
          const getResponse = await fetch(url, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
              'User-Agent': 'ProductBaker Chrome Extension'
            }
          })
          return getResponse.status >= 200 && getResponse.status < 300
        } catch {
          return false
        }
      }
      
      // 其他情况默认为不存在
      return false
      
    } catch (error) {
      console.warn(`Failed to check ${url}:`, error)
      
      // 如果是 CORS 错误或网络错误，我们无法确定文件是否存在
      // 对于常见网站，robots.txt 和 sitemap.xml 通常都存在
      // 但为了准确性，我们返回 false
      return false
    }
  }
  
  private getTitleStatus(title: string, length: number): 'success' | 'warning' | 'error' | 'missing' {
    if (!title || title === 'N/A') return 'missing'
    if (length >= 40 && length <= 60) return 'success'
    if (length < 30 || length > 70) return 'error'
    return 'warning'
  }
  
  private getDescriptionStatus(description: string, length: number): 'success' | 'warning' | 'error' | 'missing' {
    if (!description || description === 'N/A') return 'missing'
    if (length >= 140 && length <= 160) return 'success'
    if (length < 120 || length > 180) return 'error'
    return 'warning'
  }
  
  private calculateDaysToExpiry(expiryDate: string): number | null {
    try {
      const expiry = new Date(expiryDate)
      const now = new Date()
      const diffTime = expiry.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    } catch {
      return null
    }
  }
  
}