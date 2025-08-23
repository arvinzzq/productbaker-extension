import type { KeywordRoot } from '../types/keywordRoot';
import { StorageManager } from './storage';

const STORAGE_KEYS = {
  KEYWORD_ROOTS: 'productbaker_keyword_roots',
  SELECTED_KEYWORD_ROOT: 'productbaker_selected_keyword_root'
} as const;

export class KeywordRootManager {
  private static instance: KeywordRootManager;
  private storage: StorageManager;

  private constructor() {
    this.storage = new StorageManager();
  }

  public static getInstance(): KeywordRootManager {
    if (!KeywordRootManager.instance) {
      KeywordRootManager.instance = new KeywordRootManager();
    }
    return KeywordRootManager.instance;
  }

  async getKeywordRoots(): Promise<KeywordRoot[]> {
    try {
      console.log('📊 从存储加载关键词词根...');
      
      const keywordRoots = await this.storage.load<KeywordRoot[]>(STORAGE_KEYS.KEYWORD_ROOTS);
      
      if (!keywordRoots) {
        console.log('📊 存储中没有关键词词根数据，返回空数组');
        return [];
      }
      
      console.log(`📊 从存储加载了 ${keywordRoots.length} 个关键词词根`);
      
      // Convert date strings back to Date objects
      const processedKeywordRoots = keywordRoots.map(keywordRoot => ({
        ...keywordRoot,
        createdAt: new Date(keywordRoot.createdAt),
        updatedAt: new Date(keywordRoot.updatedAt)
      }));
      
      console.log('✅ 关键词词根数据处理完成');
      return processedKeywordRoots;
    } catch (error) {
      console.error('❌ 获取关键词词根数据失败:', error);
      throw new Error(`获取关键词词根数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveKeywordRoot(keywordRoot: Omit<KeywordRoot, 'id' | 'createdAt' | 'updatedAt'>): Promise<KeywordRoot> {
    try {
      const keywordRoots = await this.getKeywordRoots();
      
      const newKeywordRoot: KeywordRoot = {
        ...keywordRoot,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      keywordRoots.push(newKeywordRoot);
      await this.storage.save(STORAGE_KEYS.KEYWORD_ROOTS, keywordRoots);
      
      console.log('✅ 关键词词根保存成功:', newKeywordRoot.name);
      return newKeywordRoot;
    } catch (error) {
      console.error('❌ 保存关键词词根失败:', error);
      throw new Error(`保存关键词词根失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateKeywordRoot(id: string, updates: Partial<Omit<KeywordRoot, 'id' | 'createdAt'>>): Promise<KeywordRoot> {
    try {
      const keywordRoots = await this.getKeywordRoots();
      const index = keywordRoots.findIndex(kr => kr.id === id);
      
      if (index === -1) {
        throw new Error('关键词词根不存在');
      }
      
      const updatedKeywordRoot: KeywordRoot = {
        ...keywordRoots[index],
        ...updates,
        updatedAt: new Date()
      };
      
      keywordRoots[index] = updatedKeywordRoot;
      await this.storage.save(STORAGE_KEYS.KEYWORD_ROOTS, keywordRoots);
      
      console.log('✅ 关键词词根更新成功:', updatedKeywordRoot.name);
      return updatedKeywordRoot;
    } catch (error) {
      console.error('❌ 更新关键词词根失败:', error);
      throw new Error(`更新关键词词根失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async deleteKeywordRoot(id: string): Promise<void> {
    try {
      const keywordRoots = await this.getKeywordRoots();
      const filteredKeywordRoots = keywordRoots.filter(kr => kr.id !== id);
      
      if (filteredKeywordRoots.length === keywordRoots.length) {
        throw new Error('关键词词根不存在');
      }
      
      await this.storage.save(STORAGE_KEYS.KEYWORD_ROOTS, filteredKeywordRoots);
      
      // 如果删除的是当前选中的词根，清除选中状态
      const selectedId = await this.getSelectedKeywordRootId();
      if (selectedId === id) {
        await this.setSelectedKeywordRootId(null);
      }
      
      console.log('✅ 关键词词根删除成功');
    } catch (error) {
      console.error('❌ 删除关键词词根失败:', error);
      throw new Error(`删除关键词词根失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getSelectedKeywordRootId(): Promise<string | null> {
    return await this.storage.load<string>(STORAGE_KEYS.SELECTED_KEYWORD_ROOT);
  }

  async setSelectedKeywordRootId(id: string | null): Promise<void> {
    if (id) {
      await this.storage.save(STORAGE_KEYS.SELECTED_KEYWORD_ROOT, id);
    } else {
      await this.storage.remove(STORAGE_KEYS.SELECTED_KEYWORD_ROOT);
    }
  }

  async getSelectedKeywordRoot(): Promise<KeywordRoot | null> {
    try {
      const selectedId = await this.getSelectedKeywordRootId();
      if (!selectedId) return null;
      
      const keywordRoots = await this.getKeywordRoots();
      return keywordRoots.find(kr => kr.id === selectedId) || null;
    } catch (error) {
      console.error('❌ 获取选中的关键词词根失败:', error);
      return null;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Google Trends URL generation
  generateGoogleTrendsUrl(keywords: string[], options?: {
    geo?: string;
    timeframe?: string;
    category?: string;
  }): string {
    // Google Trends supports maximum 5 keywords for comparison
    const limitedKeywords = keywords.slice(0, 5);
    
    if (limitedKeywords.length === 0) {
      throw new Error('至少需要一个关键词');
    }

    const baseUrl = 'https://trends.google.com/trends/explore';
    const params = new URLSearchParams();

    // Build query parameter
    const query = {
      q: limitedKeywords.map(keyword => ({ query: keyword.trim(), geo: options?.geo || '' })),
      date: options?.timeframe || 'today 12-m',
      geo: options?.geo || '',
      ...(options?.category && { cat: options.category })
    };

    params.append('q', limitedKeywords.map(k => k.trim()).join(','));
    
    if (options?.geo) {
      params.append('geo', options.geo);
    }
    
    if (options?.timeframe) {
      params.append('date', options.timeframe);
    }
    
    if (options?.category) {
      params.append('cat', options.category);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  // Batch generate Google Trends URLs for keyword root groups
  async generateBatchGoogleTrendsUrls(keywordRootId: string, options?: {
    geo?: string;
    timeframe?: string;
    category?: string;
  }): Promise<string[]> {
    try {
      const keywordRoots = await this.getKeywordRoots();
      const keywordRoot = keywordRoots.find(kr => kr.id === keywordRootId);
      
      if (!keywordRoot) {
        throw new Error('关键词词根不存在');
      }

      const { keywords } = keywordRoot;
      const urls: string[] = [];
      
      // Split keywords into groups of 5 (Google Trends limit)
      for (let i = 0; i < keywords.length; i += 5) {
        const keywordGroup = keywords.slice(i, i + 5);
        const url = this.generateGoogleTrendsUrl(keywordGroup, options);
        urls.push(url);
      }

      return urls;
    } catch (error) {
      console.error('❌ 生成批量Google Trends URL失败:', error);
      throw new Error(`生成批量Google Trends URL失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Open Google Trends in new tabs
  async openGoogleTrends(keywordRootId: string, options?: {
    geo?: string;
    timeframe?: string;
    category?: string;
  }): Promise<void> {
    try {
      const urls = await this.generateBatchGoogleTrendsUrls(keywordRootId, options);
      
      // Open each URL in a new tab
      for (const url of urls) {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
          // Use Chrome extension API if available
          chrome.tabs.create({ url, active: false });
        } else {
          // Fallback to window.open
          window.open(url, '_blank');
        }
      }
      
      console.log(`✅ 已打开 ${urls.length} 个 Google Trends 页面`);
    } catch (error) {
      console.error('❌ 打开Google Trends失败:', error);
      throw new Error(`打开Google Trends失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Export keyword roots
  async exportKeywordRoots(): Promise<string> {
    try {
      const keywordRoots = await this.getKeywordRoots();
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        keywordRoots: keywordRoots
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ 导出关键词词根失败:', error);
      throw new Error(`导出关键词词根失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Import keyword roots
  async importKeywordRoots(jsonData: string): Promise<{ imported: number; errors: string[] }> {
    try {
      const importData = JSON.parse(jsonData);
      const errors: string[] = [];
      let imported = 0;

      if (!importData.keywordRoots || !Array.isArray(importData.keywordRoots)) {
        throw new Error('无效的数据格式');
      }

      const existingKeywordRoots = await this.getKeywordRoots();
      const newKeywordRoots: KeywordRoot[] = [...existingKeywordRoots];

      for (const item of importData.keywordRoots) {
        try {
          // Validate required fields
          if (!item.name || !item.keywords || !Array.isArray(item.keywords)) {
            errors.push(`跳过无效项: ${item.name || '未命名'}`);
            continue;
          }

          // Check for duplicates
          const exists = existingKeywordRoots.some(kr => kr.name === item.name);
          if (exists) {
            errors.push(`跳过重复项: ${item.name}`);
            continue;
          }

          const newKeywordRoot: KeywordRoot = {
            id: this.generateId(),
            name: item.name,
            keywords: item.keywords,
            description: item.description || '',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          newKeywordRoots.push(newKeywordRoot);
          imported++;
        } catch (itemError) {
          errors.push(`处理项目失败 ${item.name || '未知'}: ${itemError}`);
        }
      }

      if (imported > 0) {
        await this.storage.save(STORAGE_KEYS.KEYWORD_ROOTS, newKeywordRoots);
      }

      console.log(`✅ 导入完成: 成功 ${imported} 个，错误 ${errors.length} 个`);
      return { imported, errors };
    } catch (error) {
      console.error('❌ 导入关键词词根失败:', error);
      throw new Error(`导入关键词词根失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Clear all keyword roots
  async clearAllKeywordRoots(): Promise<void> {
    try {
      await this.storage.save(STORAGE_KEYS.KEYWORD_ROOTS, []);
      await this.storage.remove(STORAGE_KEYS.SELECTED_KEYWORD_ROOT);
      console.log('✅ 已清空所有关键词词根');
    } catch (error) {
      console.error('❌ 清空关键词词根失败:', error);
      throw new Error(`清空关键词词根失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const keywordRootManager = KeywordRootManager.getInstance();