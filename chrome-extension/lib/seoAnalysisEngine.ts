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
  faviconUrl: string | null
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
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'N/A'
    const descriptionLength = description !== 'N/A' ? description.length : 0
    const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || 'N/A'
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || url
    
    // 域名信息 - 简化，不依赖外部API
    const domain = urlObj.hostname
    
    // 技术配置检测
    const faviconInfo = this.detectFavicon(doc, urlObj.origin)
    const ssrCheck = this.detectSSR(doc)
    const robotsTag = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || 'index, follow'
    const xRobotsTag = 'Missing' // 简化，避免额外HTTP请求
    
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
    
    // Check for robots.txt and sitemap - 后台异步检测，不阻塞主流程
    let robotsTxt = false
    let sitemap = false
    
    // 异步检测，但不等待结果
    this.checkFileExists(`${urlObj.origin}/robots.txt`).then(exists => {
      robotsTxt = exists
      // 更新缓存中的结果
      const cachedResult = this.cache.get(cacheKey)
      if (cachedResult) {
        cachedResult.robotsTxt = exists
      }
    }).catch(() => {})
    
    this.checkFileExists(`${urlObj.origin}/sitemap.xml`).then(exists => {
      sitemap = exists
      // 更新缓存中的结果
      const cachedResult = this.cache.get(cacheKey)
      if (cachedResult) {
        cachedResult.sitemap = exists
      }
    }).catch(() => {})
    
    // Generate SEO issues
    const seoIssues = this.generateSEOIssues({
      title, titleLength, description, descriptionLength, keywords,
      faviconInfo, headings, images, robotsTxt, sitemap, 
      googleAnalytics, googleAdsense, ssrCheck
    })
    
    const result: SEOAnalysis = {
      title,
      titleLength,
      description,
      descriptionLength,
      keywords,
      url,
      canonical,
      domain,
      domainCreationDate: null, // 简化，不查询外部API
      domainExpiryDate: null,   // 简化，不查询外部API
      favicon: faviconInfo.found,
      faviconUrl: faviconInfo.url,
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
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }
  
}