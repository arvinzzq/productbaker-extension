import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useI18n } from '../hooks/useI18n';
import { ProductSelector } from './ProductSelector';
import { ProductDisplay } from './ProductDisplay';
import { ProductForm } from './ProductForm';
import { BacklinkManager } from './BacklinkManager';
import { KeywordTrends } from './KeywordTrends';
import { CustomOptionsManager } from './CustomOptionsManager';
import { SettingsManager } from './SettingsManager';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Plus, Package, Link2, Settings, MoreHorizontal, TrendingUp, X } from 'lucide-react';

export function SidePanelContent() {
  const { state, getSelectedProduct } = useProducts();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showBacklinks, setShowBacklinks] = useState(false);
  const [showKeywordTrends, setShowKeywordTrends] = useState(false);
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  const selectedProduct = getSelectedProduct();
  const { isLoading, error, products } = state;

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (productId: string) => {
    setEditingProduct(productId);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleShowBacklinks = () => {
    setShowBacklinks(true);
  };

  const handleCloseBacklinks = () => {
    setShowBacklinks(false);
  };

  const handleShowKeywordTrends = () => {
    setActiveTab('keywords');
    setShowKeywordTrends(true);
  };

  const handleCloseKeywordTrends = () => {
    setShowKeywordTrends(false);
  };

  const handleShowCustomOptions = () => {
    setShowCustomOptions(true);
  };

  const handleCloseCustomOptions = () => {
    setShowCustomOptions(false);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleClosePanel = async () => {
    try {
      // Notify background script that panel is being closed
      await chrome.runtime.sendMessage({ action: 'sidePanelClosed' });
      // Try to close the window
      window.close();
    } catch (error) {
      console.error('Failed to close side panel:', error);
    }
  };

  if (showSettings) {
    return (
      <div className="h-full flex flex-col">
        <SettingsManager onClose={handleCloseSettings} />
      </div>
    );
  }

  if (showCustomOptions) {
    return (
      <div className="h-full flex flex-col">
        <CustomOptionsManager onClose={handleCloseCustomOptions} />
      </div>
    );
  }

  if (showBacklinks) {
    return (
      <div className="h-full flex flex-col">
        <BacklinkManager onClose={handleCloseBacklinks} />
      </div>
    );
  }

  if (showKeywordTrends) {
    return (
      <div className="h-full flex flex-col">
        <KeywordTrends onClose={handleCloseKeywordTrends} />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="h-full flex flex-col">
        <ProductForm
          productId={editingProduct}
          onClose={handleCloseForm}
          onSave={handleCloseForm}
          onManageCustomOptions={handleShowCustomOptions}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <h1 className="text-base sm:text-lg font-semibold truncate">{t('appName')}</h1>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShowSettings}
              className="h-7 w-7 sm:h-8 sm:w-8"
            >
              <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClosePanel}
              className="h-7 w-7 sm:h-8 sm:w-8"
              title="Close Side Panel"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation and Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-3 sm:px-4 pt-2 border-b">
          <TabsList className="w-full">
            <TabsTrigger value="products" className="flex-1">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Keywords
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="products" className="flex-1 flex flex-col m-0 p-0">
          {/* Products Tab Header Controls */}
          <div className="p-3 sm:p-4 border-b space-y-2 sm:space-y-3">
            <ProductSelector />
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              <Button 
                onClick={handleAddProduct}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('addProduct')}</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <Button 
                onClick={handleShowBacklinks}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Link2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('backlinks')}</span>
                <span className="sm:hidden">Links</span>
              </Button>
            </div>
            <Button 
              onClick={handleShowCustomOptions}
              variant="ghost"
              size="sm"
              className="w-full text-xs sm:text-sm"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Categories & Tags</span>
              <span className="sm:hidden">Categories</span>
            </Button>
          </div>

          {/* Products Content */}
          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="p-2 sm:p-4">
                <Card className="border-destructive">
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-destructive break-words">{error}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {isLoading ? (
              <div className="p-3 sm:p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-xs sm:text-sm text-muted-foreground">{t('loading')}</span>
              </div>
            ) : products.length === 0 ? (
              <div className="p-3 sm:p-4 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] text-center">
                <Package className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-2 sm:mb-4" />
                <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">{t('noProducts')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 px-2">
                  {t('noProductsDesc')}
                </p>
                <Button onClick={handleAddProduct} size="sm" className="text-xs sm:text-sm">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  {t('addProduct')}
                </Button>
              </div>
            ) : selectedProduct ? (
              <ProductDisplay
                product={selectedProduct}
                onEdit={() => handleEditProduct(selectedProduct.id)}
              />
            ) : (
              <div className="p-3 sm:p-4 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] text-center">
                <Package className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-2 sm:mb-4" />
                <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">{t('pleaseSelectProduct')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground px-2">
                  {t('selectProductDesc')}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="flex-1 flex flex-col m-0 p-0 h-full">
          {/* Keywords Content */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="w-full max-w-md p-3 sm:p-4 flex flex-col items-center justify-center text-center">
              <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-2 sm:mb-4" />
              <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">Keyword Trends Analysis</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 px-2">
                Analyze keyword trends with Google Trends. Create groups of keywords and compare their popularity over time.
              </p>
              <Button onClick={handleShowKeywordTrends} size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}