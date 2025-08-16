import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Upload, Link, X, Plus, Image, AlertTriangle, Settings, HardDrive, Download } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { imageUploadConfig } from '../../lib/imageUploadConfig';
import type { ImageUploadConfig } from '../../lib/imageUploadConfig';
import { storage } from '../../lib/storage';

interface MultiImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // in bytes
  maxImages?: number;
  label?: string;
  error?: string;
  onConfigureUpload?: () => void; // Callback to open upload configuration
}

export function MultiImageUpload({
  value = [],
  onChange,
  placeholder = 'Enter image URL',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxImages = 10,
  label = 'Images',
  error,
  onConfigureUpload
}: MultiImageUploadProps) {
  // Initialize with smart default mode based on IndexedDB availability
  const [inputMode, setInputMode] = useState<'url' | 'upload' | 'local'>(() => {
    // Default to 'local' since we now use IndexedDB exclusively
    return 'local';
  });
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadConfig, setUploadConfig] = useState<ImageUploadConfig | null>(null);
  const [canUseLocalStorage, setCanUseLocalStorage] = useState(() => {
    // IndexedDB is now always available in supported environments
    return true;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localFileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  // Load upload configuration and check IndexedDB availability
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await imageUploadConfig.getConfig();
        setUploadConfig(config);
        
        // Test IndexedDB connection
        const isAvailable = await storage.testConnection();
        setCanUseLocalStorage(isAvailable);
      } catch (error) {
        console.error('Failed to load upload config:', error);
        setCanUseLocalStorage(false);
      }
    };
    loadConfig();
  }, []); // Load config only once on mount

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleLocalFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    if (files.length > remainingSlots) {
      alert(t('tooManyFiles', { max: remainingSlots.toString() }) || `You can only upload ${remainingSlots} more images`);
      return;
    }

    setIsLoading(true);
    try {
      const newImages: string[] = [];
      
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name}: Not a valid image file`);
          continue;
        }
        
        // Validate file size
        if (file.size > maxSize) {
          alert(`${file.name}: File too large (${Math.round(file.size / 1024 / 1024)}MB > ${Math.round(maxSize / 1024 / 1024)}MB)`);
          continue;
        }
        
        try {
          // Convert file to base64
          const base64Data = await convertFileToBase64(file);
          newImages.push(base64Data);
          
          console.log(`📁 Converted ${file.name} to base64: ${(base64Data.length / 1024).toFixed(2)} KB`);
        } catch (error) {
          console.error('Failed to convert image to base64:', error);
          alert(`Failed to process ${file.name}`);
        }
      }
      
      if (newImages.length > 0) {
        onChange([...value, ...newImages]);
      }
    } finally {
      setIsLoading(false);
      if (localFileInputRef.current) {
        localFileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (!uploadConfig?.enabled || !uploadConfig.apiUrl) {
      alert(t('uploadNotConfigured') || 'Image upload is not configured. Please configure an upload API endpoint in settings, or use image URLs to avoid consuming local storage space.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const remainingSlots = maxImages - value.length;
    if (files.length > remainingSlots) {
      alert(t('tooManyFiles', { max: remainingSlots.toString() }) || `You can only upload ${remainingSlots} more images`);
      return;
    }

    setIsLoading(true);
    try {
      const newImages: string[] = [];
      
      for (const file of files) {
        try {
          const result = await imageUploadConfig.uploadImage(file, uploadConfig);
          
          if (result.success && result.imageUrl) {
            newImages.push(result.imageUrl);
          } else {
            alert(`${file.name}: ${result.error || 'Upload failed'}`);
          }
        } catch (error) {
          console.error('Upload error for', file.name, ':', error);
          alert(`${file.name}: Upload failed`);
        }
      }

      if (newImages.length > 0) {
        onChange([...value, ...newImages]);
      }
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddUrl = () => {
    if (urlInput.trim() && !value.includes(urlInput.trim())) {
      if (value.length >= maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        return;
      }
      onChange([...value, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleDownloadImage = (imageUrl: string, index: number) => {
    try {
      const link = document.createElement('a');
      const isBase64 = imageUrl.startsWith('data:');
      
      if (isBase64) {
        // For base64 images, use the data URL directly
        link.href = imageUrl;
        link.download = `image_${index + 1}_${Date.now()}.png`;
      } else {
        // For URL images, fetch and download
        fetch(imageUrl)
          .then(response => response.blob())
          .then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `image_${index + 1}_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          })
          .catch(error => {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(imageUrl, '_blank');
          });
        return;
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddUrl();
    }
  };

  const canAddMore = value.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="text-sm font-medium">
        {label}
        <span className="text-muted-foreground ml-2">
          ({value.length}/{maxImages})
        </span>
      </label>

      {/* Mode Toggle */}
      {canAddMore && (
        <div className="flex space-x-2">
          <Button
            type="button"
            variant={inputMode === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('url')}
            className="flex-1"
          >
            <Link className="h-4 w-4 mr-2" />
            URL
          </Button>
          {canUseLocalStorage && (
            <Button
              type="button"
              variant={inputMode === 'local' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInputMode('local')}
              className="flex-1"
            >
              <HardDrive className="h-4 w-4 mr-2" />
              Local
            </Button>
          )}
          <Button
            type="button"
            variant={inputMode === 'upload' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('upload')}
            className="flex-1 relative"
          >
            <Upload className="h-4 w-4 mr-2" />
            API
            {!uploadConfig?.enabled && (
              <AlertTriangle className="h-3 w-3 ml-1 text-yellow-500" />
            )}
          </Button>
        </div>
      )}

      {/* Upload Configuration Warning/Info */}
      {canAddMore && inputMode === 'upload' && (
        <>
          {!uploadConfig?.enabled || !uploadConfig.apiUrl ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 flex-1">
                  <p className="font-medium">{t('uploadNotConfiguredTitle') || 'Upload Not Configured'}</p>
                  <p className="mt-1 text-xs">
                    {t('uploadNotConfiguredMessage') || 'Configure an image upload API to enable file uploads. This avoids storing large image files in local storage which consumes significant space.'}
                  </p>
                  {onConfigureUpload && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onConfigureUpload}
                      className="mt-2 h-7 text-xs"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      {t('configureUpload') || 'Configure Upload'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start space-x-2">
                <Settings className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">{t('uploadConfiguredTitle') || 'Upload Configured'}</p>
                  <p className="mt-1 text-xs">
                    {t('uploadConfiguredMessage') || 'Images will be uploaded to your configured API endpoint. This saves local storage space.'}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {t('uploadEndpoint') || 'Endpoint'}: {uploadConfig.apiUrl}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Input Area */}
      {canAddMore && (
        <div className="space-y-2">
          {inputMode === 'url' ? (
            <div className="flex space-x-2">
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className={`flex-1 ${error ? 'border-destructive' : ''}`}
              />
              <Button
                type="button"
                onClick={handleAddUrl}
                size="sm"
                disabled={!urlInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : inputMode === 'local' ? (
            <div className="relative">
              <input
                ref={localFileInputRef}
                type="file"
                accept={accept}
                multiple
                onChange={handleLocalFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isLoading}
              />
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isLoading 
                  ? 'border-gray-300 bg-gray-50' 
                  : 'border-green-300 hover:border-green-400 bg-green-50 hover:bg-green-100'
              }`}>
                <div className="flex flex-col items-center space-y-2">
                  <HardDrive className={`h-6 w-6 ${isLoading ? 'text-gray-400' : 'text-green-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {isLoading ? t('uploading') || 'Saving to local storage...' : 'Save to Local Storage'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {'Drag & drop files here, or click to select'}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      📁 Images stored securely in IndexedDB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isLoading || !uploadConfig?.enabled}
              />
              {uploadConfig?.enabled && uploadConfig.apiUrl ? (
                <div className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
                  error ? 'border-destructive' : 'border-border hover:border-primary'
                } ${isLoading ? 'opacity-50' : ''}`}>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? t('uploading') || 'Uploading...' : t('clickToUpload') || 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('maxFilesInfo', { max: (maxImages - value.length).toString() }) || `Max ${maxImages - value.length} more files`}, {Math.round((uploadConfig.maxFileSize || maxSize) / 1024 / 1024)}MB each
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-yellow-300 bg-yellow-50 rounded-md p-6 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <p className="text-sm text-yellow-800 font-medium">
                    {t('uploadNotConfigured') || 'Upload Not Configured'}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {t('configureUploadToEnable') || 'Configure upload API to enable file uploads'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      )}

      {/* Image List */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((image, index) => {
            const isBase64 = image.startsWith('data:');
            
            return (
              <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-md">
                {/* Preview Image */}
                <div className="flex-shrink-0">
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-12 h-12 object-cover rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      console.warn(`Image ${index + 1} load error (expected for some base64 images):`, e);
                    }}
                    onLoad={() => {
                      if (isBase64) {
                        console.log(`✅ Base64 image ${index + 1} loaded successfully`);
                      }
                    }}
                  />
                </div>

                {/* Image Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium flex items-center">
                    <Image className="h-3 w-3 mr-1" />
                    {isBase64 ? `Local file ${index + 1}` : `URL ${index + 1}`}
                    {isBase64 && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        📁 Base64
                      </span>
                    )}
                  </p>
                  {!isBase64 ? (
                    <p className="text-xs text-muted-foreground truncate" title={image}>
                      {image}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {(image.length / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadImage(image, index)}
                    className="flex-shrink-0 h-8 w-8 p-0"
                    title="Download image"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                    className="flex-shrink-0 h-8 w-8 p-0"
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!canAddMore && (
        <p className="text-sm text-muted-foreground">
          Maximum number of images reached
        </p>
      )}
    </div>
  );
}