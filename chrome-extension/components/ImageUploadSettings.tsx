import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  Upload, 
  Settings, 
  TestTube2,
  CheckCircle, 
  XCircle, 
  Info,
  AlertTriangle,
  Save,
  RotateCcw,
  Copy,
  ExternalLink
} from 'lucide-react';
import { imageUploadConfig, ImageUploadConfig } from '../lib/imageUploadConfig';

interface ImageUploadSettingsProps {
  onClose: () => void;
}

export function ImageUploadSettings({ onClose }: ImageUploadSettingsProps) {
  const { t } = useI18n();
  const [config, setConfig] = useState<ImageUploadConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const currentConfig = await imageUploadConfig.getConfig();
      setConfig(currentConfig);
    } catch (error) {
      console.error('Failed to load config:', error);
      alert(t('failedToLoadConfig') || 'Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    
    setIsSaving(true);
    try {
      await imageUploadConfig.saveConfig(config);
      alert(t('configSaved') || 'Configuration saved successfully!');
      setTestResult(null); // Clear test result after save
    } catch (error) {
      console.error('Failed to save config:', error);
      alert(t('failedToSaveConfig') || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!config) return;
    
    setIsTesting(true);
    try {
      const result = await imageUploadConfig.testConfig(config);
      setTestResult(result);
    } catch (error) {
      console.error('Failed to test config:', error);
      setTestResult({ success: false, message: 'Test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePresetChange = (presetName: string) => {
    if (!config || !presetName) return;
    
    const presets = imageUploadConfig.getPresetConfigs();
    const preset = presets.find(p => p.name === presetName);
    
    if (preset) {
      setConfig({
        ...config,
        ...preset.config
      });
      setSelectedPreset(presetName);
      setTestResult(null);
    }
  };

  const handleReset = () => {
    if (confirm(t('confirmResetConfig') || 'Reset to default configuration?')) {
      setConfig({
        enabled: false,
        apiUrl: '',
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        fieldName: 'file',
        responseUrlPath: 'url',
        maxFileSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        timeout: 30000
      });
      setSelectedPreset('');
      setTestResult(null);
    }
  };

  const addHeader = () => {
    if (!config) return;
    setConfig({
      ...config,
      headers: {
        ...config.headers,
        '': ''
      }
    });
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    if (!config) return;
    
    const newHeaders = { ...config.headers };
    if (oldKey !== newKey && oldKey in newHeaders) {
      delete newHeaders[oldKey];
    }
    if (newKey) {
      newHeaders[newKey] = value;
    }
    
    setConfig({
      ...config,
      headers: newHeaders
    });
  };

  const removeHeader = (key: string) => {
    if (!config) return;
    const newHeaders = { ...config.headers };
    delete newHeaders[key];
    setConfig({
      ...config,
      headers: newHeaders
    });
  };

  if (isLoading || !config) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t('loading') || 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          {t('imageUploadSettings') || 'Image Upload Settings'}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">
                {t('uploadConfigInfo') || 'Why Configure Image Upload?'}
              </p>
              <p className="text-blue-800 text-xs">
                {t('uploadConfigInfoDesc') || 'Storing images as base64 in local storage consumes significant space (a 1MB image becomes ~1.37MB). Configure an image upload API to save space and avoid storage quota issues.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enable/Disable Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>{t('uploadConfiguration') || 'Upload Configuration'}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-normal">
                {config.enabled ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t('enabled') || 'Enabled'}
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    {t('disabled') || 'Disabled'}
                  </Badge>
                )}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enabled"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="enabled" className="text-sm">
              {t('enableImageUpload') || 'Enable image upload via API'}
            </label>
          </div>
          
          {!config.enabled && (
            <p className="text-xs text-muted-foreground">
              {t('enableUploadDesc') || 'When disabled, only image URLs will be accepted to avoid consuming local storage space.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Preset Configurations */}
      {config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('presetConfigurations') || 'Preset Configurations'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectPreset') || 'Select a preset configuration...'} />
              </SelectTrigger>
              <SelectContent>
                {imageUploadConfig.getPresetConfigs().map((preset) => (
                  <SelectItem key={preset.name} value={preset.name}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {t('presetDesc') || 'Quick setup for popular image hosting services. You may need to modify API keys and endpoints.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* API Configuration */}
      {config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('apiConfiguration') || 'API Configuration'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                {t('apiUrl') || 'API URL'} *
              </label>
              <Input
                type="url"
                value={config.apiUrl}
                onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                placeholder="https://api.example.com/upload"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                {t('httpMethod') || 'HTTP Method'}
              </label>
              <Select value={config.method} onValueChange={(value: 'POST' | 'PUT') => setConfig({ ...config, method: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  {t('fieldName') || 'Field Name'}
                </label>
                <Input
                  value={config.fieldName}
                  onChange={(e) => setConfig({ ...config, fieldName: e.target.value })}
                  placeholder="file"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('fieldNameDesc') || 'Form field name for the image file'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">
                  {t('responseUrlPath') || 'Response URL Path'}
                </label>
                <Input
                  value={config.responseUrlPath}
                  onChange={(e) => setConfig({ ...config, responseUrlPath: e.target.value })}
                  placeholder="url"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('responseUrlPathDesc') || 'JSON path to extract image URL (e.g., "data.url")'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* HTTP Headers */}
      {config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              {t('httpHeaders') || 'HTTP Headers'}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHeader}
                className="h-7"
              >
                {t('addHeader') || 'Add Header'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(config.headers).map(([key, value]) => (
              <div key={key} className="flex space-x-2">
                <Input
                  placeholder={t('headerName') || 'Header name'}
                  value={key}
                  onChange={(e) => updateHeader(key, e.target.value, value)}
                  className="flex-1"
                />
                <Input
                  placeholder={t('headerValue') || 'Header value'}
                  value={value}
                  onChange={(e) => updateHeader(key, key, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHeader(key)}
                  className="text-destructive"
                >
                  ×
                </Button>
              </div>
            ))}
            
            <p className="text-xs text-muted-foreground">
              {t('headersDesc') || 'Add authentication headers or other required headers for your API.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Advanced Settings */}
      {config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('advancedSettings') || 'Advanced Settings'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                {t('maxFileSize') || 'Max File Size'} (MB)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={Math.round(config.maxFileSize / 1024 / 1024)}
                onChange={(e) => setConfig({ 
                  ...config, 
                  maxFileSize: parseInt(e.target.value) * 1024 * 1024 
                })}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                {t('timeout') || 'Timeout'} ({t('seconds') || 'seconds'})
              </label>
              <Input
                type="number"
                min="10"
                max="300"
                value={config.timeout / 1000}
                onChange={(e) => setConfig({ 
                  ...config, 
                  timeout: parseInt(e.target.value) * 1000 
                })}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                {t('allowedTypes') || 'Allowed File Types'}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {config.allowedTypes.map(type => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type.replace('image/', '')}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('allowedTypesDesc') || 'Currently supports: JPEG, PNG, GIF, WebP'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Configuration */}
      {config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('testConfiguration') || 'Test Configuration'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleTest}
              disabled={isTesting || !config.apiUrl}
              variant="outline"
              className="w-full"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  {t('testing') || 'Testing...'}
                </>
              ) : (
                <>
                  <TestTube2 className="h-4 w-4 mr-2" />
                  {t('testConnection') || 'Test Connection'}
                </>
              )}
            </Button>

            {testResult && (
              <div className={`p-3 rounded-md border ${
                testResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <p className={`text-sm ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResult.message}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('saving') || 'Saving...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('saveConfiguration') || 'Save Configuration'}
            </>
          )}
        </Button>
        
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={isSaving}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('reset') || 'Reset'}
        </Button>
      </div>

      {/* Help Links */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm space-y-2">
            <p className="font-medium">{t('needHelp') || 'Need Help?'}</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• {t('helpImgur') || 'For Imgur: Get a Client ID from https://api.imgur.com/oauth2/addclient'}</li>
              <li>• {t('helpCloudinary') || 'For Cloudinary: Create an unsigned upload preset in your dashboard'}</li>
              <li>• {t('helpCustom') || 'For custom APIs: Ensure CORS is enabled and the response includes the image URL'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}