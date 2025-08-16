import { v4 as uuidv4 } from 'uuid';

export interface CustomOption {
  id: string;
  value: string;
  labelEn: string;
  labelZh: string;
  isCustom: true;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomOptionInput {
  value: string;
  labelEn: string;
  labelZh: string;
}

export interface UpdateCustomOptionInput {
  value?: string;
  labelEn?: string;
  labelZh?: string;
}

const CUSTOM_CATEGORIES_KEY = 'productbaker_custom_categories';
const CUSTOM_TAGS_KEY = 'productbaker_custom_tags';

export class CustomOptionsManager {
  private static instance: CustomOptionsManager;
  
  private constructor() {}
  
  public static getInstance(): CustomOptionsManager {
    if (!CustomOptionsManager.instance) {
      CustomOptionsManager.instance = new CustomOptionsManager();
    }
    return CustomOptionsManager.instance;
  }

  // Custom Categories Management
  async getCustomCategories(): Promise<CustomOption[]> {
    try {
      const result = await chrome.storage.local.get(CUSTOM_CATEGORIES_KEY);
      const categories = result[CUSTOM_CATEGORIES_KEY] || [];
      return categories.map((cat: any) => ({
        ...cat,
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to get custom categories:', error);
      return [];
    }
  }

  async saveCustomCategories(categories: CustomOption[]): Promise<void> {
    try {
      await chrome.storage.local.set({
        [CUSTOM_CATEGORIES_KEY]: categories
      });
    } catch (error) {
      console.error('Failed to save custom categories:', error);
      throw new Error('Failed to save custom categories');
    }
  }

  async addCustomCategory(input: CreateCustomOptionInput): Promise<CustomOption> {
    const category: CustomOption = {
      id: uuidv4(),
      ...input,
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const categories = await this.getCustomCategories();
    
    // Check for duplicate value
    if (categories.some(cat => cat.value === input.value)) {
      throw new Error('Category with this value already exists');
    }

    categories.push(category);
    await this.saveCustomCategories(categories);
    return category;
  }

  async updateCustomCategory(id: string, updates: UpdateCustomOptionInput): Promise<CustomOption> {
    const categories = await this.getCustomCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }

    // Check for duplicate value if value is being updated
    if (updates.value && categories.some(cat => cat.id !== id && cat.value === updates.value)) {
      throw new Error('Category with this value already exists');
    }

    const updatedCategory = {
      ...categories[categoryIndex],
      ...updates,
      updatedAt: new Date()
    };

    categories[categoryIndex] = updatedCategory;
    await this.saveCustomCategories(categories);
    return updatedCategory;
  }

  async deleteCustomCategory(id: string): Promise<void> {
    const categories = await this.getCustomCategories();
    const filteredCategories = categories.filter(cat => cat.id !== id);
    await this.saveCustomCategories(filteredCategories);
  }

  // Custom Tags Management
  async getCustomTags(): Promise<CustomOption[]> {
    try {
      const result = await chrome.storage.local.get(CUSTOM_TAGS_KEY);
      const tags = result[CUSTOM_TAGS_KEY] || [];
      return tags.map((tag: any) => ({
        ...tag,
        createdAt: new Date(tag.createdAt),
        updatedAt: new Date(tag.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to get custom tags:', error);
      return [];
    }
  }

  async saveCustomTags(tags: CustomOption[]): Promise<void> {
    try {
      await chrome.storage.local.set({
        [CUSTOM_TAGS_KEY]: tags
      });
    } catch (error) {
      console.error('Failed to save custom tags:', error);
      throw new Error('Failed to save custom tags');
    }
  }

  async addCustomTag(input: CreateCustomOptionInput): Promise<CustomOption> {
    const tag: CustomOption = {
      id: uuidv4(),
      ...input,
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const tags = await this.getCustomTags();
    
    // Check for duplicate value
    if (tags.some(t => t.value === input.value)) {
      throw new Error('Tag with this value already exists');
    }

    tags.push(tag);
    await this.saveCustomTags(tags);
    return tag;
  }

  async updateCustomTag(id: string, updates: UpdateCustomOptionInput): Promise<CustomOption> {
    const tags = await this.getCustomTags();
    const tagIndex = tags.findIndex(tag => tag.id === id);
    
    if (tagIndex === -1) {
      throw new Error('Tag not found');
    }

    // Check for duplicate value if value is being updated
    if (updates.value && tags.some(tag => tag.id !== id && tag.value === updates.value)) {
      throw new Error('Tag with this value already exists');
    }

    const updatedTag = {
      ...tags[tagIndex],
      ...updates,
      updatedAt: new Date()
    };

    tags[tagIndex] = updatedTag;
    await this.saveCustomTags(tags);
    return updatedTag;
  }

  async deleteCustomTag(id: string): Promise<void> {
    const tags = await this.getCustomTags();
    const filteredTags = tags.filter(tag => tag.id !== id);
    await this.saveCustomTags(filteredTags);
  }

  // Utility methods
  async getAllCategories(): Promise<Array<CustomOption | { value: string; labelEn: string; labelZh: string; isCustom?: false }>> {
    const { COMMON_CATEGORIES } = await import('./constants');
    const customCategories = await this.getCustomCategories();
    return [...COMMON_CATEGORIES, ...customCategories];
  }

  async getAllTags(): Promise<Array<CustomOption | { value: string; labelEn: string; labelZh: string; isCustom?: false }>> {
    const { COMMON_TAGS } = await import('./constants');
    const customTags = await this.getCustomTags();
    return [...COMMON_TAGS, ...customTags];
  }

  // Check if a value is custom
  async isCustomCategory(value: string): Promise<boolean> {
    const customCategories = await this.getCustomCategories();
    return customCategories.some(cat => cat.value === value);
  }

  async isCustomTag(value: string): Promise<boolean> {
    const customTags = await this.getCustomTags();
    return customTags.some(tag => tag.value === value);
  }
}

export const customOptionsManager = CustomOptionsManager.getInstance();