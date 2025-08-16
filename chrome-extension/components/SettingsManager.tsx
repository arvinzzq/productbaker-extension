import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useBacklinks } from '../hooks/useBacklinks';
import { useProducts } from '../hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Download, Upload, Trash2, AlertTriangle, HardDrive } from 'lucide-react';
import { StorageSettings } from './StorageSettings';
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
import { productManager } from '../lib/productManager';
import { backlinkManager } from '../lib/backlinkManager';
import { clearAllData as simpleClearAll } from '../lib/simpleClearAll';

interface SettingsManagerProps {
  onClose: () => void;
}

export function SettingsManager({ onClose }: SettingsManagerProps) {
  const { t } = useI18n();
  const { state: backlinkState, actions: backlinkActions } = useBacklinks();
  const productContext = useProducts();
  const { showToast, toastElement } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showStorageSettings, setShowStorageSettings] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleExportAllData = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        products: productContext.state.products,
        backlinks: {
          sites: backlinkState.sites,
          submissions: backlinkState.submissions
        },
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `productbaker-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // TODO: Implement data import functionality
        // This would need corresponding import methods in the managers
        console.log('Import data:', data);
      } catch (error) {
        console.error('Failed to import data:', error);
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  const handleClearAllData = async () => {
    setIsClearingData(true);
    try {
      // 使用简单粗暴的方法清空所有存储
      await simpleClearAll();
      
      // 立即清空 context 状态以更新 UI
      productContext.clearAllData();
      backlinkActions.clearAllData();
      
      // 显示成功提示
      showToast('所有数据已清除完毕！', 'success');
      
      setClearDialogOpen(false);
    } catch (error) {
      console.error('清除数据失败:', error);
      showToast('清除数据失败', 'error');
      
      // 如果清除失败，重新加载数据以确保一致性
      await Promise.all([
        productContext.loadProducts(),
        backlinkActions.loadBacklinks()
      ]);
    } finally {
      setIsClearingData(false);
    }
  };

  // Handle storage settings view
  if (showStorageSettings) {
    return <StorageSettings onClose={() => setShowStorageSettings(false)} />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleExportAllData}
                disabled={isExporting}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export All Data'}
              </Button>
              <Button 
                variant="outline"
                onClick={handleImportData}
                disabled={isImporting}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Data'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Export all your products and backlink data as a JSON file, or import data from a previous export.
            </p>
          </CardContent>
        </Card>

        {/* Storage Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <HardDrive className="h-4 w-4 mr-2" />
              {t('storageManagement') || 'Storage Management'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline"
              onClick={() => setShowStorageSettings(true)}
              className="w-full"
            >
              <HardDrive className="h-4 w-4 mr-2" />
              {t('manageStorage') || 'Manage Storage & Backups'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {t('storageManagementDesc') || 'View storage usage, manage data backups, and configure storage options.'}
            </p>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-bold">{productContext.state.products?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <div>
                <p className="text-lg font-bold">{backlinkState.sites?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Backlink Sites</p>
              </div>
              <div>
                <p className="text-lg font-bold">{backlinkState.submissions?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Submissions</p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {backlinkState.submissions?.filter(s => s.status === 'approved').length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-base text-destructive flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
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
                    This action will permanently delete:
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>All {productContext.state.products?.length || 0} products</li>
                      <li>All {backlinkState.sites?.length || 0} backlink sites</li>
                      <li>All {backlinkState.submissions?.length || 0} submissions</li>
                    </ul>
                    <p className="mt-3 text-destructive font-medium">
                      This action cannot be undone. Consider exporting your data first.
                    </p>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setClearDialogOpen(false)}
                    disabled={isClearingData}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleClearAllData}
                    disabled={isClearingData}
                    className="w-full sm:w-auto"
                  >
                    {isClearingData ? (
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
            <p className="text-xs text-muted-foreground mt-2">
              This will permanently delete all products, backlink sites, and submissions. This action cannot be undone.
            </p>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Extension:</span>
                <span>ProductBaker</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                ProductBaker helps you manage product information and track backlink submissions efficiently.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      {toastElement}
    </div>
  );
}