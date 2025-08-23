// Helper functions for content scripts to interact with ProductBaker data

export interface WebsiteAnalysis {
  title: string
  domain: string
  url: string
  description: string
  keywords: string[]
  hasContactInfo: boolean
  hasSubmissionForm: boolean
  potentialBacklinkMatch: boolean
  socialLinks: string[]
  emailAddresses: string[]
}

export interface BacklinkOpportunity {
  type: 'potential' | 'confirmed' | 'submitted'
  confidence: 'low' | 'medium' | 'high'
  reason: string
  actionRequired?: string
}

// Analyze current webpage for backlink opportunities
export function analyzeWebsite(): WebsiteAnalysis {
  const url = window.location.href
  const domain = window.location.hostname
  const title = document.title
  
  // Get meta description
  const descriptionMeta = document.querySelector('meta[name="description"]')
  const description = descriptionMeta?.getAttribute('content') || ''
  
  // Extract keywords from meta tags and content
  const keywordsMeta = document.querySelector('meta[name="keywords"]')
  const metaKeywords = keywordsMeta?.getAttribute('content')?.split(',').map(k => k.trim()) || []
  
  // Get h1, h2 tags for additional keywords
  const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()).filter(Boolean) as string[]
  const keywords = [...metaKeywords, ...headings.slice(0, 5)].filter(k => k.length > 0)
  
  // Look for contact information
  const bodyText = document.body.textContent?.toLowerCase() || ''
  const hasContactInfo = bodyText.includes('contact') || 
                        bodyText.includes('email') || 
                        bodyText.includes('submit') ||
                        document.querySelector('[href^="mailto:"]') !== null
  
  // Look for submission forms
  const hasSubmissionForm = document.querySelector('form') !== null ||
                           bodyText.includes('submit') ||
                           bodyText.includes('add your') ||
                           bodyText.includes('list your')
  
  // Find social links
  const socialLinks = Array.from(document.querySelectorAll('a[href]'))
    .map(a => a.getAttribute('href'))
    .filter(href => href && (
      href.includes('twitter.com') ||
      href.includes('facebook.com') ||
      href.includes('linkedin.com') ||
      href.includes('github.com')
    )) as string[]
  
  // Extract email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const emailMatches = bodyText.match(emailRegex) || []
  const emailAddresses = [...new Set(emailMatches)].slice(0, 5)
  
  // Determine if this could be a backlink opportunity
  const backlinKeywords = ['directory', 'submit', 'list', 'add your', 'startup', 'tool', 'resource', 'showcase']
  const potentialBacklinkMatch = backlinKeywords.some(keyword => 
    title.toLowerCase().includes(keyword) || 
    description.toLowerCase().includes(keyword) ||
    bodyText.includes(keyword)
  )
  
  return {
    title,
    domain,
    url,
    description,
    keywords: keywords.slice(0, 10), // Limit to 10 keywords
    hasContactInfo,
    hasSubmissionForm,
    potentialBacklinkMatch,
    socialLinks: [...new Set(socialLinks)].slice(0, 5), // Limit and dedupe
    emailAddresses
  }
}

// Determine backlink opportunities based on website analysis
export function getBacklinkOpportunities(analysis: WebsiteAnalysis): BacklinkOpportunity[] {
  const opportunities: BacklinkOpportunity[] = []
  
  if (analysis.potentialBacklinkMatch) {
    if (analysis.hasSubmissionForm && analysis.hasContactInfo) {
      opportunities.push({
        type: 'potential',
        confidence: 'high',
        reason: 'Website has submission form and contact information',
        actionRequired: 'Analyze submission requirements'
      })
    } else if (analysis.hasSubmissionForm) {
      opportunities.push({
        type: 'potential',
        confidence: 'medium',
        reason: 'Website has submission form',
        actionRequired: 'Find contact information'
      })
    } else if (analysis.hasContactInfo) {
      opportunities.push({
        type: 'potential',
        confidence: 'medium',
        reason: 'Website has contact information',
        actionRequired: 'Check if they accept submissions'
      })
    } else {
      opportunities.push({
        type: 'potential',
        confidence: 'low',
        reason: 'Keywords suggest potential backlink opportunity',
        actionRequired: 'Research submission process'
      })
    }
  }
  
  // Check for common directory patterns
  const directoryKeywords = ['directory', 'list', 'catalog', 'showcase', 'gallery']
  if (directoryKeywords.some(keyword => 
    analysis.title.toLowerCase().includes(keyword) || 
    analysis.description.toLowerCase().includes(keyword)
  )) {
    opportunities.push({
      type: 'potential',
      confidence: 'medium',
      reason: 'Appears to be a directory or listing site'
    })
  }
  
  return opportunities
}

// Check if current website matches any known backlink sites
export async function checkExistingBacklinkSite(domain: string): Promise<any | null> {
  try {
    // Send message to background script to check against stored backlink sites
    const response = await chrome.runtime.sendMessage({
      action: 'checkBacklinkSite',
      domain: domain
    })
    
    return response.site || null
  } catch (error) {
    console.error('Failed to check existing backlink site:', error)
    return null
  }
}

// Get ProductBaker stats for display in floating panel
export async function getProductBakerStats(): Promise<{ products: number; backlinks: number; submissions: number }> {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getStats'
    })
    
    return response.stats || { products: 0, backlinks: 0, submissions: 0 }
  } catch (error) {
    console.error('Failed to get ProductBaker stats:', error)
    return { products: 0, backlinks: 0, submissions: 0 }
  }
}