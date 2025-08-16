// Image upload configuration manager for ProductBaker Chrome extension

export interface ImageUploadConfig {
  enabled: boolean;
  apiUrl: string;
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  fieldName: string; // The field name for the image file in the request
  responseUrlPath: string; // JSON path to extract image URL from response (e.g., 'data.url' or 'url')
  maxFileSize: number; // in bytes
  allowedTypes: string[]; // MIME types like ['image/jpeg', 'image/png']
  timeout: number; // in milliseconds
}

export interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

const DEFAULT_CONFIG: ImageUploadConfig = {
  enabled: false,
  apiUrl: '',
  method: 'POST',
  headers: {
    'Accept': 'application/json'
  },
  fieldName: 'file',
  responseUrlPath: 'url',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  timeout: 30000 // 30 seconds
};

export class ImageUploadConfigManager {
  private static instance: ImageUploadConfigManager;
  private readonly STORAGE_KEY = 'productbaker_image_upload_config';
  
  private constructor() {}
  
  public static getInstance(): ImageUploadConfigManager {
    if (!ImageUploadConfigManager.instance) {
      ImageUploadConfigManager.instance = new ImageUploadConfigManager();
    }
    return ImageUploadConfigManager.instance;
  }

  /**
   * Get current upload configuration
   */
  public async getConfig(): Promise<ImageUploadConfig> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      const config = result[this.STORAGE_KEY];
      
      if (!config) {
        return DEFAULT_CONFIG;
      }
      
      // Merge with defaults to ensure all fields exist
      return {
        ...DEFAULT_CONFIG,
        ...config,
        headers: {
          ...DEFAULT_CONFIG.headers,
          ...(config.headers || {})
        }
      };
    } catch (error) {
      console.error('Failed to get image upload config:', error);
      return DEFAULT_CONFIG;
    }
  }

  /**
   * Save upload configuration
   */
  public async saveConfig(config: Partial<ImageUploadConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const newConfig = {
        ...currentConfig,
        ...config,
        headers: {
          ...currentConfig.headers,
          ...(config.headers || {})
        }
      };
      
      await chrome.storage.local.set({
        [this.STORAGE_KEY]: newConfig
      });
    } catch (error) {
      console.error('Failed to save image upload config:', error);
      throw new Error('Failed to save upload configuration');
    }
  }

  /**
   * Test upload configuration by making a test request
   */
  public async testConfig(config: ImageUploadConfig): Promise<{ success: boolean; message: string }> {
    if (!config.apiUrl) {
      return { success: false, message: 'API URL is required' };
    }
    
    try {
      // Create a minimal test request to check if the API is accessible
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch(config.apiUrl, {
        method: 'OPTIONS', // Use OPTIONS to test CORS
        headers: config.headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 405) { // 405 means OPTIONS not allowed, but server is reachable
        return { success: true, message: 'Configuration test successful' };
      } else {
        return { success: false, message: `Server responded with status: ${response.status}` };
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { success: false, message: 'Request timeout' };
        }
        return { success: false, message: error.message };
      }
      return { success: false, message: 'Unknown error occurred' };
    }
  }

  /**
   * Upload image file using configured API
   */
  public async uploadImage(file: File, config?: ImageUploadConfig): Promise<UploadResponse> {
    const uploadConfig = config || await this.getConfig();
    
    if (!uploadConfig.enabled || !uploadConfig.apiUrl) {
      return {
        success: false,
        error: 'Image upload is not configured'
      };
    }

    // Validate file
    if (file.size > uploadConfig.maxFileSize) {
      return {
        success: false,
        error: `File size exceeds ${Math.round(uploadConfig.maxFileSize / 1024 / 1024)}MB limit`
      };
    }

    if (!uploadConfig.allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    try {
      // Create form data
      const formData = new FormData();
      formData.append(uploadConfig.fieldName, file);
      
      // Setup request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), uploadConfig.timeout);
      
      const requestHeaders = { ...uploadConfig.headers };
      // Don't set Content-Type for FormData, let browser set it with boundary
      delete requestHeaders['Content-Type'];
      
      const response = await fetch(uploadConfig.apiUrl, {
        method: uploadConfig.method,
        headers: requestHeaders,
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return {
          success: false,
          error: `Upload failed: ${response.status} ${response.statusText}`
        };
      }
      
      // Parse response
      const responseData = await response.json();
      
      // Extract image URL from response using path
      const imageUrl = this.extractValueFromPath(responseData, uploadConfig.responseUrlPath);
      
      if (!imageUrl) {
        return {
          success: false,
          error: `Could not find image URL in response at path: ${uploadConfig.responseUrlPath}`
        };
      }
      
      return {
        success: true,
        imageUrl: String(imageUrl)
      };
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { success: false, error: 'Upload timeout' };
        }
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Upload failed' };
    }
  }

  /**
   * Extract value from nested object using dot notation path
   */
  private extractValueFromPath(obj: any, path: string): any {
    if (!path) return obj;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current == null || typeof current !== 'object') {
        return null;
      }
      current = current[key];
    }
    
    return current;
  }

  /**
   * Get preset configurations for popular image hosting services
   */
  public getPresetConfigs(): Array<{ name: string; config: Partial<ImageUploadConfig> }> {
    return [
      {
        name: 'Custom API',
        config: {
          enabled: true,
          apiUrl: '',
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          fieldName: 'file',
          responseUrlPath: 'url'
        }
      },
      {
        name: 'Imgur (with API key)',
        config: {
          enabled: true,
          apiUrl: 'https://api.imgur.com/3/image',
          method: 'POST',
          headers: {
            'Authorization': 'Client-ID YOUR_CLIENT_ID',
            'Accept': 'application/json'
          },
          fieldName: 'image',
          responseUrlPath: 'data.link'
        }
      },
      {
        name: 'Cloudinary (with preset)',
        config: {
          enabled: true,
          apiUrl: 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload',
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          fieldName: 'file',
          responseUrlPath: 'secure_url'
        }
      }
    ];
  }
}

// Export singleton instance
export const imageUploadConfig = ImageUploadConfigManager.getInstance();