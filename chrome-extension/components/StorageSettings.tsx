import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useBacklinks } from '../hooks/useBacklinks';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Trash2,
  RefreshCw,
  Database
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { useToast } from './ui/toast';
import { storage } from '../lib/storage';
import { clearAllData as simpleClearAll } from '../lib/simpleClearAll';

interface StorageSettingsProps {
  onClose: () => void;
}

interface StorageStats {
  totalSize: number;
  itemCount: number;
  quota: number;
  usage: number;
  available: number;
}

export function StorageSettings({ onClose }: StorageSettingsProps) {
  const productContext = useProducts();
  const { state: backlinkState, actions: backlinkActions } = useBacklinks();
  const { showToast, toastElement } = useToast();
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [persistentStorageStatus, setPersistentStorageStatus] = useState<{
    supported: boolean;
    granted: boolean;
    quota?: number;
    usage?: number;
  } | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    loadStorageStats();
  }, []);

  const loadStorageStats = async () => {
    setIsLoading(true);
    try {
      const [stats, persistentStatus] = await Promise.all([
        storage.getStorageStats(),
        storage.checkPersistentStorageStatus()
      ]);
      setStorageStats(stats);
      setPersistentStorageStatus(persistentStatus);
    } catch (error) {
      console.error('Failed to load storage info:', error);
      showToast('Failed to load storage info', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAllData = async () => {
    setIsExporting(true);
    try {
      const backupData = await storage.backup();
      
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `productbaker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Data exported successfully!', 'success');
    } catch (error) {
      console.error('Failed to export data:', error);
      showToast('Failed to export data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportAllData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (!confirm('This will replace all existing data. Are you sure you want to continue?')) {
        return;
      }

      setIsImporting(true);
      try {
        const text = await file.text();
        await storage.restore(text);
        
        // 重新加载数据到上下文
        await Promise.all([
          productContext.loadProducts(),
          backlinkActions.loadBacklinks()
        ]);
        
        showToast('Data imported successfully!', 'success');
        await loadStorageStats(); // 刷新存储信息
      } catch (error) {
        console.error('Failed to import data:', error);
        showToast('Failed to import data: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      await simpleClearAll();
      
      // 立即清空 context 状态以更新 UI
      productContext.clearAllData();
      backlinkActions.clearAllData();
      
      showToast('All data has been cleared!', 'success');
      setClearDialogOpen(false);
      
      // 刷新存储信息显示
      setTimeout(async () => {
        await loadStorageStats();
      }, 200);
    } catch (error) {
      console.error('Failed to clear data:', error);
      showToast('Failed to clear data', 'error');
      
      // 如果清除失败，重新加载数据以确保一致性
      await Promise.all([
        productContext.loadProducts(),
        backlinkActions.loadBacklinks()
      ]);
    } finally {
      setIsClearing(false);
    }
  };

  const handleRequestPersistentStorage = async () => {
    setIsRequestingPermission(true);
    try {
      const result = await storage.requestPersistentStorageManually();
      showToast(result.message, result.granted ? 'success' : 'error');
      
      // 刷新状态
      if (result.granted) {
        await loadStorageStats();
      }
    } catch (error) {
      console.error('Failed to request persistent storage permission:', error);
      showToast('Error requesting permission', 'error');
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsagePercentage = (): number => {
    if (!storageStats || storageStats.quota === 0) return 0;
    return (storageStats.usage / storageStats.quota) * 100;
  };

  const getStorageStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStorageStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (percentage >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const usagePercentage = getUsagePercentage();

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Storage Management (IndexedDB)
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Storage Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {storageStats && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Total Usage</span>
                  <Badge variant="default" className="text-xs">
                    IndexedDB
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {getStorageStatusIcon(usagePercentage)}
                  <span className={`text-sm font-medium ${getStorageStatusColor(usagePercentage)}`}>
                    {formatBytes(storageStats.usage)} / {formatBytes(storageStats.quota)} ({usagePercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <Progress value={usagePercentage} className="w-full" />
              
              {usagePercentage >= 70 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">High storage usage</p>
                      <p className="text-xs mt-1">
                        Consider exporting data and cleaning up unnecessary items to free up space.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Data Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {storageStats && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Products</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{productContext.state.products?.length || 0}</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Backlink Sites</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{backlinkState.sites?.length || 0}</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Submission Records</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{backlinkState.submissions?.length || 0}</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium">Total Storage Items</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">{storageStats.itemCount}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(storageStats.totalSize)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Storage Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span className="text-sm">IndexedDB Local Storage</span>
              <Badge variant="default">Current</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Data is stored in the browser's IndexedDB, supporting large-capacity data storage. Data will not be lost when the browser is closed.
          </p>
          {storageStats && (
            <p className="text-xs text-muted-foreground">
              Available space: {formatBytes(storageStats.available)}
            </p>
          )}

          {/* 持久存储权限状态 */}
          {persistentStorageStatus && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">🔒 Persistent Storage Permission</p>
                    {persistentStorageStatus.granted ? (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        Granted
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                        Not Granted
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {persistentStorageStatus.granted 
                      ? 'Data is protected and will not be automatically cleared by the browser'
                      : 'Data may be automatically cleared by the browser when storage space is insufficient'
                    }
                  </p>
                </div>
                {!persistentStorageStatus.granted && persistentStorageStatus.supported && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleRequestPersistentStorage}
                    disabled={isRequestingPermission}
                  >
                    {isRequestingPermission ? (
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      '🔒'
                    )}
                    Request Permission
                  </Button>
                )}
              </div>
              
              {!persistentStorageStatus.supported && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  Current browser does not support persistent storage API, data security may be limited
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={handleExportAllData}
              disabled={isExporting || isLoading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isExporting ? (
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              ) : (
                <Download className="h-3 w-3 mr-2" />
              )}
              Export All Data
            </Button>

            <Button
              onClick={handleImportAllData}
              disabled={isImporting || isLoading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isImporting ? (
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              ) : (
                <Upload className="h-3 w-3 mr-2" />
              )}
              Import Data
            </Button>

            <Button
              onClick={loadStorageStats}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="w-full sm:col-span-2"
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-2" />
              )}
              Refresh Storage Info
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t">
            <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={isClearing || isLoading}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Clear All Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-destructive">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Clear All Data
                  </DialogTitle>
                  <DialogDescription className="text-left">
                    This operation will permanently delete:
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>All {productContext.state.products?.length || 0} products</li>
                      <li>All {backlinkState.sites?.length || 0} backlink sites</li>
                      <li>All {backlinkState.submissions?.length || 0} submission records</li>
                    </ul>
                    <p className="mt-3 text-destructive font-medium">
                      This operation cannot be undone, please export data first!
                    </p>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setClearDialogOpen(false)}
                    disabled={isClearing}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleClearAllData}
                    disabled={isClearing}
                    className="w-full sm:w-auto"
                  >
                    {isClearing ? (
                      'Clearing...'
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Data
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This operation cannot be undone, please export data first!
            </p>
          </div>
        </CardContent>
      </Card>
      {toastElement}
    </div>
  );
}