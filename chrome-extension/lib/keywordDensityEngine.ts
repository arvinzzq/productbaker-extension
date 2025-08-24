export interface KeywordDensityResult {
  keyword: string
  count: number
  total: number
  density: number
  wordCount: number // 1word, 2words, etc.
}

export interface KeywordDensityAnalysis {
  oneWord: KeywordDensityResult[]
  twoWords: KeywordDensityResult[]
  threeWords: KeywordDensityResult[]
  fourWords: KeywordDensityResult[]
  fiveWords: KeywordDensityResult[]
  totalWords: number
}

export class KeywordDensityEngine {
  private static instance: KeywordDensityEngine
  private cache: Map<string, KeywordDensityAnalysis> = new Map()
  
  // 常见停用词
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
    'from', 'up', 'about', 'into', 'over', 'after', 'all', 'any', 'both', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'just', 'now', 'how', 'what', 'where', 'when', 'why',
    'who', 'which', 'while', 'before', 'after', 'above', 'below', 'between', 'through'
  ])
  
  public static getInstance(): KeywordDensityEngine {
    if (!KeywordDensityEngine.instance) {
      KeywordDensityEngine.instance = new KeywordDensityEngine()
    }
    return KeywordDensityEngine.instance
  }
  
  public analyzeKeywordDensity(): KeywordDensityAnalysis {
    const url = window.location.href
    
    // 检查缓存
    if (this.cache.has(url)) {
      return this.cache.get(url)!
    }
    
    // 提取页面文本内容
    const textContent = this.extractPageText()
    const words = this.tokenizeText(textContent)
    const totalWords = words.length
    
    // 分析不同长度的关键词
    const oneWord = this.analyzeNGrams(words, 1, totalWords)
    const twoWords = this.analyzeNGrams(words, 2, totalWords)
    const threeWords = this.analyzeNGrams(words, 3, totalWords)
    const fourWords = this.analyzeNGrams(words, 4, totalWords)
    const fiveWords = this.analyzeNGrams(words, 5, totalWords)
    
    const result: KeywordDensityAnalysis = {
      oneWord,
      twoWords,
      threeWords,
      fourWords,
      fiveWords,
      totalWords
    }
    
    // 缓存结果
    this.cache.set(url, result)
    
    return result
  }
  
  private extractPageText(): string {
    // 获取页面的主要文本内容，排除导航、广告等
    const elementsToExtract = [
      'main',
      'article', 
      '[role="main"]',
      '.content',
      '.post-content',
      '.entry-content',
      'h1, h2, h3, h4, h5, h6',
      'p'
    ]
    
    let textContent = ''
    
    // 优先提取主要内容区域
    for (const selector of elementsToExtract.slice(0, 4)) {
      const element = document.querySelector(selector)
      if (element) {
        textContent = element.innerText || element.textContent || ''
        if (textContent.trim().length > 100) {
          break
        }
      }
    }
    
    // 如果没有找到主要内容区域，提取所有标题和段落
    if (!textContent || textContent.trim().length < 100) {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        .map(el => el.innerText || el.textContent || '').join(' ')
      const paragraphs = Array.from(document.querySelectorAll('p'))
        .map(el => el.innerText || el.textContent || '').join(' ')
      textContent = headings + ' ' + paragraphs
    }
    
    // 最后备选：使用body的文本内容
    if (!textContent || textContent.trim().length < 50) {
      textContent = document.body.innerText || document.body.textContent || ''
    }
    
    return textContent
  }
  
  private tokenizeText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // 移除标点符号
      .replace(/\s+/g, ' ') // 标准化空格
      .trim()
      .split(' ')
      .filter(word => word.length > 2 && !this.stopWords.has(word)) // 过滤停用词和短词
  }
  
  private analyzeNGrams(words: string[], n: number, totalWords: number): KeywordDensityResult[] {
    const ngramCounts = new Map<string, number>()
    
    // 生成n-grams
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ')
      if (ngram.trim().length > 0) {
        ngramCounts.set(ngram, (ngramCounts.get(ngram) || 0) + 1)
      }
    }
    
    // 转换为结果数组并排序
    const results: KeywordDensityResult[] = Array.from(ngramCounts.entries())
      .filter(([keyword, count]) => count >= (n === 1 ? 2 : 1)) // 单词至少出现2次，词组至少出现1次
      .map(([keyword, count]) => ({
        keyword,
        count,
        total: totalWords,
        density: (count / totalWords) * 100,
        wordCount: n
      }))
      .sort((a, b) => b.count - a.count) // 按频次降序排列
      .slice(0, 30) // 增加到前30个
    
    return results
  }
  
  public clearCache(): void {
    this.cache.clear()
  }
  
  public getCachedAnalysis(url: string): KeywordDensityAnalysis | null {
    return this.cache.get(url) || null
  }
}