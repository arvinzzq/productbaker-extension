import type { Product } from '../types/product';

const STORAGE_KEYS = {
  PRODUCTS: 'productbaker_products',
  SETTINGS: 'productbaker_settings',
  SELECTED_PRODUCT: 'productbaker_selected'
} as const;

const DB_NAME = 'ProductBakerDB';
const STORE_NAME = 'productbaker_store';

export class StorageManager {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    // IndexedDB检查移到实际使用时进行
  }

  /**
   * Check if IndexedDB is supported
   */
  private checkIndexedDBSupport(): void {
    try {
      // 在Chrome扩展环境中，可能需要检查全局对象
      const hasIndexedDB = typeof indexedDB !== 'undefined' || 
                          (typeof window !== 'undefined' && 'indexedDB' in window) ||
                          (typeof self !== 'undefined' && 'indexedDB' in self) ||
                          (typeof global !== 'undefined' && 'indexedDB' in global);
      
      if (!hasIndexedDB) {
        throw new Error('当前环境不支持 IndexedDB，请使用支持的浏览器或检查扩展权限');
      }
      
      console.log('✅ IndexedDB 支持检查通过');
    } catch (error) {
      console.error('IndexedDB 支持检查失败:', error);
      throw new Error('当前浏览器不支持 IndexedDB，请使用 Chrome、Firefox、Edge 等现代浏览器');
    }
  }


  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    // 在使用时检查IndexedDB支持
    this.checkIndexedDBSupport();

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        // 获取 IndexedDB 实例
        const idb = indexedDB || 
                   (typeof window !== 'undefined' && window.indexedDB) ||
                   (typeof self !== 'undefined' && self.indexedDB);
        
        if (!idb) {
          reject(new Error('Unable to access IndexedDB API - please check browser permissions'));
          return;
        }

        // Always use version 2 to ensure proper upgrade
        const request = idb.open(DB_NAME, 2);
        
        request.onerror = () => {
          const error = request.error;
          console.error('IndexedDB 打开失败:', error);
          console.error('IndexedDB error details:', {
            name: error?.name,
            message: error?.message,
            code: (error as any)?.code,
            toString: error?.toString()
          });
          
          if (error?.name === 'UnknownError') {
            reject(new Error('IndexedDB 访问被拒绝，请检查浏览器设置或扩展权限'));
          } else if (error?.name === 'VersionError') {
            reject(new Error('IndexedDB 版本冲突，请清除浏览器数据后重试'));
          } else if (error?.name === 'QuotaExceededError') {
            reject(new Error('存储空间不足，请清理浏览器数据'));
          } else if (error?.name === 'InvalidStateError') {
            reject(new Error('IndexedDB 状态无效，请刷新页面重试'));
          } else {
            reject(new Error(`IndexedDB 初始化失败: ${error?.name || '未知错误'} - ${error?.message || error?.toString() || ''}`));
          }
        };
        
        request.onsuccess = () => {
          this.db = request.result;
          console.log('✅ IndexedDB initialized successfully');
          console.log('📊 Object stores:', Array.from(this.db.objectStoreNames));
          
          // 添加数据库错误处理
          this.db.onerror = (event) => {
            console.error('IndexedDB runtime error:', event);
          };
          
          resolve(request.result);
        };
        
        request.onupgradeneeded = (event) => {
          try {
            console.log('🔄 Database upgrade needed...');
            const db = (event.target as IDBOpenDBRequest).result;
            
            console.log('Current object stores:', Array.from(db.objectStoreNames));
            
            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'key' });
              console.log('✅ Created IndexedDB object store:', STORE_NAME);
            }
            
            console.log('After upgrade object stores:', Array.from(db.objectStoreNames));
          } catch (upgradeError) {
            console.error('IndexedDB upgrade failed:', upgradeError);
            reject(new Error(`Database upgrade failed: ${upgradeError}`));
          }
        };
        
        request.onblocked = () => {
          console.warn('IndexedDB 被阻塞，请关闭其他标签页');
          // 不要直接reject，而是等待一段时间
          setTimeout(() => {
            reject(new Error('IndexedDB 初始化超时，请关闭其他相关标签页后重试'));
          }, 5000);
        };
      } catch (initError) {
        console.error('IndexedDB 初始化异常:', initError);
        reject(new Error(`IndexedDB 初始化异常: ${initError}`));
      }
    });

    // Request persistent storage if supported (非阻塞)
    this.requestPersistentStorage().catch(e => {
      console.log('⚠️ 申请持久存储权限失败:', e);
    });

    return this.dbPromise;
  }

  /**
   * 申请持久存储权限
   */
  private async requestPersistentStorage(): Promise<boolean> {
    try {
      if (typeof navigator === 'undefined' || !navigator.storage) {
        console.log('⚠️ Navigator.storage API 不可用');
        return false;
      }

      if (navigator.storage.persist) {
        const isPersistent = await navigator.storage.persisted();
        if (!isPersistent) {
          const granted = await navigator.storage.persist();
          if (granted) {
            console.log('✅ 获得持久存储权限');
            return true;
          } else {
            console.log('⚠️ 持久存储权限被拒绝');
            this.showPersistentStorageHint();
            return false;
          }
        } else {
          console.log('✅ 已有持久存储权限');
          return true;
        }
      }
      return false;
    } catch (e) {
      console.log('⚠️ 申请持久存储权限时出错:', e);
      return false;
    }
  }

  /**
   * 显示持久存储权限提示
   */
  private showPersistentStorageHint(): void {
    // 延迟显示提示，避免阻塞初始化
    setTimeout(() => {
      console.log('💡 提示：为了确保数据不被浏览器自动清除，建议启用持久存储：');
      console.log('1. 点击地址栏左侧的锁形图标');
      console.log('2. 在权限设置中允许此扩展使用更多存储空间');
      console.log('3. 或者在 Chrome 设置 > 隐私和安全 > 网站设置 > 存储 中管理');
      
      // 如果在扩展环境中，可以尝试显示通知
      if (typeof chrome !== 'undefined' && chrome.notifications) {
        try {
          chrome.notifications.create('persistent-storage-hint', {
            type: 'basic',
            iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
            title: 'ProductBaker 存储提示',
            message: '为确保数据安全，建议在浏览器设置中允许此扩展使用更多存储空间'
          });
        } catch (notificationError) {
          console.log('无法显示通知:', notificationError);
        }
      }
    }, 2000);
  }

  /**
   * 手动申请持久存储权限（供UI调用）
   */
  async requestPersistentStorageManually(): Promise<{granted: boolean, message: string}> {
    try {
      if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.persist) {
        return {
          granted: false,
          message: '当前浏览器不支持持久存储 API'
        };
      }

      const isPersistent = await navigator.storage.persisted();
      if (isPersistent) {
        return {
          granted: true,
          message: '已获得持久存储权限'
        };
      }

      const granted = await navigator.storage.persist();
      if (granted) {
        return {
          granted: true,
          message: '持久存储权限申请成功！数据现在更安全了'
        };
      } else {
        return {
          granted: false,
          message: '持久存储权限被拒绝。请在浏览器设置中手动允许此扩展使用更多存储空间'
        };
      }
    } catch (error) {
      return {
        granted: false,
        message: `申请持久存储权限时出错: ${error}`
      };
    }
  }

  /**
   * 检查持久存储状态
   */
  async checkPersistentStorageStatus(): Promise<{
    supported: boolean;
    granted: boolean;
    quota?: number;
    usage?: number;
  }> {
    try {
      const supported = typeof navigator !== 'undefined' && 
                       !!navigator.storage && 
                       !!navigator.storage.persist;

      if (!supported) {
        return { supported: false, granted: false };
      }

      const granted = await navigator.storage.persisted();
      
      let quota = 0;
      let usage = 0;
      
      if (navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        quota = estimate.quota || 0;
        usage = estimate.usage || 0;
      }

      return {
        supported,
        granted,
        quota,
        usage
      };
    } catch (error) {
      console.error('检查持久存储状态失败:', error);
      return { supported: false, granted: false };
    }
  }

  async save<T>(key: string, data: T): Promise<void> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put({ 
        key, 
        data, 
        timestamp: Date.now() 
      });
      
      request.onerror = () => {
        console.error('IndexedDB 保存失败:', request.error);
        reject(new Error(`数据保存失败: ${request.error?.message || '未知错误'}`));
      };
      
      request.onsuccess = () => {
        console.log(`✅ 数据已保存到 IndexedDB: ${key}`);
        resolve();
      };
      
      transaction.onerror = () => {
        console.error('IndexedDB 事务失败:', transaction.error);
        reject(new Error(`事务失败: ${transaction.error?.message || '未知错误'}`));
      };
    });
  }

  async load<T>(key: string): Promise<T | null> {
    try {
      console.log(`📥 加载数据: ${key}`);
      const db = await this.initDB();
      
      return new Promise<T | null>((resolve, reject) => {
        try {
          const transaction = db.transaction([STORE_NAME], 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          
          const request = store.get(key);
          
          request.onerror = () => {
            const error = request.error;
            console.error('IndexedDB 加载失败:', error);
            console.error('Error details:', {
              name: error?.name,
              message: error?.message,
              code: (error as any)?.code
            });
            reject(new Error(`数据加载失败: ${error?.name || '未知错误'} - ${error?.message || ''}`));
          };
          
          request.onsuccess = () => {
            try {
              const result = request.result;
              if (result) {
                console.log(`✅ 从 IndexedDB 加载数据: ${key}`);
                resolve(this.deserializeDates(result.data));
              } else {
                console.log(`📥 IndexedDB 中没有数据: ${key}`);
                resolve(null);
              }
            } catch (processError) {
              console.error('处理加载结果时出错:', processError);
              reject(new Error(`处理数据失败: ${processError}`));
            }
          };
          
          transaction.onerror = () => {
            const error = transaction.error;
            console.error('IndexedDB 事务失败:', error);
            console.error('Transaction error details:', {
              name: error?.name,
              message: error?.message,
              code: (error as any)?.code
            });
            reject(new Error(`事务失败: ${error?.name || '未知错误'} - ${error?.message || ''}`));
          };

          transaction.onabort = () => {
            console.error('IndexedDB 事务被中止');
            reject(new Error('事务被中止'));
          };
        } catch (transactionError) {
          console.error('创建事务时出错:', transactionError);
          reject(new Error(`创建事务失败: ${transactionError}`));
        }
      });
    } catch (initError) {
      console.error('初始化数据库时出错:', initError);
      throw new Error(`初始化失败: ${initError instanceof Error ? initError.message : initError}`);
    }
  }
  
  /**
   * 反序列化日期对象
   */
  private deserializeDates<T>(data: T): T {
    if (!data) return data;
    
    try {
      const json = JSON.stringify(data);
      return JSON.parse(json, (key, value) => {
        // 检查是否是日期字符串
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value);
        }
        return value;
      });
    } catch {
      return data;
    }
  }

  async remove(key: string): Promise<void> {
    const db = await this.initDB();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.delete(key);
      
      request.onerror = () => {
        console.error('IndexedDB 删除失败:', request.error);
        reject(new Error(`数据删除失败: ${request.error?.message || '未知错误'}`));
      };
      
      request.onsuccess = () => {
        console.log(`✅ 从 IndexedDB 删除数据: ${key}`);
        resolve();
      };
    });
  }

  async clear(): Promise<void> {
    console.log('🧹 清除所有 ProductBaker 数据...');
    const db = await this.initDB();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.clear();
      
      request.onerror = () => {
        console.error('IndexedDB 清除失败:', request.error);
        reject(new Error(`数据清除失败: ${request.error?.message || '未知错误'}`));
      };
      
      request.onsuccess = () => {
        console.log('✅ IndexedDB 数据清除完成');
        resolve();
      };
    });
  }

  async backup(): Promise<string> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.getAll();
      
      request.onerror = () => {
        console.error('IndexedDB 备份失败:', request.error);
        reject(new Error(`备份失败: ${request.error?.message || '未知错误'}`));
      };
      
      request.onsuccess = () => {
        const data: Record<string, any> = {};
        const results = request.result;
        
        results.forEach(item => {
          if (Object.values(STORAGE_KEYS).includes(item.key as any)) {
            data[item.key] = item.data;
          }
        });
        
        resolve(JSON.stringify(data, null, 2));
      };
    });
  }

  async restore(backup: string): Promise<void> {
    const data = JSON.parse(backup);
    const validData: Record<string, any> = {};
    
    // Filter valid keys
    Object.entries(data).forEach(([key, value]) => {
      if (Object.values(STORAGE_KEYS).includes(key as any)) {
        validData[key] = value;
      }
    });
    
    // Restore data
    for (const [key, value] of Object.entries(validData)) {
      await this.save(key, value);
    }
    
    console.log('✅ 数据恢复完成');
  }

  /**
   * 获取存储统计信息
   */
  async getStorageStats(): Promise<{
    totalSize: number;
    itemCount: number;
    quota: number;
    usage: number;
    available: number;
  }> {
    const db = await this.initDB();
    
    // 获取所有数据计算大小
    const allData = await new Promise<any[]>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    
    const totalSize = JSON.stringify(allData).length;
    const itemCount = allData.length;
    
    // 获取存储配额信息
    let quota = 0;
    let usage = 0;
    
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        quota = estimate.quota || 0;
        usage = estimate.usage || 0;
      }
    } catch (e) {
      console.warn('无法获取存储配额信息:', e);
    }
    
    return {
      totalSize,
      itemCount,
      quota,
      usage,
      available: quota - usage
    };
  }

  /**
   * 测试IndexedDB连接
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 测试IndexedDB连接...');
      const db = await this.initDB();
      console.log('✅ IndexedDB连接测试成功');
      return true;
    } catch (error) {
      console.error('❌ IndexedDB连接测试失败:', error);
      return false;
    }
  }

  // Product specific methods
  async getProducts(): Promise<Product[]> {
    try {
      console.log('📊 从存储加载产品...');
      
      // 先测试连接
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('IndexedDB 连接失败');
      }
      
      const products = await this.load<Product[]>(STORAGE_KEYS.PRODUCTS);
      
      if (!products) {
        console.log('📊 存储中没有产品数据，返回空数组');
        return [];
      }
      
      console.log(`📊 从存储加载了 ${products.length} 个产品`);
      
      // Convert date strings back to Date objects
      const processedProducts = products.map(product => ({
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      }));
      
      console.log('✅ 产品数据处理完成');
      return processedProducts;
    } catch (error) {
      console.error('❌ 获取产品数据失败:', error);
      console.error('Error details:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        stack: (error as any)?.stack
      });
      throw new Error(`获取产品数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveProducts(products: Product[]): Promise<void> {
    await this.save(STORAGE_KEYS.PRODUCTS, products);
  }

  async getSelectedProductId(): Promise<string | null> {
    return await this.load<string>(STORAGE_KEYS.SELECTED_PRODUCT);
  }

  async saveSelectedProductId(productId: string | null): Promise<void> {
    if (productId) {
      await this.save(STORAGE_KEYS.SELECTED_PRODUCT, productId);
    } else {
      await this.remove(STORAGE_KEYS.SELECTED_PRODUCT);
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
      console.log('✅ IndexedDB 连接已关闭');
    }
  }
}

export const storage = new StorageManager();