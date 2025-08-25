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
      // Add a small delay to ensure message is processed
      await new Promise(resolve => setTimeout(resolve, 100));
      // Try to close the window
      window.close();
    } catch (error) {
      console.error('Failed to close side panel:', error);
      // Try to close anyway if message fails
      window.close();
    }
  };

  // Listen for close messages from drawer
  React.useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.action === 'closeSidePanelFromDrawer') {
        handleClosePanel();
      }
    };

    // Handle window beforeunload as backup
    const handleBeforeUnload = () => {
      try {
        chrome.runtime.sendMessage({ action: 'sidePanelClosed' });
      } catch (error) {
        console.error('Failed to send close message on unload:', error);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

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
    <div className="h-full flex flex-col drawer-3d">
      {/* Header */}
      <div className="p-3 sm:p-4 drawer-header">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-gradient truncate">{t('appName')}</h1>
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
        <div className="px-3 sm:px-4 py-2 border-b elevated-surface">
          <TabsList className="w-full professional-card">
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
          <div className="p-3 sm:p-4 border-b elevated-surface space-y-2 sm:space-y-3">
            <ProductSelector />
            <Button 
              onClick={handleAddProduct}
              size="sm"
              variant="floating"
              className="w-full text-xs sm:text-sm interactive-lift premium-glow mb-2 text-white font-semibold"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {t('addProduct')}
            </Button>
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              <Button 
                onClick={handleShowBacklinks}
                variant="secondary"
                size="sm"
                className="text-xs sm:text-sm card-elevated"
              >
                <Link2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('backlinks')}</span>
                <span className="sm:hidden">Links</span>
              </Button>
              <Button 
                onClick={handleShowCustomOptions}
                variant="secondary"
                size="sm"
                className="text-xs sm:text-sm card-elevated"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Categories</span>
                <span className="sm:hidden">Categories</span>
              </Button>
            </div>
          </div>

          {/* Products Content */}
          <div className="flex-1 overflow-y-auto bg-background">
            {error && (
              <div className="p-2 sm:p-4">
                <Card className="border-destructive card-elevated">
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
                <Button onClick={handleAddProduct} size="sm" variant="floating" className="text-xs sm:text-sm interactive-lift premium-glow text-white font-semibold">
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
          <div className="p-3 sm:p-4 bg-background">
            <div className="professional-card rounded-lg p-4 text-center">
              <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-3 mx-auto" />
              <h3 className="text-sm sm:text-base font-medium mb-2">Keyword Trends Analysis</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
                Analyze keyword trends with Google Trends. Create groups of keywords and compare their popularity over time.
              </p>
              <Button onClick={handleShowKeywordTrends} size="sm" variant="floating" className="interactive-lift text-white font-semibold">
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