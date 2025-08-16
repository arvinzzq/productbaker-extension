import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Upload, Link, X, Image, AlertTriangle, Settings, HardDrive, Download } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { imageUploadConfig } from '../../lib/imageUploadConfig';
import type { ImageUploadConfig } from '../../lib/imageUploadConfig';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  required?: boolean;
  error?: string;
  onConfigureUpload?: () => void; // Callback to open upload configuration
}

export function ImageUpload({
  value = '',
  onChange,
  onClear,
  placeholder = 'Enter image URL',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = 'Image',
  required = false,
  error,
  onConfigureUpload
}: ImageUploadProps) {
  // Initialize with local mode as default since we always use IndexedDB
  const [inputMode, setInputMode] = useState<'url' | 'upload' | 'local'>('local');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadConfig, setUploadConfig] = useState<ImageUploadConfig | null>(null);
  const canUseLocalStorage = true;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localFileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  // Load upload configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await imageUploadConfig.getConfig();
        setUploadConfig(config);
      } catch (error) {
        console.error('Failed to load upload config:', error);
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
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    
    // Validate file size
    if (file.size > maxSize) {
      alert(`File too large (${Math.round(file.size / 1024 / 1024)}MB > ${Math.round(maxSize / 1024 / 1024)}MB)`);
      return;
    }

    setIsLoading(true);
    try {
      // Convert file to base64
      const base64Data = await convertFileToBase64(file);
      
      // Store base64 data directly
      onChange(base64Data);
      
      console.log(`📁 Converted image to base64: ${(base64Data.length / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      alert('Failed to process image file');
    } finally {
      setIsLoading(false);
      if (localFileInputRef.current) {
        localFileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!uploadConfig?.enabled || !uploadConfig.apiUrl) {
      alert(t('uploadNotConfigured') || 'Image upload is not configured. Please configure an upload API endpoint in settings, or use image URLs to avoid consuming local storage space.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsLoading(true);
    try {
      const result = await imageUploadConfig.uploadImage(file, uploadConfig);
      
      if (result.success && result.imageUrl) {
        onChange(result.imageUrl);
      } else {
        alert(result.error || t('uploadFailed') || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(t('uploadFailed') || 'Upload failed');
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
  };

  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      
      if (isBase64) {
        // For base64 images, use the data URL directly
        link.href = value;
        link.download = `image_${Date.now()}.png`;
      } else {
        // For URL images, fetch and download
        fetch(value)
          .then(response => response.blob())
          .then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `image_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          })
          .catch(error => {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(value, '_blank');
          });
        return;
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(value, '_blank');
    }
  };

  const isBase64 = value.startsWith('data:');
  const hasValue = Boolean(value);

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {/* Mode Toggle */}
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

      {/* Upload Configuration Warning/Info */}
      {inputMode === 'upload' && (
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
      <div className="space-y-2">
        {inputMode === 'url' ? (
          <Input
            type="url"
            value={isBase64 ? '' : value}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={placeholder}
            className={error ? 'border-destructive' : ''}
            disabled={isBase64}
          />
        ) : inputMode === 'local' ? (
          <div className="relative">
            <input
              ref={localFileInputRef}
              type="file"
              accept={accept}
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
                    {isLoading ? 'Saving to local storage...' : 'Save to Local Storage'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click to select image file
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    📁 Images stored securely in your browser
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
                  {t('maxSizeInfo') || 'Max size'}: {Math.round((uploadConfig.maxFileSize || maxSize) / 1024 / 1024)}MB
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

      {/* Preview and Controls */}
      {hasValue && (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-muted rounded-md">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {/* Preview Image */}
              <div className="flex-shrink-0">
                <img
                  src={value}
                  alt="Preview"
                  className="w-10 h-10 object-cover rounded border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    console.warn('Image load error (expected for some base64 images):', e);
                  }}
                  onLoad={() => {
                    // Suppress any Chrome download warnings for base64 images
                    if (isBase64) {
                      console.log('✅ Base64 image loaded successfully');
                    }
                  }}
                />
              </div>
              
              {/* Source Info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium flex items-center">
                  <Image className="h-3 w-3 mr-1" />
                  {isBase64 ? 'Local file' : 'URL'}
                  {isBase64 && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      📁 Base64
                    </span>
                  )}
                </p>
                {!isBase64 && (
                  <p className="text-xs text-muted-foreground truncate" title={value}>
                    {value}
                  </p>
                )}
                {isBase64 && (
                  <p className="text-xs text-muted-foreground">
                    {(value.length / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="flex-shrink-0 h-8 w-8 p-0"
                title="Download image"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="flex-shrink-0 h-8 w-8 p-0"
                title="Remove image"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}