import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage';
import type { 
  BacklinkSite, 
  BacklinkSubmission, 
  CreateBacklinkSiteInput, 
  UpdateBacklinkSiteInput,
  CreateBacklinkSubmissionInput,
  UpdateBacklinkSubmissionInput,
  BacklinkStats 
} from '../types/backlink';

const SITES_STORAGE_KEY = 'productbaker_backlink_sites';
const SUBMISSIONS_STORAGE_KEY = 'productbaker_backlink_submissions';

export class BacklinkManager {
  private static instance: BacklinkManager;
  
  private constructor() {}
  
  public static getInstance(): BacklinkManager {
    if (!BacklinkManager.instance) {
      BacklinkManager.instance = new BacklinkManager();
    }
    return BacklinkManager.instance;
  }

  // Site Management
  async getSites(): Promise<BacklinkSite[]> {
    try {
      const sites = await storage.load<BacklinkSite[]>(SITES_STORAGE_KEY);
      if (!sites) {
        return [];
      }
      return sites.map((site: any) => ({
        ...site,
        createdAt: new Date(site.createdAt),
        updatedAt: new Date(site.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to get backlink sites:', error);
      throw new Error('Failed to load backlink sites');
    }
  }

  async saveSites(sites: BacklinkSite[]): Promise<void> {
    try {
      await storage.save(SITES_STORAGE_KEY, sites);
    } catch (error) {
      console.error('Failed to save backlink sites:', error);
      throw new Error('Failed to save backlink sites');
    }
  }

  async addSite(input: CreateBacklinkSiteInput): Promise<BacklinkSite> {
    const site: BacklinkSite = {
      id: uuidv4(),
      ...input,
      tags: input.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const sites = await this.getSites();
    sites.push(site);
    await this.saveSites(sites);
    return site;
  }

  async updateSite(id: string, updates: UpdateBacklinkSiteInput): Promise<BacklinkSite> {
    const sites = await this.getSites();
    const siteIndex = sites.findIndex(site => site.id === id);
    
    if (siteIndex === -1) {
      throw new Error('Site not found');
    }

    const updatedSite = {
      ...sites[siteIndex],
      ...updates,
      updatedAt: new Date()
    };

    sites[siteIndex] = updatedSite;
    await this.saveSites(sites);
    return updatedSite;
  }

  async deleteSite(id: string): Promise<void> {
    const sites = await this.getSites();
    const filteredSites = sites.filter(site => site.id !== id);
    await this.saveSites(filteredSites);

    // Also delete related submissions
    const submissions = await this.getSubmissions();
    const filteredSubmissions = submissions.filter(sub => sub.siteId !== id);
    await this.saveSubmissions(filteredSubmissions);
  }

  // Submission Management
  async getSubmissions(): Promise<BacklinkSubmission[]> {
    try {
      const submissions = await storage.load<BacklinkSubmission[]>(SUBMISSIONS_STORAGE_KEY);
      if (!submissions) {
        return [];
      }
      return submissions.map((sub: any) => ({
        ...sub,
        submittedAt: sub.submittedAt ? new Date(sub.submittedAt) : undefined,
        approvedAt: sub.approvedAt ? new Date(sub.approvedAt) : undefined,
        rejectedAt: sub.rejectedAt ? new Date(sub.rejectedAt) : undefined,
        removedAt: sub.removedAt ? new Date(sub.removedAt) : undefined,
        reviewedAt: sub.reviewedAt ? new Date(sub.reviewedAt) : undefined,
        lastStatusChange: sub.lastStatusChange ? new Date(sub.lastStatusChange) : undefined,
        createdAt: new Date(sub.createdAt),
        updatedAt: new Date(sub.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to get backlink submissions:', error);
      throw new Error('Failed to load backlink submissions');
    }
  }

  async saveSubmissions(submissions: BacklinkSubmission[]): Promise<void> {
    try {
      await storage.save(SUBMISSIONS_STORAGE_KEY, submissions);
    } catch (error) {
      console.error('Failed to save backlink submissions:', error);
      throw new Error('Failed to save backlink submissions');
    }
  }

  async addSubmission(input: CreateBacklinkSubmissionInput): Promise<BacklinkSubmission> {
    const submission: BacklinkSubmission = {
      id: uuidv4(),
      ...input,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const submissions = await this.getSubmissions();
    submissions.push(submission);
    await this.saveSubmissions(submissions);
    return submission;
  }

  async updateSubmission(id: string, updates: UpdateBacklinkSubmissionInput): Promise<BacklinkSubmission> {
    const submissions = await this.getSubmissions();
    const submissionIndex = submissions.findIndex(sub => sub.id === id);
    
    if (submissionIndex === -1) {
      throw new Error('Submission not found');
    }

    const updatedSubmission = {
      ...submissions[submissionIndex],
      ...updates,
      updatedAt: new Date()
    };

    submissions[submissionIndex] = updatedSubmission;
    await this.saveSubmissions(submissions);
    return updatedSubmission;
  }

  async deleteSubmission(id: string): Promise<void> {
    const submissions = await this.getSubmissions();
    const filteredSubmissions = submissions.filter(sub => sub.id !== id);
    await this.saveSubmissions(filteredSubmissions);
  }

  // Statistics
  async getStats(): Promise<BacklinkStats> {
    const [sites, submissions] = await Promise.all([
      this.getSites(),
      this.getSubmissions()
    ]);

    const totalSites = sites.length;
    const pendingSubmissions = submissions.filter(sub => sub.status === 'pending').length;
    const approvedSubmissions = submissions.filter(sub => sub.status === 'approved').length;
    const rejectedSubmissions = submissions.filter(sub => sub.status === 'rejected').length;
    const submittedSubmissions = submissions.filter(sub => sub.status === 'submitted').length;
    const removedSubmissions = submissions.filter(sub => sub.status === 'removed').length;
    
    // Total submissions should only count actually submitted entries (not pending)
    const totalSubmissions = submittedSubmissions + approvedSubmissions + rejectedSubmissions + removedSubmissions;
    const approvalRate = totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;

    return {
      totalSites,
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      approvalRate
    };
  }

  // Check if current page is already submitted
  async checkSubmissionStatus(url: string, productId: string): Promise<BacklinkSubmission | null> {
    const submissions = await this.getSubmissions();
    return submissions.find(sub => 
      sub.submissionUrl === url && sub.productId === productId
    ) || null;
  }

  // Quick add current page
  async addCurrentPage(productId: string): Promise<{ site: BacklinkSite; submission: BacklinkSubmission }> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url || !tab.title) {
      throw new Error('Cannot get current page information');
    }

    const url = new URL(tab.url);
    const domain = url.hostname;
    
    // Check if site already exists
    const sites = await this.getSites();
    let site = sites.find(s => new URL(s.url).hostname === domain);

    if (!site) {
      // Create new site
      site = await this.addSite({
        name: tab.title,
        url: `${url.protocol}//${url.hostname}`,
        categories: ['Unknown'],
        description: `Auto-collected from ${tab.title}`
      });
    }

    // Create submission
    const submission = await this.addSubmission({
      siteId: site.id,
      productId,
      submissionUrl: tab.url
    });

    return { site, submission };
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await storage.remove(SITES_STORAGE_KEY);
      await storage.remove(SUBMISSIONS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear backlink data:', error);
      throw new Error('Failed to clear backlink data');
    }
  }
}

export const backlinkManager = BacklinkManager.getInstance();