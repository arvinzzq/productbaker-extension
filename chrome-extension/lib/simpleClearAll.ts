// 清除所有 ProductBaker 数据 - 只使用 IndexedDB
import { storage } from './storage';

export async function clearAllData(): Promise<void> {
  console.log('🧹 开始清除所有 ProductBaker 数据...');
  
  try {
    // 使用 StorageManager 的 clear 方法清除数据
    await storage.clear();
    
    console.log('✅ 所有 ProductBaker 数据已清除完毕！');
  } catch (error) {
    console.error('❌ 清除数据时出错:', error);
    throw error;
  }
}